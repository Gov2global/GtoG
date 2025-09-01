
// src/lib/s3.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto"; // [ADDED]

// ===== ENV =====
const REGION = process.env.AWS_REGION;
const BUCKET = process.env.S3_BUCKET_NAME;
const PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE || `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const DEFAULT_PREFIX = process.env.S3_BROADCAST_IMG_PREFIX || "broadcast-img/";

if (!REGION || !BUCKET) {
  throw new Error("Missing AWS_REGION or S3_BUCKET_NAME env");
}

// ===== S3 Client =====
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ===== Helpers =====
function sanitizeFilename(name = "") {
  return String(name).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 80);
}
function extFromContentType(ct = "") {
  if (ct.includes("image/jpeg") || ct.includes("image/jpg")) return ".jpg";
  if (ct.includes("image/png")) return ".png";
  if (ct.includes("image/webp")) return ".webp";
  return "";
}

/** สร้าง Signed URL สำหรับ PUT ไปยัง S3 */
export async function getUploadSignedUrl({
  filename,
  contentType,
  prefix = DEFAULT_PREFIX,
}) {
  const safeBase = sanitizeFilename(filename || "image");
  const suffix =
    extFromContentType(contentType) ||
    (safeBase.match(/\.[a-z0-9]+$/i)?.[0] ?? "");
  const withoutExt = safeBase.replace(/\.[a-z0-9]+$/i, "");
  const key = `${prefix}${crypto.randomUUID?.() || Date.now()}-${withoutExt}${suffix}`;

  const params = {
    Bucket: BUCKET,
    Key: key,
    // ❗ อย่าตั้ง ACL ที่นี่
  };
  // ใส่ ContentType เฉพาะเมื่อมีจริง เพื่อเลี่ยง header mismatch
  if (contentType) params.ContentType = contentType;

  const command = new PutObjectCommand(params);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 นาที
  const publicUrl = `${PUBLIC_BASE}/${encodeURIComponent(key)}`;
  return { signedUrl, publicUrl, key };
}