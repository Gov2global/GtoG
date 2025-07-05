// api/linr-rich-menu-check-register/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from "../../../../../../models/register";
import axios from "axios";

const channelAccessToken = "YOUR_LINE_TOKEN";

export async function POST(request) {
  await connectMongoDB();
  const body = await request.json();
  const { regLineID } = body;

  if (!regLineID) {
    return NextResponse.json(
      { success: false, message: "regLineID is required" },
      { status: 400 }
    );
  }

  const regDoc = await Register.findOne({ regLineID });

  // Default richmenu สำหรับผู้ไม่เคยลงทะเบียน
  let showRichMenu = "richmenu-3885f8f149520f74e1b16fa7d9457a98";
  if (regDoc && regDoc.regType === "เกษตรกร") {
    showRichMenu = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";
  }

  // เรียก LINE API set richmenu ให้ user
  try {
    await axios.post(
      `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${showRichMenu}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );
  } catch (e) {
    console.error("Set richmenu error:", e?.response?.data || e.message);
    // ส่ง error กลับ frontend ด้วยก็ได้
    return NextResponse.json({
      success: false,
      message: "Set richmenu error",
      error: e?.response?.data || e.message,
    });
  }

  // ส่งสถานะกลับ
  return NextResponse.json({
    success: true,
    isRegistered: !!regDoc,
    regType: regDoc?.regType || null,
    showRichMenu,
  });
}
