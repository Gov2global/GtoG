// src/app/api/linr-rich-menu-check-register/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import axios from "axios";

// ใช้ token จาก .env เพื่อความปลอดภัย
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// RichMenu ID ตามแต่ละสถานะ
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

    // 1. ตรวจสอบ user ในระบบ
    const regDoc = await Register.findOne({ regLineID });
    const isFarmer = regDoc?.regType === "เกษตรกร";

    // 2. ตรวจสอบ richmenu ปัจจุบันจาก LINE API
    let currentRichMenuId = null;
    try {
      const res = await axios.get(
        `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
      currentRichMenuId = res.data.richMenuId;
    } catch (err) {
      // ถ้า error 404 แปลว่ายังไม่มี richmenu (ซึ่งโอเค)
      currentRichMenuId = null;
    }

    // 3. เลือก richmenu ที่ต้อง set
    const targetRichMenuId = isFarmer
      ? RICHMENU_FARMER
      : RICHMENU_REGISTER;

    // 4. ถ้า richmenu ปัจจุบันไม่ตรงที่ต้องการ → unlink & set
    if (currentRichMenuId !== targetRichMenuId) {
      // ลบ richmenu เดิม (ไม่จำเป็นถ้า user ไม่มี richmenu)
      try {
        await axios.delete(
          `https://api.line.me/v2/bot/user/${regLineID}/richmenu`,
          { headers: { Authorization: `Bearer ${channelAccessToken}` } }
        );
      } catch (e) {
        // ไม่ต้องตกใจ error 404 ตรงนี้ เกิดขึ้นถ้า user ยังไม่เคยมี richmenu
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
