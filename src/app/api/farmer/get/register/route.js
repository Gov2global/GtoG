// api/farmer/get/register/route.js
// api/farmer/get/registers/route.js
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ ใช้ lean() จะได้ plain object (เบา/เร็วกว่า Mongoose Document)
    // ✅ จำกัดจำนวนข้อมูล (เช่น 500 รายการ) กัน memory ระเบิด
    const registers = await Register.find()
      .sort({ createdAt: -1 }) // เรียงล่าสุดก่อน
      .limit(500)
      .lean();

    return NextResponse.json({ success: true, data: registers }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to fetch register data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}