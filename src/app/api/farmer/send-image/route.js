// api/farmer/send-image

import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import AWS from "aws-sdk"; // ตัวอย่างใช้ S3

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { imgBase64, gapID } = req.body;
  if (!imgBase64) return res.status(400).json({ error: "No image" });

  // 1. แปลง base64 → buffer
  const matches = imgBase64.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: "Bad format" });
  const buffer = Buffer.from(matches[1], "base64");

  // 2. อัปโหลด S3 (สมมุติ config ไว้แล้ว)
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  const Key = `gap-application/${gapID || uuidv4()}.png`;

  await s3
    .putObject({
      Bucket: process.env.AWS_BUCKET,
      Key,
      Body: buffer,
      ContentType: "image/png",
      ACL: "public-read"
    })
    .promise();

  const publicUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

  // 3. ส่ง image message เข้า LINE OA
  const LINE_CHANNEL_TOKEN = process.env.LINE_TOKEN;
  const OA_USER_ID = process.env.OA_USER_ID; // ต้องเป็น userId หรือ groupId ที่จะ push

  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LINE_CHANNEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: OA_USER_ID,
      messages: [
        {
          type: "image",
          originalContentUrl: publicUrl,
          previewImageUrl: publicUrl,
        },
        {
          type: "text",
          text: `ใบสมัคร GAP ใหม่ #${gapID || ""}`
        }
      ]
    }),
  });

  res.status(200).json({ success: true });
}