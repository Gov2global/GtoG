// api\farmer\line\line-rich-menu-check-register
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import axios from "axios";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// RichMenu ID (เปลี่ยนตามระบบของคุณ)
const RICHMENU_REGISTER = "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";   // ยังไม่สมัคร
const RICHMENU_FARMER   = "richmenu-2bf18f235fabf148d57cbf2d988bcc11"; // เกษตรกร

export async function POST(request) {
  try {
    await connectMongoDB();
    const { regLineID } = await request.json();

    if (!regLineID) {
      return NextResponse.json(
        { success: false, message: "regLineID is required" },
        { status: 400 }
      );
    }

    // ค้น user ใน DB
    const regDoc = await Register.findOne({ regLineID });
    const isFarmer = regDoc?.regType === "เกษตรกร";

    // ตรวจสอบ richmenu ปัจจุบัน
    let currentRichMenuId = null;
    try {
      const res = await axios.get(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
      currentRichMenuId = res.data.richMenuId;
    } catch (err) {
      currentRichMenuId = null; // ยังไม่มี richmenu ก็ set ได้
    }

    // เลือก richmenu ที่ควร set
    const targetRichMenuId = isFarmer ? RICHMENU_FARMER : RICHMENU_REGISTER;

    // ถ้า richmenu ปัจจุบันไม่ตรงที่ต้องการ → unlink & set ใหม่
    if (currentRichMenuId !== targetRichMenuId) {
      try {
        await axios.delete(
          `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
          { headers: { Authorization: `Bearer ${channelAccessToken}` } }
        );
      } catch (e) {
        // ไม่ต้องตกใจถ้า 404 (user ไม่มี richmenu)
      }
      // set richmenu ใหม่
      await axios.post(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${targetRichMenuId}`,
        {},
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
    }

    return NextResponse.json({
      success: true,
      isRegistered: !!regDoc,
      regType: regDoc?.regType || null,
      setRichMenu: currentRichMenuId !== targetRichMenuId,
      showRichMenu: targetRichMenuId,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Richmenu set error",
      error: error?.response?.data || error.message,
    });
  }
}
