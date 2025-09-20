// app/api/mission/progress
import { NextResponse } from "next/server"
import { connectMongoDB } from "../../../../../lib/mongodb"
import Progress from "../../../../../models/taskProgress" 

export async function POST(req) {
  try {
    await connectMongoDB()

    const body = await req.json()

    // ซัพพอร์ตทั้ง 1 object หรือ array
    const dataArray = Array.isArray(body) ? body : [body]

    const cleanedData = dataArray.map((item) => ({
      id: item.id,
      regCode: item.regCode,
      done: item.done === true,
      uuid: item.uuid,
    }))

    // บันทึกลง MongoDB (batch insert)
    const result = await Progress.insertMany(cleanedData, { ordered: false })

    return NextResponse.json({
      success: true,
      inserted: result.length,
      message: "✅ บันทึกข้อมูลสำเร็จแล้ว",
    })
  } catch (err) {
    console.error("❌ insert error:", err.message)
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาด", error: err.message },
      { status: 500 }
    )
  }
}