// api/farmer/get/typeFarm
import { connectMongoDB } from '../../../../../../lib/mongodb';
import TypeFarm from '../../../../../../models/typeFarm';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();   // connect ใหม่ถ้าหลุด
    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 }).lean();
    return NextResponse.json({ success: true, data: typeFarmList });
  } catch (err) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}