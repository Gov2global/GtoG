// api/farmer/get/register/route.js
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();
    const registers = await Register.find(); // ดึงข้อมูลทั้งหมด
    return NextResponse.json({ success: true, data: registers });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch data", error }, { status: 500 });
  }
}
