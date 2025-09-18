// api/mission/get/regmissos
import { NextResponse } from "next/server"
import { connectDB } from "../../../../../../lib/mongodb"
import Plot from "../../../../../../models/plots"

export async function GET() {
  try {
    await connectDB(); // [CHANGED: เรียกชื่อ connectDB() ให้ตรงกับ import]

    // ✅ ดึงข้อมูลจาก MongoDB แบบเรียงตาม plantNameTH
    const plots = await Plot.find().sort({ plantNameTH: 1 }); // [CHANGED: เปลี่ยนชื่อเป็น plots เพื่อไม่ชน Model]

    return NextResponse.json({
      success: true,
      data: plots, // [CHANGED: ใช้ชื่อ plots ที่ได้จาก find()]
    }, { status: 200 });

  } catch (error) {
    console.error("❌ ดึงข้อมูล plant ไม่สำเร็จ:", error);
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลพืช",
    }, { status: 500 });
  }
}