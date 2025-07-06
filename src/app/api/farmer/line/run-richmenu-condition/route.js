// src/app/api/farmer/line/run-richmenu-condition/route.js 
import { NextResponse } from "next/server";
import { run } from "../../../../register/components/line/condition"; // ปรับ path ตามจริง

export async function POST(req) {
  const { userId } = await req.json();      // ← key ตรงทุกที่
  if (!userId) {
    return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
  }
  try {
    await run(userId);                      // ← ส่งตรง ไม่ต้อง rename
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}