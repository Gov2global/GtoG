// api/farmer/submit/farmer
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";
import { run } from '../../../../register/components/line/condition'; // import ฟังก์ชัน run (path ปรับตามจริง)

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

    // เรียกเปลี่ยน RichMenu (backend ทำเองหลัง register สำเร็จ)
    try {
      await run(data.regLineID);
    } catch (richErr) {
      console.error('Set RichMenu Error:', richErr);
      // ไม่ throw ออกไป ให้ response สำเร็จเสมอ
    }

    return NextResponse.json({ success: true, data: newRegister });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
