// /api/farmer/submit/regGAP

import { connectMongoDB } from '../../../../../../lib/mongodb';
import RegGAP from '../../../../../../models/regGAP';
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();
  const data = await req.json();

  // console.log("รับ gapID:", data.gapID); // เพิ่ม log ตรวจสอบ

  try {
    // save โดยใช้ gapID ที่รับมาจาก frontend เท่านั้น!
    const regGap = new RegGAP(data);
    await regGap.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "ไม่สามารถบันทึกข้อมูล", error }, { status: 500 });
  }
}