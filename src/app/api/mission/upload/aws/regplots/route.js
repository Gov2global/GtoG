// api/mission/upload/aws/regplots
import { NextResponse } from "next/server"; // [ADDED: ใช้ NextResponse กับ App Router]
import { getUploadSignedUrl } from "../../../../../../../lib/s3"; // [CHANGED: import จาก .js ไม่ใช่ .jsx]

export const runtime = "nodejs"

export async function POST(req) {
  try {
    const { filename, contentType } = await req.json()
    if (!filename || !contentType) {
      return NextResponse.json({ error: "filename & contentType required" }, { status: 400 })
    }

    // force prefix regplorts/
    const { signedUrl, publicUrl, key } = await getUploadSignedUrl({
      filename,
      contentType,
      prefix: "regplorts/",
    })

    return NextResponse.json({ signedUrl, publicUrl, key })
  } catch (e) {
    console.error("upload-url error:", e)
    return NextResponse.json({ error: "failed to generate signed url" }, { status: 500 })
  }
}