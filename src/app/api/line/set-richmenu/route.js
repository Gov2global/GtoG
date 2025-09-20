import axios from "axios";
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Register from "../../../../../models/register";

// --- Config ---
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!channelAccessToken) {
  throw new Error("❌ Missing LINE_CHANNEL_ACCESS_TOKEN in env");
}

// --- RichMenu Mapping ---
const RICHMENUS = {
  register:  "richmenu-fc4e718786460aae6d82a6b4626492ec", // ยังไม่สมัคร
  เกษตรกร:   "richmenu-16e17a02f240d93a616d16459f1d4372",
  การศึกษา:  "richmenu-04cdf97f4f0e2b9a2ec76a6def97cd5c",
  ราชการ:    "richmenu-728d7327a84ac897f0da1feee720464d",
  ท้องถิ่น:  "richmenu-5d54c92a6c45110d76aafd4c0e4e2ab9",
  เอกชน:     "richmenu-7e49f13ffed71dfa674a5cb978a1a06c",
};

export async function POST(req) {
  try {
    const { regLineID } = await req.json();

    if (!regLineID) {
      return NextResponse.json(
        { success: false, message: "Missing regLineID" },
        { status: 400 }
      );
    }

    // 1) เชื่อมต่อ DB
    await connectMongoDB();

    // 2) หา user จาก DB
    const user = await Register.findOne({ regLineID }).lean();

    // ถ้าไม่เจอ user → ใช้เมนูสมัคร
    const role = user?.regType || "register";

    // 3) หา RichMenu ตาม role (default = register)
    const richMenuId = RICHMENUS[role] || RICHMENUS.register;

    // 4) เรียก LINE API
    const url = `https://api.line.me/v2/bot/user/${regLineID}/richmenu/${richMenuId}`;
    const res = await axios.post(url, {}, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    });

    return NextResponse.json({
      success: true,
      status: res.status,
      regLineID,
      appliedRole: role,
      richMenuId,
    });
  } catch (err) {
    console.error("❌ set-richmenu error:", err.response?.data || err.message);
    return NextResponse.json(
      { success: false, error: err.response?.data || err.message },
      { status: 500 }
    );
  }
}