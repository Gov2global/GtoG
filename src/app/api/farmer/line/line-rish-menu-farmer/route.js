//api/farmer/line/line-rish-menu-farmer
import { NextResponse } from "next/server";
import axios from "axios";

// ปกติควรเก็บใน .env, demo นี้ hardcode ให้ก่อน
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "YOUR_LONG_ACCESS_TOKEN";
const RICHMENU_ID = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";

export async function POST(req) {
  try {
    const { regLineID } = await req.json();

    if (!regLineID) {
      return NextResponse.json({ success: false, message: "regLineID not found" }, { status: 400 });
    }

    // เรียก LINE API เพื่อเปลี่ยน RichMenu
    const lineRes = await axios.post(
      `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${RICHMENU_ID}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (lineRes.status === 200) {
      return NextResponse.json({ success: true, message: "RichMenu set success" });
    } else {
      return NextResponse.json({ success: false, message: "LINE API response not 200", data: lineRes.data }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err?.response?.data?.message || err.message || "Set RichMenu failed",
        error: err?.response?.data || null,
      },
      { status: 500 }
    );
  }
}
