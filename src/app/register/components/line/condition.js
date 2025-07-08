// require('dotenv').config({ path: '../../../../../.env' });
// const mongoose = require('mongoose');
// const axios = require('axios');

// // --- ENV CONFIG ---
// const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
// const MONGO_URI = process.env.MONGODB_URI;

// // --- RichMenu IDs ---
// const REGISTER_MENU_ID = 'richmenu-de998bd0e0ffeb7d4bdacf46a282c010';      // สำหรับยังไม่สมัคร
// const MEMBER_MENU_ID_FARMER = 'richmenu-2bf18f235fabf148d57cbf2d988bcc11'; // สำหรับเกษตรกรที่สมัครแล้ว

// // --- Mongoose Model (ตาม schema ที่คุณใช้จริง) ---
// const registerSchema = new mongoose.Schema({
//   regData: { type: Date },
//   regID: { type: String, unique: true, required: true },
//   regName: { type: String },
//   regSurname: { type: String },
//   regTel: { type: String },
//   regLineID: { type: String },
//   regProfile: { type: String },
//   regPlant: { type: String },
//   regPlantOther: { type: String },
//   regPlantSpecies: { type: [String] },
//   regPlantAmount: { type: Number },
//   regPlantAge: { type: Number },
//   areaRai: { type: Number },
//   areaNgan: { type: Number },
//   areaWa: { type: Number },
//   province: { type: String },
//   district: { type: String },
//   sub_district: { type: String },
//   addressDetail: { type: String },
//   regType: { type: String },
//   regSubType: { type: String },
//   regCompany: { type: String },
//   regPosition: { type: String },
//   regAreaOfResponsibility: { type: String },
//   regSchoolName: { type: String },
//   regFruits: { type: [String] },
// }, { timestamps: true });

// const Register = mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");

// // --- Set RichMenu Function ---
// async function setRichMenu(userId, menuType) {
//   const richMenuId = menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;
//   const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
//   try {
//     const res = await axios.post(
//       url,
//       {},
//       { headers: { Authorization: `Bearer ${channelAccessToken}` } }
//     );
//     console.log(`✅ Set RichMenu Success! [${menuType}]`, res.status);
//   } catch (err) {
//     console.error('❌ Set RichMenu Error:', err.response?.data || err.message);
//   }
// }

// // --- Main ---
// async function run(userId) {
//   console.log("MONGODB_URI:", MONGO_URI ? "OK" : "NOT FOUND");
//   console.log("LINE_CHANNEL_ACCESS_TOKEN:", channelAccessToken ? "OK" : "NOT FOUND");
//   await mongoose.connect(MONGO_URI);

//   // หา user จาก regLineID
//   const user = await Register.findOne({ regLineID: userId });
//   console.log('DEBUG user:', user);

//   // ถ้าพบ user และเป็น "เกษตรกร" = ให้เมนูเกษตรกร, ถ้าไม่พบหรือไม่ใช่ = เมนูสมัคร
//   const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
//   await setRichMenu(userId, menuType);

//   console.log(
//     '🎉 FINISHED: Rich menu updated!',
//     menuType === "เกษตรกร" ? "(Farmer)" : "(Register)"
//   );
//   await mongoose.disconnect();
// }

// // --- ตัวอย่าง userId (LINE User ID จริง) ---
// run(['U9522cc6ee5337c62188de55406470c41', 'Ucebe552553cd5897128d112bd2611e07'])
//   .catch(err => console.error('❌ Error:', err.response?.data || err.message));


require('dotenv').config({ path: '../../../../../.env' });
const mongoose = require('mongoose');
const axios = require('axios');

// --- ENV CONFIG ---
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const MONGO_URI = process.env.MONGODB_URI;

// --- RichMenu IDs ---
const REGISTER_MENU_ID = 'richmenu-830e0f0a946983883149cf2c5b811304';      // ยังไม่สมัคร
const MEMBER_MENU_ID_FARMER = 'richmenu-f9e21c3433e970b8e01221801c397d63'; // สมัครแล้ว (เกษตรกร)

// --- Mongoose Model ---
const registerSchema = new mongoose.Schema({
  regData: { type: Date },
  regID: { type: String, unique: true, required: true },
  regName: { type: String },
  regSurname: { type: String },
  regTel: { type: String },
  regLineID: { type: String },
  regProfile: { type: String },
  regPlant: { type: String },
  regPlantOther: { type: String },
  regPlantSpecies: { type: [String] },
  regPlantAmount: { type: Number },
  regPlantAge: { type: Number },
  areaRai: { type: Number },
  areaNgan: { type: Number },
  areaWa: { type: Number },
  province: { type: String },
  district: { type: String },
  sub_district: { type: String },
  addressDetail: { type: String },
  regType: { type: String },
  regSubType: { type: String },
  regCompany: { type: String },
  regPosition: { type: String },
  regAreaOfResponsibility: { type: String },
  regSchoolName: { type: String },
  regFruits: { type: [String] },
}, { timestamps: true });

const Register = mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");

// --- Set RichMenu ---
async function setRichMenu(userId, menuType) {
  const richMenuId = menuType === "เกษตรกร" ? MEMBER_MENU_ID_FARMER : REGISTER_MENU_ID;
  const url = `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`;
  try {
    const res = await axios.post(
      url,
      {},
      { headers: { Authorization: `Bearer ${channelAccessToken}` } }
    );
    console.log(`✅ Set RichMenu Success! [${menuType}] for userId: ${userId}`);
    return true;
  } catch (err) {
    console.error(`❌ Set RichMenu Error (${userId}):`, err.response?.data || err.message);
    return false;
  }
}

// --- Run function for one user ---
async function run(userId) {
  // หา user จาก regLineID
  const user = await Register.findOne({ regLineID: userId });
  // ถ้าพบ user และเป็น "เกษตรกร" = ให้เมนูเกษตรกร, ถ้าไม่พบหรือไม่ใช่ = เมนูสมัคร
  const menuType = user?.regType === "เกษตรกร" ? "เกษตรกร" : "register";
  await setRichMenu(userId, menuType);
}

// --- Main: รับ array userId ได้เลย ---
const userIds = [
  'U9522cc6ee5337c62188de55406470c41',
  'Ucebe552553cd5897128d112bd2611e07', //เกม
  'U5983c706a6ffcd70fc5dcc7d7a416c64', //เจษฎา
  'U4c0a522f20072235dbd786f567e65794',
  'U41254dc5b5e5b65a2c488ac224013cfc', //ชาลี
  'U90b5bc2c98532383d958117761f0a10e', ///wan
  'U142a9703f5a958f2c0c60d6f46e1b464' //pam
];

(async () => {
  console.log("MONGODB_URI:", MONGO_URI ? "OK" : "NOT FOUND");
  console.log("LINE_CHANNEL_ACCESS_TOKEN:", channelAccessToken ? "OK" : "NOT FOUND");
  await mongoose.connect(MONGO_URI);

  for (const userId of userIds) {
    try {
      await run(userId);
    } catch (err) {
      console.error(`❌ Error (${userId}):`, err.response?.data || err.message);
    }
  }

  await mongoose.disconnect();
  console.log("🎉 FINISHED: Rich menu updated for all users!");
})();
