
// app/api/baac/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Baac from "../../../../models/baac";
function pad(num, size) {
  return num.toString().padStart(size, "0");
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    // ✅ gen baac_ID
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2); // ปี 2 หลัก
    const mm = pad(now.getMonth() + 1, 2);
    const dd = pad(now.getDate(), 2);

    // หาเลขลำดับล่าสุดของวัน
    const prefix = `${yy}${mm}${dd}`;
    const lastEntry = await Baac.findOne({ baac_ID: new RegExp(`^${prefix}`) })
      .sort({ baac_ID: -1 })
      .lean();

    let seq = 1;
    if (lastEntry) {
      const lastSeq = parseInt(lastEntry.baac_ID.slice(-4), 10);
      seq = lastSeq + 1;
    }

    const baac_ID = `${prefix}${pad(seq, 4)}`;

    // ✅ สร้าง record ใหม่
    const newBaac = await Baac.create({ ...body, baac_ID });

    return NextResponse.json({ success: true, data: newBaac }, { status: 201 });
  } catch (err) {
    console.error("❌ Error saving BAAC:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const list = await Baac.find().sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error("❌ Error fetching BAAC:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}