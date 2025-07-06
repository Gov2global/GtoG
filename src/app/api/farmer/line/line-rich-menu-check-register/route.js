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
    console.log("DEBUG regLineID:", regLineID);

    if (!regLineID) {
      return NextResponse.json({ success: false, message: "regLineID is required" }, { status: 400 });
    }

    const user = await Register.findOne({ regLineID });
    console.log("DEBUG user from DB:", user);

    const wantMenuId = user?.regType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;

    // 1. ดึง richmenu ปัจจุบัน
    let currentMenuId = null;
    try {
      const res = await axios.get(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
      currentMenuId = res.data.richMenuId;
    } catch (err) {
      currentMenuId = null;
    }

    // 2. ถ้าไม่ตรงกับที่ควรจะเป็น → unlink ก่อน แล้ว set ใหม่
    if (currentMenuId && currentMenuId !== wantMenuId) {
      try {
        await axios.delete(
          `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
          { headers: { Authorization: `Bearer ${channelAccessToken}` } }
        );
      } catch (e) { /* ignore 404 error */ }
    }
    // 3. set richmenu
    if (currentMenuId !== wantMenuId) {
      await axios.post(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${wantMenuId}`,
        {},
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
    }

    return NextResponse.json({
      success: true,
      menuType: user?.regType === "เกษตรกร" ? "เกษตรกร" : "register",
      richMenuId: wantMenuId,
      message: `Rich menu updated for user ${regLineID}`,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Richmenu set error",
      error: err.response?.data || err.message,
    });
  }
}