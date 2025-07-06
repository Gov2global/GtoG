// api/farmer/submit/farmer
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";
import { run } from '../../../../register/components/line/condition'; // import ฟังก์ชัน run (path ปรับตามจริง)

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    if (!data.regID) {
      return NextResponse.json({ success: false, message: "regID is required" }, { status: 400 });
    }
    data.regData = new Date();
    const newRegister = await Register.create(data);

    // === Call RichMenu update ===
    try {
      await run(newRegister.regLineID);
    } catch (err) {
      console.error("RichMenu update failed:", err);
      // ไม่ throw error จะได้ save ได้ก่อน
    }

    return NextResponse.json({ success: true, data: newRegister });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}