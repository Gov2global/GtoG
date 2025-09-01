// api/aws/upload
import { NextResponse } from "next/server"; // [ADDED: ใช้ NextResponse กับ App Router]
import { getUploadSignedUrl } from "../../../../../lib/s3"; // [CHANGED: import จาก .js ไม่ใช่ .jsx]

// บังคับ Node runtime (aws-sdk v3 ใช้ได้บน node)
export const runtime = "nodejs"; // [ADDED]

export async function POST(req) { // [ADDED]
  try {
    const { filename, contentType } = await req.json(); // [ADDED]
    if (!filename || !contentType) { // [ADDED]
      return NextResponse.json({ error: "filename & contentType required" }, { status: 400 });
    }
    // บังคับ prefix ให้เป็น broadcast-img/
    const { signedUrl, publicUrl, key } = await getUploadSignedUrl({
      filename, contentType, prefix: process.env.S3_BROADCAST_IMG_PREFIX || "broadcast-img/",
    }); // [ADDED]

    return NextResponse.json({ signedUrl, publicUrl, key }); // [ADDED]
  } catch (e) {
    console.error("upload-url error:", e); // [ADDED]
    return NextResponse.json({ error: "failed to generate signed url" }, { status: 500 }); // [ADDED]
  }
}