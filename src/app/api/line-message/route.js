// api/line-message

// api/line-message
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { to, message } = await req.json();

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to, // ✅ Line User ID
        messages: [{ type: "text", text: message }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("LINE API error: " + errText);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Notify LINE error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
