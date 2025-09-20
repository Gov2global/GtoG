// api/farmer/get/typeFarm
import { connectMongoDB } from '../../../../../../lib/mongodb1';
import TypeFarm from '../../../../../../models/typeFarm';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ ดึงข้อมูลทั้งหมดของ typeFarm
    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 });

    return NextResponse.json({
      success: true,
      data: typeFarmList,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทฟาร์ม",
    }, { status: 500 });
  }
}
