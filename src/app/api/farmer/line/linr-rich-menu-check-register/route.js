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

    // (1) ตรวจสอบ user ในระบบก่อน
    const regDoc = await Register.findOne({ regLineID });
    const isFarmer = regDoc?.regType === "เกษตรกร";

    // (2) ดึง richmenu ปัจจุบันจาก LINE API
    let currentRichMenuId = null;
    try {
      const res = await axios.get(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
      currentRichMenuId = res.data.richMenuId;
    } catch (err) {
      // ถ้า error ว่า not found แสดงว่ายังไม่มี richmenu
      currentRichMenuId = null;
    }

    // (3) เลือก richmenu ที่ควร set
    const targetRichMenuId = isFarmer
      ? "richmenu-2bf18f235fabf148d57cbf2d988bcc11"
      : "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";

    // (4) ถ้า richmenu ปัจจุบันไม่ตรงที่ต้องการ → ค่อย unlink+set
    if (currentRichMenuId !== targetRichMenuId) {
      // unlink ก่อน
      await axios.delete(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
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