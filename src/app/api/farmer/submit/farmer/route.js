
// api/farmer/submit/farmer
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import { NextResponse } from "next/server";
import { setRichMenuByType } from "../../../../../../lib/line";

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    if (!data.regID || !data.regLineID) {
      return NextResponse.json(
        { success: false, message: "Missing regID or regLineID" },
        { status: 400 }
      );
    }

    data.regData = new Date();
    const newRegister = await Register.create(data);

    // 🔄 เรียกครั้งเดียวพอ
    await setRichMenuByType(newRegister.regLineID, newRegister.regType);

    return NextResponse.json({ success: true, data: newRegister });
  } catch (err) {
    console.error("❌ submit error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
