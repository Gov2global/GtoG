// api/farmer/get/typeFarm
import { connectMongoDB } from "../../../../../../lib/mongodb";
import TypeFarm from "../../../../../../models/typeFarm";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/cache";

const CACHE_KEY = "typeFarmList";
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  try {
    const cached = getCache(CACHE_KEY);
    if (cached) {
      console.log("⚡ ใช้ข้อมูลจาก cache (items:", cached.length, ")");
      return NextResponse.json({ success: true, data: cached, cached: true });
    }

    await connectMongoDB();
    const typeFarmList = await TypeFarm.find(
      {},
      { typeID: 1, typeDetailTH: 1, typeDetailEN: 1, subType: 1 }
    )
      .sort({ typeID: 1 })
      .lean();

    console.log("✅ โหลดจาก DB:", typeFarmList.length, "records");
    console.log("📤 ตัวอย่าง:", typeFarmList.slice(0, 3));

    setCache(CACHE_KEY, typeFarmList, CACHE_TTL);

    return NextResponse.json({
      success: true,
      data: typeFarmList,
      count: typeFarmList.length,
      cached: false,
    });
  } catch (err) {
    console.error("❌ ดึงข้อมูล typeID ไม่สำเร็จ:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
