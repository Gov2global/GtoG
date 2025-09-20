// api/farmer/get/line-get/[lineId]

import { connectMongoDB } from "../../../../../../../lib/mongodb";
import Register from "../../../../../../../models/register";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    console.log("📌 API params:", params);
    const { lineId } = params;

    if (!lineId) {
      return NextResponse.json({ success: false, message: "Missing lineId" }, { status: 400 });
    }

    const member = await Register.findOne({ regLineID: lineId }).lean();

    if (!member) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูล" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member }, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}