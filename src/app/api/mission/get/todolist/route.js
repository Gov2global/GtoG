// api/mission/get/todolist
import { NextResponse } from "next/server"
import { connectDB } from "../../../../../../lib/mongodb"
import Todolist from '../../../../../../models/todolist'


export async function GET() {
  try {
    await connectDB() // [ADDED: เชื่อมต่อ DB]
    const todos = await Todolist.find({}) // [ADDED: ดึงข้อมูลทั้งหมด]
    return NextResponse.json({ success: true, data: todos })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}