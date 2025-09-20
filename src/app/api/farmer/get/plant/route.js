// api/farmer/get/plant
// api/farmer/get/plant/route.js
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Plant from "../../../../../../models/plant";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/cache";

const CACHE_KEY = "plantList";
const CACHE_TTL = 10 * 60 * 1000; // 10 นาที

export async function GET() {
  try {
    // ⚡ ลองดึงจาก cache ก่อน
    const cached = getCache(CACHE_KEY);
    if (cached) {
      console.log("⚡ plant ใช้ข้อมูลจาก cache");
      return NextResponse.json(
        { success: true, data: cached, cached: true },
        { status: 200 }
      );
    }

    // ถ้าไม่เจอ cache → query DB
    await connectMongoDB();
    const plants = await Plant.find().sort({ plantNameTH: 1 }).lean();

    // เก็บ cache
    setCache(CACHE_KEY, plants, CACHE_TTL);

    console.log("✅ plant โหลดจาก DB และ cache ใหม่");
    return NextResponse.json(
      { success: true, data: plants, cached: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ ดึงข้อมูล plant ไม่สำเร็จ:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
