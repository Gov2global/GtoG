import { NextResponse } from "next/server";
import { clearCache } from "@/lib/cache";

export async function GET(req) {
  try {
    // ✅ ตรวจสอบ token จาก query string
    const token = req.nextUrl.searchParams.get("token");

    if (token !== process.env.CACHE_SECRET) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    clearCache();
    return NextResponse.json({ ok: true, message: "🧹 Cache cleared" });
  } catch (err) {
    console.error("❌ clear cache error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}