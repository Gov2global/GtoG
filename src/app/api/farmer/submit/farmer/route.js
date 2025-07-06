// api/farmer/submit/farmer
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";
import { run } from '../../../../register/components/line/condition';

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    if (!data.regID) {
      return NextResponse.json({ success: false, message: "regID is required" }, { status: 400 });
    }
    data.regData = new Date();
    const newRegister = await Register.create(data);

    // === Call RichMenu update ===
    try {
      console.log("API: Call run() with regLineID:", newRegister.regLineID);
      await run(newRegister.regLineID);
    } catch (err) {
      console.error("RichMenu update failed:", err);
    }

    return NextResponse.json({ success: true, data: newRegister });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
