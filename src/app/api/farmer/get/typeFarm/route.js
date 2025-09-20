// api/farmer/get/typeFarm
import { connectMongoDB } from '../../../../../../lib/mongodb';
import TypeFarm from '../../../../../../models/typeFarm';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ⬅️ เชื่อม DB ให้แน่ใจก่อน
    const conn = await connectMongoDB();
    if (conn.connection.readyState !== 1) {
      throw new Error("MongoDB not connected");
    }
    console.log("📡 Mongo readyState:", conn.connection.readyState);

    // ✅ ใช้ Model หลัง connect แล้วเท่านั้น
    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 }).lean();

    return NextResponse.json({ success: true, data: typeFarmList });
  } catch (error) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}