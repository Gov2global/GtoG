// api/mission/get/progress

import { NextResponse } from "next/server"
import { connectDB } from "../../../../../../lib/mongodb"; 
import Progress from "../../../../../../models/taskProgress"; 


export async function GET(req) {
  try {
    await connectDB()

    // ดึง query string เช่น /api/mission/get/progress?regCode=P25092000002
    const { searchParams } = new URL(req.url)
    const regCode = searchParams.get("regCode")

    let query = {}
    if (regCode) {
      query.regCode = regCode
    }

    const progresses = await Progress.find(query).lean()

    // คืนแค่ id + regCode เพื่อใช้ตรวจสอบ task
    const result = progresses.map((p) => ({
      id: p.id,
      regCode: p.regCode,
      done: p.done,
    }))

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("❌ error get progress:", error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}