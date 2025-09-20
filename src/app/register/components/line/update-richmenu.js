require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// ENV
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const MONGO_URI = process.env.MONGODB_URI;

// RichMenu IDs
const REGISTER_MENU_ID = 'richmenu-fc4e718786460aae6d82a6b4626492ec';
const MEMBER_MENU_ID_FARMER = 'richmenu-16e17a02f240d93a616d16459f1d4372';

// Schema
const registerSchema = new mongoose.Schema({ regLineID: String, regType: String }, { strict: false });
const Register = mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");

async function setRichMenu(userId, menuType) {
  const richMenuId = menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;

  try {
    await axios.post(url, {}, {
      headers: { Authorization: `Bearer ${channelAccessToken}` }
    });
    console.log(`✅ RichMenu set: ${menuType} → ${userId}`);
  } catch (err) {
    console.error(`❌ RichMenu error: ${userId}`, err.response?.data || err.message);
  }
}

async function run(userId) {
  const user = await Register.findOne({ regLineID: userId });
  const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
  await setRichMenu(userId, menuType);
}

(async () => {
  console.log("MONGODB_URI:", !!MONGO_URI, "LINE TOKEN:", !!channelAccessToken);

  await mongoose.connect(MONGO_URI);

  const userIds = [
    "U9522cc6ee5337c62188de55406470c41",//joe
    "U90b5bc2c98532383d958117761f0a10e",//wan
    "U142a9703f5a958f2c0c60d6f46e1b464",//pam 
    "U374bfed6dc40abdc888855a5270d3d39",//แพรวา
  ];

  for (const id of userIds) await run(id);

  await mongoose.disconnect();
  console.log("🎉 FINISHED: RichMenu updated!");
})();
