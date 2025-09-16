// api/line-message

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { to } = await req.json();

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to,
        messages: [{ type: "text", text: "🚀 ทดสอบส่งข้อความสำเร็จ!" }],
      }),
    });

    const text = await res.text();
    console.log("📩 LINE Debug Response:", text);

    if (!res.ok) {
      throw new Error(text);
    }

    return NextResponse.json({ success: true, response: text });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
