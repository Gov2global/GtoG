// api/linr-rich-menu-check-register/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from "../../../../../../models/register";
import axios from "axios";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN; // ควรเก็บไว้ใน .env

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
      : "richmenu-3885f8f149520f74e1b16fa7d9457a98";

    // set richmenu
    await axios.post(
      `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${showRichMenu}`,
      {},
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );

    return NextResponse.json({
      success: true,
      isRegistered: !!regDoc,
      regType: regDoc?.regType || null,
      showRichMenu,
    });

  } catch (error) {
    console.error("Set richmenu error:", error?.response?.data || error.message);
    return NextResponse.json({
      success: false,
      message: "Set richmenu error",
      error: error?.response?.data || error.message,
    });
  }
}