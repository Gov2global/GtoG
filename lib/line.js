// lib/line.js
// ✅ LINE Messaging API helper: axios + validation + smart retry/idempotency + debug

import axios from "axios";
import crypto from "crypto";

/** -------- Endpoints --------
 * Push:       POST /v2/bot/message/push
 * Multicast:  POST /v2/bot/message/multicast  (to ≤ 500 per request)
 * Reply:      POST /v2/bot/message/reply
 * Broadcast:  POST /v2/bot/message/broadcast
 */

const LINE_BASE_URL = "https://api.line.me";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_DEBUG = process.env.LINE_DEBUG === "1" || process.env.NODE_ENV === "development";

if (!CHANNEL_ACCESS_TOKEN) {
  throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env.");
}

const line = axios.create({
  baseURL: LINE_BASE_URL,
  headers: {
    Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// ---------------- utils ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function utf16Length(str = "") {
  return String(str).length; // JS length uses UTF-16 code units
}
function enforceTextLimit(text, max = 5000) {
  const t = String(text ?? "");
  return utf16Length(t) <= max ? t : t.slice(0, max);
}
function enforceAltTextLimit(alt, max = 400) {
  const t = String(alt ?? "");
  return utf16Length(t) <= max ? t : t.slice(0, max);
}
function trimToNull(s) {
  const t = String(s ?? "").trim();
  return t.length ? t : null;
}
function isHttpsUrl(u = "") {
  return /^https:\/\//i.test(String(u));
}
function looksLikeJpeg(u = "") {
  return /\.jpe?g($|\?)/i.test(String(u));
}
function isMonthlyLimit(res) {
  // LINE OA เมื่อหมดโควต้าเดือนมักตอบ 429 พร้อมข้อความแนว "monthly limit" / "message limit"
  const msg = (res?.data?.message || "").toLowerCase();
  return res?.status === 429 && (msg.includes("monthly limit") || msg.includes("message limit"));
}
function shouldRetryStatus(status) {
  // 429 (เรตลิมิตระยะสั้น), และพวก 5xx
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}
function newRetryKey() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Low-level requester with:
 * - Idempotency: X-Line-Retry-Key
 * - Retry for transient errors (429 rate, 5xx) with Retry-After/exp backoff + jitter
 * - Stop retry on monthly limit
 */
async function lineRequest({ method, url, data, maxRetries = 4, retryKey }) {
  const headers = retryKey ? { "X-Line-Retry-Key": retryKey } : {};
  let attempt = 0;

  for (;;) {
    try {
      if (LINE_DEBUG) {
        // ไม่ log token
        // eslint-disable-next-line no-console
        console.log(`[LINE ${method}] ${url} attempt=${attempt}`, JSON.stringify(data, null, 2));
      }
      const resp = await line.request({ method, url, data, headers });
      return resp;
    } catch (err) {
      const res = err.response;
      const status = res?.status;
      const reqId = res?.headers?.["x-line-request-id"];
      const retryAfterHeader = res?.headers?.["retry-after"];

      // หมดโควต้าเดือน → ไม่ retry
      if (isMonthlyLimit(res)) {
        const detail = {
          code: "LINE_MONTHLY_LIMIT",
          status,
          data: res?.data,
          headers: res?.headers,
          requestId: reqId,
          message: err.message,
        };
        const e = new Error(`LINE API monthly limit: ${JSON.stringify(detail)}`);
        e.code = "LINE_MONTHLY_LIMIT";
        throw e;
      }

      // ไม่มี response (เน็ตล่ม/timeout) → ถือเป็น retryable
      const networkError = !res;

      if ((networkError || shouldRetryStatus(status)) && attempt < maxRetries) {
        // เคารพ Retry-After (วินาที) ถ้ามี
        const ra = Number(retryAfterHeader);
        const base = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 1000 * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 300);
        await sleep(base + jitter);
        attempt++;
        continue;
      }

      // ไม่ retry แล้ว → โยนรายละเอียดดี ๆ
      const detail = {
        status,
        data: res?.data,
        headers: res?.headers,
        requestId: reqId,
        message: err.message,
      };
      const e = new Error(`LINE API error: ${JSON.stringify(detail)}`);
      e.code = status === 429 ? "LINE_RATE_LIMITED" : "LINE_API_ERROR";
      throw e;
    }
  }
}

// --------------- message builders ---------------
export function textMessage(text) {
  const t = trimToNull(text);
  if (!t) {
    throw new Error("LINE text message is empty after trim.");
  }
  return {
    type: "text",
    text: enforceTextLimit(t),
  };
}

export function flexMessage(contents, altText = "📢 แจ้งเตือนจากระบบ") {
  const a = trimToNull(altText) || "📢 แจ้งเตือนจากระบบ";
  return {
    type: "flex",
    altText: enforceAltTextLimit(a, 400),
    contents, // Flex container object
  };
}

export function imageMessage(originalUrl, previewUrl) {
  if (!isHttpsUrl(originalUrl)) {
    throw new Error("originalContentUrl must be HTTPS.");
  }
  if (LINE_DEBUG && previewUrl && !looksLikeJpeg(previewUrl)) {
    // บางไคลเอนต์ของ LINE ชอบ JPEG สำหรับ preview มากกว่า
    // eslint-disable-next-line no-console
    console.warn("[LINE imageMessage] previewImageUrl is not JPEG; consider using a .jpg preview.");
  }
  return {
    type: "image",
    originalContentUrl: originalUrl,
    previewImageUrl: previewUrl || originalUrl,
  };
}

export function videoMessage(videoUrl, previewImageUrl) {
  return {
    type: "video",
    originalContentUrl: videoUrl,
    previewImageUrl,
  };
}

// --------------- core senders ---------------
function ensureMax5(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }
  if (messages.length > 5) {
    throw new Error("You can send up to 5 message objects per request.");
  }
}

