// api/mission/get/regmissos
import { NextResponse } from "next/server"
import { connectDB } from "../../../../../../lib/mongodb"
import Plot from "../../../../../../models/plots"

export async function GET() {
  try {
    await connectDB()

    // ✅ ดึงข้อมูลทั้งหมด โดยไม่ตัด createdAt ออก
    const plots = await Plot.find().sort({ createdAt: -1 }) // [CHANGED: เรียงล่าสุดจาก DB ด้วย]

    return NextResponse.json({
      success: true,
      data: plots,
    }, { status: 200 })

  } catch (error) {
    console.error("❌ ดึงข้อมูล plot ไม่สำเร็จ:", error)
    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลแปลง",
    }, { status: 500 })
  }
}