// api/farmer/get/regGAP
import { connectMongoDB } from '../../../../../../lib/mongodb';
import regGAP from '../../../../../../models/regGAP';
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();
    const regGAPs = await regGAP.find(); // ชื่อไม่ชน model
    return NextResponse.json({ success: true, data: regGAPs });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}