// api/farmer/get/plant
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Plant from '../../../../../../models/plant';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ ดึงข้อมูลจาก MongoDB
    const plants = await Plant.find().sort({ plantNameTH: 1 });

    return NextResponse.json({
      success: true,
      data: plants,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ดึงข้อมูล plant ไม่สำเร็จ:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลพืช",
    }, { status: 500 });
  }
}