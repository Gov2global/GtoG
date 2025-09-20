// api/debug/s3

import { NextResponse } from "next/server";
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const region = process.env.REGION_AWS;
    const bucket = process.env.S3_BUCKET_NAME_AWS;
    const accessKeyId = process.env.ACCESS_KEY_ID_AWS;
    const secretAccessKey = process.env.SECRET_ACCESS_KEY_AWS;

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { ok: false, error: "❌ Missing REGION_AWS / S3_BUCKET_NAME_AWS / ACCESS_KEY_ID_AWS / SECRET_ACCESS_KEY_AWS" },
        { status: 500 }
      );
    }

    const s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // ✅ ตรวจสอบว่า bucket ใช้งานได้จริง
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));

    // ✅ list object ตัวอย่าง (แค่ 5 ไฟล์แรก)
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }));

    return NextResponse.json({
      ok: true,
      bucket,
      region,
      listedKeys: listed.Contents ? listed.Contents.map((o) => o.Key) : [],
    });
  } catch (err) {
    console.error("❌ S3 debug error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}