export async function pushMessage(toUserId, messages) {
  ensureMax5(messages);
  const url = "/v2/bot/message/push";
  const retryKey = newRetryKey();
  const payload = { to: toUserId, messages };
  if (LINE_DEBUG) {
    // eslint-disable-next-line no-console
    console.log("[LINE PUSH] payload =", JSON.stringify(payload, null, 2));
  }
  await lineRequest({ method: "POST", url, data: payload, retryKey });
}

export async function multicastMessage(userIds, messages, notificationDisabled = false) {
  ensureMax5(messages);
  const url = "/v2/bot/message/multicast";
  const batches = chunkArray(userIds || [], 500); // LINE กำหนด to ≤ 500
  for (const to of batches) {
    const retryKey = newRetryKey();
    await lineRequest({
      method: "POST",
      url,
      data: { to, messages, notificationDisabled },
      retryKey,
    });
  }
}

export async function replyMessage(replyToken, messages, notificationDisabled = false) {
  ensureMax5(messages);
  const url = "/v2/bot/message/reply";
  const retryKey = newRetryKey();
  await lineRequest({
    method: "POST",
    url,
    data: { replyToken, messages, notificationDisabled },
    retryKey,
  });
}

export async function broadcastMessage(messages, notificationDisabled = false) {
  ensureMax5(messages);
  const url = "/v2/bot/message/broadcast";
  const retryKey = newRetryKey();
  await lineRequest({
    method: "POST",
    url,
    data: { messages, notificationDisabled },
    retryKey,
  });
}

// --------------- convenience wrappers ---------------
/**
 * Backward-compatible helper:
 *  - isFlex=false  => send Text
 *  - isFlex=true   => send Flex (message = contents)
 *  - ❗ ห้ามใช้ตัวนี้กับ image
 */
export async function sendLineMessage(lineUserId, message, isFlex = false, options = {}) {
  const msgs = isFlex
    ? [flexMessage(message, options.altText || "📢 แจ้งเตือนจากระบบ")]
    : [textMessage(message)];
  return pushMessage(lineUserId, msgs);
}

/** Media helpers */
export async function sendImage(lineUserId, originalUrl, previewUrl) {
  return pushMessage(lineUserId, [imageMessage(originalUrl, previewUrl)]);
}
export async function sendVideo(lineUserId, videoUrl, previewImageUrl) {
  return pushMessage(lineUserId, [videoMessage(videoUrl, previewImageUrl)]);
}

// --------------- job mapping helpers (optional แต่แนะนำใช้) ---------------
/** แปลงเอกสาร BroadcastSetting -> messages[] ที่ตรงสเปกของ LINE */
export function buildLineMessagesFromJob(job) {
  const type = job?.messageType;
  if (type === "text") {
    return [textMessage(job.message)];
  }
  if (type === "flex") {
    const alt = trimToNull(job.altText) || "📢 แจ้งเตือนจากระบบ";
    const contents = job.flexData?.type ? job.flexData : buildFlexContainerFromFields(job.flexData);
    return [flexMessage(contents, alt)];
  }
  if (type === "image") {
    const orig = job?.media?.originalContentUrl;
    const prev = job?.media?.previewImageUrl || orig;
    if (!orig) throw new Error("missing media.originalContentUrl");
    return [imageMessage(orig, prev)];
  }
  throw new Error(`Unsupported messageType: ${type}`);
}

/** ถ้า flexData จากฟอร์มยังไม่ใช่ Flex container ให้ห่อเป็น bubble ง่าย ๆ */
function buildFlexContainerFromFields(flexData = {}) {
  const title = trimToNull(flexData.title);
  const sections = Object.entries(flexData)
    .filter(([k, v]) => k !== "title" && trimToNull(v))
    .map(([k, v]) => ({
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: String(k), weight: "bold", size: "sm" },
        { type: "text", text: String(v), wrap: true, size: "sm" },
      ],
    }));

  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        ...(title ? [{ type: "text", text: title, weight: "bold", size: "lg", wrap: true }] : []),
        ...sections,
      ],
    },
  };
}

/** helper ส่งจาก job โดยตรง (ลดโอกาสเรียกผิดเป็น text) */
export async function sendFromJob(toUserId, job) {
  const messages = buildLineMessagesFromJob(job);
  return pushMessage(toUserId, messages);
}
