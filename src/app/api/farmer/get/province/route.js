import { connectMongoDB } from "../../../../../../lib/mongodb";
import Province from "../../../../../../models/province";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/cache";

// TTL 10 นาที
const CACHE_KEY = "provinceList";
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  try {
    // ลองดึงจาก cache ก่อน
    const cached = getCache(CACHE_KEY);
    if (cached) {
      console.log("⚡ province ใช้ข้อมูลจาก cache");
      return NextResponse.json(
        { success: true, data: cached, cached: true },
        { status: 200 }
      );
    }

    // ถ้าไม่มี cache → query DB
    await connectMongoDB();
    const provinceData = await Province.find().sort({ province: 1 }).lean();

    // เก็บ cache
    setCache(CACHE_KEY, provinceData, CACHE_TTL);

    console.log("✅ province โหลดจาก DB และ cache ใหม่");
    return NextResponse.json(
      { success: true, data: provinceData, cached: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ ดึงข้อมูล province ไม่สำเร็จ:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
