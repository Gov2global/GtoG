// api/linr-rich-menu-check-register/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from "../../../../../../models/register";
import axios from "axios";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN; // แนะนำใช้จาก .env

export async function POST(request) {
  try {
    await connectMongoDB();
    const { regLineID } = await request.json();

    if (!regLineID) {
      return NextResponse.json({ success: false, message: "regLineID is required" }, { status: 400 });
    }

    const regDoc = await Register.findOne({ regLineID });
    const isFarmer = regDoc?.regType === "เกษตรกร";

    const showRichMenu = isFarmer
      ? "richmenu-2bf18f235fabf148d57cbf2d988bcc11"
      : "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";

    // unlink richmenu เดิมก่อนเพื่อให้แน่ใจว่าเปลี่ยนจริง
    await axios.delete(`https://api.line.me/v2/bot/user/${regLineID}/richmenu`, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    });

    // set richmenu ใหม่
    await axios.post(
      `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${showRichMenu}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      isRegistered: !!regDoc,
      regType: regDoc?.regType || null,
      showRichMenu,
    });

  } catch (error) {
    console.error("Richmenu error:", error?.response?.data || error.message);
    return NextResponse.json({
      success: false,
      message: "Richmenu set error",
      error: error?.response?.data || error.message,
    });
  }
}
