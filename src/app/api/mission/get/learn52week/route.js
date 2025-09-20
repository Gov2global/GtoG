// api/mission/get/learn52week
import { NextResponse } from "next/server"
import { connectDB } from "../../../../../../lib/mongodb";         // [CHANGED: ใช้ connectDB ตรงชื่อจริง]
import Learn52Week from "../../../../../../models/learn52week"; // [CHANGED: import model จาก lib/models]

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const week = searchParams.get("week");

    let filter = {};
    if (code) filter.code = code;
    if (week) filter.week = week;

    const records = await Learn52Week.find(filter).sort({ week: 1 }).lean();

    return NextResponse.json({ ok: true, data: records }, { status: 200 });
  } catch (err) {
    console.error("❌ learn52week error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}