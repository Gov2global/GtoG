// /api/farmer/line/set-richmenu/route.js
import mongoose from "mongoose";
import axios from "axios";
import { NextResponse } from "next/server";

// --- Config ---
const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';
const MONGO_URI = process.env.MONGODB_URI;
// เอาแค่ RichMenu เดียว (เปลี่ยนได้เลย)
const MEMBER_MENU_ID_FARMER = "richmenu-5f3ea60d2387f050a6df327719d4364b";

// --- Helper: connect DB (optional ถ้าใช้ mongoose) ---
async function dbConnect() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
}

// --- Main API ---
export async function POST(req) {
  try {
    // 1. รับ regLineID จาก frontend
    const { regLineID } = await req.json();
    if (!regLineID) {
      return NextResponse.json({ success: false, message: "Missing regLineID" }, { status: 400 });
    }

    // 2. (ถ้าต้องการ) connect DB (ไม่ใช้ก็ลบออกได้)
    // await dbConnect();

    // 3. Call LINE API เพื่อ set RichMenu เดียว (ไม่ต้องมีเงื่อนไขแล้ว)
    const url = `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${MEMBER_MENU_ID_FARMER}`;
    try {
      const res = await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${channelAccessToken}` } }
      );
      return NextResponse.json({ success: true, status: res.status });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.response?.data || err.message }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
