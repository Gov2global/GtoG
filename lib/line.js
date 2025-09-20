// lib/line.js
import "server-only";
import axios from "axios";
import crypto from "crypto";

const LINE_BASE_URL = "https://api.line.me";
const LINE_DEBUG =
  process.env.LINE_DEBUG === "1" || process.env.NODE_ENV === "development";

let _lineAxios = null;
function getLineAxios() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN env.");
  if (!_lineAxios || _lineAxios.defaults.headers?.Authorization !== `Bearer ${token}`) {
    _lineAxios = axios.create({
      baseURL: LINE_BASE_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }
  return _lineAxios;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function newRetryKey() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function shouldRetryStatus(status) {
  return [429, 500, 502, 503, 504].includes(status);
}

async function lineRequest({ method, url, data, maxRetries = 4, retryKey }) {
  const headers = retryKey ? { "X-Line-Retry-Key": retryKey } : {};
  let attempt = 0;

  for (;;) {
    try {
      if (LINE_DEBUG) {
        console.log(`[LINE ${method}] ${url} attempt=${attempt}`, JSON.stringify(data || {}));
      }
      const resp = await getLineAxios().request({ method, url, data, headers });
      return resp;
    } catch (err) {
      const res = err.response;
      const status = res?.status;
      if ((shouldRetryStatus(status) || !res) && attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 300);
        await sleep(delay);
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

/** ---------------- Messages ---------------- */
export function textMessage(text) {
  return { type: "text", text: String(text) };
}

export async function pushMessage(toUserId, messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }
  const retryKey = newRetryKey();
  await lineRequest({
    method: "POST",
    url: "/v2/bot/message/push",
    data: { to: toUserId, messages },
    retryKey,
  });
}

/** ---------------- RichMenu ---------------- */
export async function setRichMenuToUser(userId, richMenuId) {
  if (!userId || !richMenuId) {
    throw new Error("userId and richMenuId are required.");
  }
  const retryKey = newRetryKey();
  const url = `/v2/bot/user/${userId}/richmenu/${richMenuId}`;
  const res = await lineRequest({ method: "POST", url, data: {}, retryKey });
  return res.data;
}

export async function unlinkRichMenuFromUser(userId) {
  if (!userId) throw new Error("userId is required.");
  const retryKey = newRetryKey();
  const url = `/v2/bot/user/${userId}/richmenu`;
  const res = await lineRequest({ method: "DELETE", url, retryKey });
  return res.data;
}

export async function getUserRichMenu(userId) {
  if (!userId) throw new Error("userId is required.");
  const url = `/v2/bot/user/${userId}/richmenu`;
  const res = await lineRequest({ method: "GET", url });
  return res.data; // { richMenuId: "xxx" }
}


// --- RichMenu Map ---
const RICHMENUS = {
  register: "richmenu-fc4e718786460aae6d82a6b4626492ec",
  เกษตรกร: "richmenu-16e17a02f240d93a616d16459f1d4372",
  การศึกษา: "richmenu-04cdf97f4f0e2b9a2ec76a6def97cd5c",
  ราชการ: "richmenu-728d7327a84ac897f0da1feee720464d",
  ท้องถิ่น: "richmenu-5d54c92a6c45110d76aafd4c0e4e2ab9",
  เอกชน: "richmenu-7e49f13ffed71dfa674a5cb978a1a06c",
};

/**
 * ตั้งค่า RichMenu ตามประเภทที่ลงทะเบียน (regType)
 * @param {string} userId - LINE User ID
 * @param {string} regType - ประเภท เช่น "เกษตรกร", "การศึกษา"
 */
export async function setRichMenuByType(userId, regType) {
  const richMenuId = RICHMENUS[regType] || RICHMENUS.register;
  return setRichMenuToUser(userId, richMenuId);
  
}


/** ---------------- Job Helpers ---------------- */

// แปลง job จาก BroadcastSetting ให้เป็น messages ที่ LINE API รับได้
export function buildLineMessagesFromJob(job) {
  if (!job) throw new Error("Job is required");

  const type = job.messageType;

  if (type === "text") {
    return [textMessage(job.message)];
  }

  if (type === "flex") {
    return [
      {
        type: "flex",
        altText: job.altText || "📢 แจ้งเตือนจากระบบ",
        contents: job.flexData, // flexData ต้องเป็น JSON ที่ valid
      },
    ];
  }

  if (type === "image") {
    return [
      {
        type: "image",
        originalContentUrl: job.media?.originalContentUrl,
        previewImageUrl: job.media?.previewImageUrl || job.media?.originalContentUrl,
      },
    ];
  }

  throw new Error(`Unsupported messageType: ${type}`);
}

/**
 * ส่งข้อความจาก job ตรงๆ ไปยัง user
 * @param {string} toUserId - LINE User ID
 * @param {object} job - เอกสาร broadcast จาก Mongo
 */
export async function sendFromJob(toUserId, job) {
  const messages = buildLineMessagesFromJob(job);
  return pushMessage(toUserId, messages);
}

