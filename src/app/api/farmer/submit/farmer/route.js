// api/farmer/submit/farmer
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    // ตรวจสอบว่า regID ถูกส่งมาไหม
    if (!data.regID) {
      return NextResponse.json({ success: false, message: "regID is required" }, { status: 400 });
    }

    // เพิ่มวันที่ปัจจุบัน
    data.regData = new Date();

    const newRegister = await Register.create(data);

    return NextResponse.json({ success: true, data: newRegister });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}