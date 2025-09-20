// lib/line.js
// ✅ LINE Messaging API helper: axios + validation + smart retry/idempotency + debug (lazy env)

import "server-only"; // กันไม่ให้หลุดไปฝั่ง UI/import ใน client
import axios from "axios";
import crypto from "crypto";

/** -------- Endpoints --------
 * Push:       POST /v2/bot/message/push
 * Multicast:  POST /v2/bot/message/multicast  (to ≤ 500 per request)
 * Reply:      POST /v2/bot/message/reply
 * Broadcast:  POST /v2/bot/message/broadcast
 */

const LINE_BASE_URL = "https://api.line.me";
const LINE_DEBUG =
  process.env.LINE_DEBUG === "1" || process.env.NODE_ENV === "development";

// --------- Lazy axios instance ----------
let _lineAxios = null;
function getLineAxios() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env.");
  }

  if (
    !_lineAxios ||
    _lineAxios.defaults.headers?.Authorization !== `Bearer ${token}`
  ) {
    _lineAxios = axios.create({
      baseURL: LINE_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15_000,
    });
  }
  return _lineAxios;
}

// ---------------- utils ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const utf16Length = (str = "") => String(str).length;
const trimToNull = (s) => {
  const t = String(s ?? "").trim();
  return t.length ? t : null;
};

function enforceTextLimit(text, max = 5000) {
  const t = String(text ?? "");
  return utf16Length(t) <= max ? t : t.slice(0, max);
}
function enforceAltTextLimit(alt, max = 400) {
  const t = String(alt ?? "");
  return utf16Length(t) <= max ? t : t.slice(0, max);
}
function isHttpsUrl(u = "") {
  return /^https:\/\//i.test(String(u));
}
function looksLikeJpeg(u = "") {
  return /\.jpe?g($|\?)/i.test(String(u));
}
function isMonthlyLimit(res) {
  const msg = (res?.data?.message || "").toLowerCase();
  return (
    res?.status === 429 &&
    (msg.includes("monthly limit") || msg.includes("message limit"))
  );
}
function shouldRetryStatus(status) {
  return [429, 500, 502, 503, 504].includes(status);
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
        console.log(
          `[LINE ${method}] ${url} attempt=${attempt}`,
          JSON.stringify(data, null, 2)
        );
      }
      const resp = await getLineAxios().request({ method, url, data, headers });
      return resp;
    } catch (err) {
      const res = err.response;
      const status = res?.status;
      const reqId = res?.headers?.["x-line-request-id"];
      const retryAfterHeader = res?.headers?.["retry-after"];

      if (isMonthlyLimit(res)) {
        const detail = {
          code: "LINE_MONTHLY_LIMIT",
          status,
          data: res?.data,
          headers: res?.headers,
          requestId: reqId,
          message: err.message,
        };
        const e = new Error(
          `LINE API monthly limit: ${JSON.stringify(detail)}`
        );
        e.code = "LINE_MONTHLY_LIMIT";
        throw e;
      }

      const networkError = !res;

      if ((networkError || shouldRetryStatus(status)) && attempt < maxRetries) {
        const ra = Number(retryAfterHeader);
        const base =
          Number.isFinite(ra) && ra > 0
            ? ra * 1000
            : 1000 * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 300);
        await sleep(base + jitter);
        attempt++;
        continue;
      }

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
  if (!t) throw new Error("LINE text message is empty after trim.");
  return { type: "text", text: enforceTextLimit(t) };
}

export function flexMessage(contents, altText = "📢 แจ้งเตือนจากระบบ") {
  const a = trimToNull(altText) || "📢 แจ้งเตือนจากระบบ";
  return { type: "flex", altText: enforceAltTextLimit(a, 400), contents };
}

export function imageMessage(originalUrl, previewUrl) {
  if (!isHttpsUrl(originalUrl)) {
    throw new Error("originalContentUrl must be HTTPS.");
  }
  if (LINE_DEBUG && previewUrl && !looksLikeJpeg(previewUrl)) {
    console.warn(
      "[LINE imageMessage] previewImageUrl is not JPEG; consider using a .jpg preview."
    );
  }
  return {
    type: "image",
    originalContentUrl: originalUrl,
    previewImageUrl: previewUrl || originalUrl,
  };
}

export function videoMessage(videoUrl, previewImageUrl) {
  return { type: "video", originalContentUrl: videoUrl, previewImageUrl };
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
    console.log("[LINE PUSH] payload =", JSON.stringify(payload, null, 2));
  }
  await lineRequest({ method: "POST", url, data: payload, retryKey });
}

export async function multicastMessage(
  userIds,
  messages,
  notificationDisabled = false
) {
  ensureMax5(messages);
  const url = "/v2/bot/message/multicast";
  const batches = chunkArray(userIds || [], 500);
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

export async function replyMessage(
  replyToken,
  messages,
  notificationDisabled = false
) {
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
export async function sendLineMessage(lineUserId, message, isFlex = false, options = {}) {
  const msgs = isFlex
    ? [flexMessage(message, options.altText || "📢 แจ้งเตือนจากระบบ")]
    : [textMessage(message)];
  return pushMessage(lineUserId, msgs);
}

export async function sendImage(lineUserId, originalUrl, previewUrl) {
  return pushMessage(lineUserId, [imageMessage(originalUrl, previewUrl)]);
}
export async function sendVideo(lineUserId, videoUrl, previewImageUrl) {
  return pushMessage(lineUserId, [videoMessage(videoUrl, previewImageUrl)]);
}

// --------------- job mapping helpers ---------------
export function buildLineMessagesFromJob(job) {
  const type = job?.messageType;
  if (type === "text") return [textMessage(job.message)];
  if (type === "flex") {
    const alt = trimToNull(job.altText) || "📢 แจ้งเตือนจากระบบ";
    const contents = job.flexData?.type
      ? job.flexData
      : buildFlexContainerFromFields(job.flexData);
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
        ...(title
          ? [{ type: "text", text: title, weight: "bold", size: "lg", wrap: true }]
          : []),
        ...sections,
      ],
    },
  };
}

export async function sendFromJob(toUserId, job) {
  const messages = buildLineMessagesFromJob(job);
  return pushMessage(toUserId, messages);
}

/** optional: ใช้ใน health check เพื่อ assert ว่ามี ENV ก่อนยิงจริง */
export function assertLineEnv() {
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env.");
  }
}
