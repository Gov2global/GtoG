// api/farmer/line/line-rich-menu-check-register
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import axios from "axios";

const REGISTER_MENU_ID = "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";
const MEMBER_MENU_ID_FARMER = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function POST(request) {
  try {
    await connectMongoDB();
    const { regLineID } = await request.json();

    if (!regLineID) {
      return NextResponse.json({ success: false, message: "regLineID is required" }, { status: 400 });
    }

    const user = await Register.findOne({ regLineID });
    const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
    const richMenuId = menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;

    const response = await axios.post(
      `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${richMenuId}`,
      {},
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );

    console.log("LINE API response:", response.status, response.data);

    return NextResponse.json({
      success: true,
      menuType,
      regType: user?.regType || null,
      richMenuId,
      message: `Rich menu updated for user ${regLineID}`,
    });
  } catch (error) {
    console.error("Set RichMenu Error:", error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      message: "Richmenu set error",
      error: error.response?.data || error.message,
    }, { status: error.response?.status || 500 });
  }
}