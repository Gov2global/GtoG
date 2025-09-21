// api/farmer/get/typeFarm
import mongoose from "mongoose";
import connectMongoDB from "../../../../../../lib/mongodb";
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

    // ✅ ensure connect
    await connectMongoDB();
    console.log("🔍 MongoDB state:", mongoose.connection.readyState);

    const typeFarmList = await TypeFarm.find().sort({ typeID: 1 }).lean();

    // เก็บลง cache
    setCache(CACHE_KEY, typeFarmList, CACHE_TTL);

    console.log("✅ โหลดจาก DB และ cache ใหม่");
    return NextResponse.json({ success: true, data: typeFarmList, cached: false });
  } catch (err) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", err);

    // 🔹 fallback: ใช้ cache เก่า ถ้ามี
    const fallback = getCache(CACHE_KEY);
    if (fallback) {
      console.warn("⚠️ DB error → ส่งข้อมูลจาก cache เก่าแทน");
      return NextResponse.json({ success: true, data: fallback, cached: true, fallback: true });
    }

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
