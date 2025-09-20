// api/farmer/submit/farmer
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";
import axios from "axios";

// --- LINE Config ---
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const RICHMENUS = {
  register:  "richmenu-fc4e718786460aae6d82a6b4626492ec",
  เกษตรกร:   "richmenu-16e17a02f240d93a616d16459f1d4372",
  การศึกษา:  "richmenu-04cdf97f4f0e2b9a2ec76a6def97cd5c",
  ราชการ:    "richmenu-728d7327a84ac897f0da1feee720464d",
  ท้องถิ่น:  "richmenu-5d54c92a6c45110d76aafd4c0e4e2ab9",
  เอกชน:     "richmenu-7e49f13ffed71dfa674a5cb978a1a06c",
};

async function setRichMenu(userId, regType) {
  const richMenuId = RICHMENUS[regType] || RICHMENUS.register;
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
  try {
    const res = await axios.post(url, {}, {
      headers: { Authorization: `Bearer ${channelAccessToken}` },
    });
    console.log(`✅ Set RichMenu Success! [${regType}] for ${userId}`);
    return { success: true, richMenuId };
  } catch (err) {
    console.error(`❌ Set RichMenu Error (${userId}):`, err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();
    console.log("📥 RECEIVED DATA:", data);

    if (!data.regID) return NextResponse.json({ success: false, message: "regID is required" }, { status: 400 });
    if (!data.regLineID) return NextResponse.json({ success: false, message: "regLineID is required" }, { status: 400 });

    data.regData = new Date();
    const newRegister = await Register.create(data);

    // 🔄 อัพเดท RichMenu ตาม regType
    const richMenuResult = await setRichMenu(newRegister.regLineID, newRegister.regType);

    return NextResponse.json({ success: true, data: newRegister, richMenu: richMenuResult });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
