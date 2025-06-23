// api/farmer/gen-id
import { connectMongoDB } from '../../../../../lib/mongodb'; 
import Register from '../../../../../models/register';
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();

    const url = new URL(req.url);
    const regType = url.searchParams.get("regType");

    console.log("📥 regType:", regType); // ✅ log ค่าที่รับมา

    const prefixMap = {
      "เกษตรกร": "FM",
      "หน่วยงานเอกชน": "PV",
      "หน่วยงานราชการ": "GM",
      "หน่วยงานท้องถิ่น": "LC",
      "สถาบันการศึกษา": "ED",
    };

    const prefix = prefixMap[regType];

    if (!prefix) {
      console.error("❌ ไม่พบ prefix สำหรับ regType:", regType);
      return NextResponse.json({ success: false, message: "Invalid regType" }, { status: 400 });
    }


    const today = new Date();
    const datePart = today.toISOString().slice(2, 10).replace(/-/g, ""); // yymmdd
    const regex = new RegExp(`^${prefix}${datePart}`);

    const latest = await Register.find({ regID: { $regex: regex } })
      .sort({ regID: -1 })
      .limit(1);

    const lastSeq = latest.length > 0 ? parseInt(latest[0].regID.slice(-3)) : 0;
    const nextSeq = (lastSeq + 1).toString().padStart(3, "0");

    const newID = `${prefix}${datePart}${nextSeq}`;

    return NextResponse.json({ success: true, regID: newID });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
