// api/farmer/get/line-get/[lineId]/route.js

import { connectMongoDB } from "../../../../../../../lib/mongodb";
import Register from "../../../../../../../models/register";
import { NextResponse } from "next/server";

// /api/farmer/get/register/line/[lineId]
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { lineId } = params;
    // ค้นหา regLineID ที่ตรงกับ lineId
    const member = await Register.findOne({ regLineID: lineId });
    if (!member) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูล" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
