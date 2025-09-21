// api/farmer/get/plant/route.js
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Plant from "../../../../../../models/plant";
import { NextResponse } from "next/server";

const CACHE_KEY = "plantList";
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที
let cache = { data: null, timestamp: 0 };

export async function GET() {
  try {
    // 🔹 ถ้ามี cache และยังไม่หมดเวลา → ใช้ cache เลย
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      console.log("⚡ ใช้ cache แทน query DB");
      return NextResponse.json({ success: true, data: cache.data }, { status: 200 });
    }

    await connectMongoDB();
    const plants = await Plant.find().sort({ plantNameTH: 1 }).lean();

    // 🔹 เก็บ cache
    cache = { data: plants, timestamp: Date.now() };

    return NextResponse.json({ success: true, data: plants }, { status: 200 });
  } catch (error) {
    console.error("❌ ดึงข้อมูล plant ไม่สำเร็จ:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลพืช" },
      { status: 500 }
    );
  }
}
