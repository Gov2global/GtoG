// api/farmer/line/set-richmenu
import mongoose from "mongoose";
import axios from "axios";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const MONGO_URI = process.env.MONGODB_URI;
const REGISTER_MENU_ID = "richmenu-de998bd0e0ffeb7d4bdacf46a282c010";
const MEMBER_MENU_ID_FARMER = "richmenu-2bf18f235fabf148d57cbf2d988bcc11";

// Minimal schema for search
const registerSchema = new mongoose.Schema(
  {
    regLineID: String,
    regType: String,
  },
  { collection: "Register" }
);
const Register =
  mongoose.models.Register ||
  mongoose.model("Register", registerSchema, "Register");

async function setRichMenu(userId, menuType) {
  const richMenuId =
    menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
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
      return Response.json({ success: false, message: "Missing userId" }, { status: 400 });
    }

    await mongoose.connect(MONGO_URI);
    const user = await Register.findOne({ regLineID: userId });
    const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
    const result = await setRichMenu(userId, menuType);
    await mongoose.disconnect();

    if (!result.success)
      return Response.json({ success: false, error: result.error }, { status: 500 });

    return Response.json({ success: true, menuType });
  } catch (error) {
    await mongoose.disconnect();
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
