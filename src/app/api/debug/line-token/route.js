// app/api/debug/line-token/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "❌ Missing LINE_CHANNEL_ACCESS_TOKEN in env" },
        { status: 500 }
      );
    }

    // ✅ ใช้ userId พิเศษ "@me" เพื่อดึง profile ของเจ้าของ token เอง
    const res = await fetch("https://api.line.me/v2/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          ok: false,
          status: res.status,
          error: text,
        },
        { status: res.status }
      );
    }

    const profile = await res.json();
    return NextResponse.json(
      {
        ok: true,
        status: res.status,
        message: "LINE token is valid ✅",
        profile,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ LINE token check error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
