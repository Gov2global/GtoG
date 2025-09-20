// api/farmer/get/typeFarm
import { connectMongoDB } from '../../../../../../lib/mongodb';
import TypeFarm from '../../../../../../models/typeFarm';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const conn = await connectMongoDB();
    console.log("📡 Mongo readyState:", conn.connection.readyState);

    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 }).lean();

    return NextResponse.json({ success: true, data: typeFarmList });
  } catch (error) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}