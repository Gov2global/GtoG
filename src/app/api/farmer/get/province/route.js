import { connectMongoDB } from "../../../../../../lib/mongodb";
import Province from "../../../../../../models/province";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/cache";

// TTL 10 นาที
const CACHE_KEY = "provinceList";
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  try {
    // 1) ลองใช้ cache ก่อน
    const cached = getCache(CACHE_KEY);
    if (cached) {
      console.log("⚡ province ใช้ข้อมูลจาก cache");
      return NextResponse.json(
        { success: true, data: cached, cached: true },
        { status: 200 }
      );
    }

    // 2) ดึงจาก DB
    await connectMongoDB();
    const provinceData = await Province.find().sort({ province: 1 }).lean();

    let flattened = [];

    // ตรวจสอบว่า schema เป็น flat หรือ nested
    if (provinceData.length > 0) {
      if (
        provinceData[0].district !== undefined &&
        provinceData[0].sub_district !== undefined
      ) {
        // ✅ schema flat อยู่แล้ว
        flattened = provinceData.map((p) => ({
          province: p.province,
          district: p.district,
          sub_district: p.sub_district,
          postcode: p.postcode?.toString() || "",
        }));
      } else if (provinceData[0].districts !== undefined) {
        // ✅ schema nested → flatten ออกมา
        provinceData.forEach((p) => {
          p.districts.forEach((d) => {
            d.sub_districts.forEach((s) => {
              flattened.push({
                province: p.province,
                district: d.district,
                sub_district: s.name,
                postcode: s.postcode?.toString() || "",
              });
            });
          });
        });
      }
    }

    // 3) เก็บลง cache
    setCache(CACHE_KEY, flattened, CACHE_TTL);

    console.log("✅ province โหลดจาก DB และ cache ใหม่");
    return NextResponse.json(
      { success: true, data: flattened, cached: false },
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
