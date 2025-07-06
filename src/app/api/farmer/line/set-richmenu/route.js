// /api/farmer/line/set-richmenu
// import mongoose from "mongoose";
// import axios from "axios";
// import { NextResponse } from "next/server";

// const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
// const MONGO_URI = process.env.MONGODB_URI;
// const REGISTER_MENU_ID = "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";
// const MEMBER_MENU_ID_FARMER = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";

// // Minimal schema
// const registerSchema = new mongoose.Schema(
//   {
//     regLineID: String,
//     regType: String,
//   },
//   { collection: "Register" }
// );
// const Register =
//   mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");

// async function setRichMenu(userId, menuType) {
//   const richMenuId = menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;
//   const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
//   try {
//     const res = await axios.post(
//       url,
//       {},
//       { headers: { Authorization: `Bearer ${channelAccessToken}` } }
//     );
//     return { success: true, status: res.status };
//   } catch (err) {
//     return { success: false, error: err.response?.data || err.message };
//   }
// }

// // Helper: เชื่อม DB (Dev-friendly)
// async function dbConnect() {
//   if (mongoose.connection.readyState === 1) return; // already connected
//   await mongoose.connect(MONGO_URI);
// }

// export async function POST(req) {
//   let dbConnected = false;
//   try {
//     const { userId } = await req.json();
//     if (!userId) {
//       return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
//     }

//     await dbConnect();
//     dbConnected = true;

//     const user = await Register.findOne({ regLineID: userId });
//     const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
//     const result = await setRichMenu(userId, menuType);

//     // Disconnect (optional, หรือจะคอมเมนต์ไว้ถ้า serverless)
//     // await mongoose.disconnect();

//     if (!result.success)
//       return NextResponse.json({ success: false, error: result.error }, { status: 500 });

//     return NextResponse.json({ success: true, menuType });
//   } catch (error) {
//     // ถ้าเชื่อมต่อสำเร็จแล้วค่อย disconnect
//     // if (dbConnected) await mongoose.disconnect();
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }


import axios from "axios";
import { NextResponse } from "next/server";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const MEMBER_MENU_ID_FARMER = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";

async function setRichMenu(userId) {
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${MEMBER_MENU_ID_FARMER}`;
  try {
    const res = await axios.post(
      url,
      {},
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );
    return { success: true, status: res.status };
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
}

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    const result = await setRichMenu(userId);

    if (!result.success)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });

    return NextResponse.json({ success: true, richMenuId: MEMBER_MENU_ID_FARMER });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
