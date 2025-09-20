// api/farmer/get/typeFarm
import { connectMongoDB } from "../../../../../../lib/mongodb";
import TypeFarm from "../../../../../../models/typeFarm";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/cache";

// TTL = 10 นาที
const CACHE_KEY = "typeFarmList";
const CACHE_TTL = 10 * 60 * 1000; 

export async function GET() {
  try {
    // ลองดึงจาก cache ก่อน
    const cached = getCache(CACHE_KEY);
    if (cached) {
      console.log("⚡ ใช้ข้อมูลจาก cache");
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    // ถ้าไม่มี cache → query DB
    await connectMongoDB();
    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 }).lean();

    // เก็บลง cache
    setCache(CACHE_KEY, typeFarmList, CACHE_TTL);

    console.log("✅ โหลดจาก DB และ cache ใหม่");
    return NextResponse.json({ success: true, data: typeFarmList, cached: false });
  } catch (err) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
