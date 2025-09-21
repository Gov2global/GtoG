// api/farmer/get/province
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Province from '../../../../../../models/province';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ ดึงข้อมูลจาก MongoDB โดยไม่ใช้ชื่อ Province ซ้ำกับ Model
    const provinceData = await Province.find().sort({ province: 1 });

    return NextResponse.json({
      success: true,
      data: provinceData,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ดึงข้อมูล province ไม่สำเร็จ:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลจังหวัด",
    }, { status: 500 });
  }
}
