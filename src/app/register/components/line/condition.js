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
const REGISTER_MENU_ID = 'richmenu-fc4e718786460aae6d82a6b4626492ec';      // ยังไม่สมัคร
const MEMBER_MENU_ID_FARMER = 'richmenu-16e17a02f240d93a616d16459f1d4372'; // สมัครแล้ว (เกษตรกร)
// const MEMBER_MENU_ID_Education = 'richmenu-04cdf97f4f0e2b9a2ec76a6def97cd5c'; // สมัครแล้ว (การศึกษา)
// const MEMBER_MENU_ID_Government = 'richmenu-728d7327a84ac897f0da1feee720464d'; // สมัครแล้ว (ราชการ)
// const MEMBER_MENU_ID_Local = 'richmenu-5d54c92a6c45110d76aafd4c0e4e2ab9'; // สมัครแล้ว (ท้องถิ่ง)
// const MEMBER_MENU_ID_Private = 'richmenu-7e49f13ffed71dfa674a5cb978a1a06c'; // สมัครแล้ว (เอกชน)

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
  'U9522cc6ee5337c62188de55406470c41', //สุรสิทธิ์
  'U0fc2bf44ecb9a30338143f85af8c5ff3',// ใจหนุ่ม
  // 'Ucebe552553cd5897128d112bd2611e07', //เกม
  // 'U5983c706a6ffcd70fc5dcc7d7a416c64', //เจษฎา
  // 'U4c0a522f20072235dbd786f567e65794',
  // 'U41254dc5b5e5b65a2c488ac224013cfc', //ชาลี
  'U90b5bc2c98532383d958117761f0a10e', // wan 
  // 'U142a9703f5a958f2c0c60d6f46e1b464',//pam 
  // 'U2c6f36e1a490028e4931cce1bc246b70', //คุณแมว
  // 'Ud462431558778ef57c64345ed664ea13',
  // 'U4c0a522f20072235dbd786f567e65794',
  // 'Ud462431558778ef57c64345ed664ea13',
  // 'U4c0a522f20072235dbd786f567e65794',
  // 'U374bfed6dc40abdc888855a5270d3d39',//แพรวา
  // 'U142a9703f5a958f2c0c60d6f46e1b464',//แพม
  // 'Ue8a32ff1b85aec70ad37aabfed115d4d',//ฐิติวัชร์
  // 'U74ac943927a0a22251b4d281fdac8855',//อนวัช สุกใส
  // 'Uceacaae9d7b5186c92142a97d23b4bf1',//ปริญญา กันรักษา
  // 'U3a24aac12834a0b88434e4176a5ffbba',//อุดร งอกไม้
  // 'Uc664afbcbb2a69de685cb55b279b2ed3',//ธีรพงษ์ วงค์วิ่ง
  // 'U3c24c19847642dbf48a9730e09904c2e',// ประเสริฐ จันทรรวงทอง
  // 'U5864c284661ca4bfb8073a0a29a9d179',//อ้อ ทิว
  // 'U2b8cf81706a1521e767ed07abbed5b2b',//กรนิจ โนนจุ้ย
  // 'U234b8c4a6df292583a828b6260e86489',// รังสรรค์ มณีรัตน์
  // 'U41254dc5b5e5b65a2c488ac224013cfc',//เกษตร  ใจดี
  // 'U9522cc6ee5337c62188de55406470c41', //Dhhd Shdh
  // 'Ucaf64698f8074f90cb676cacbfbb9ae6', //JoeSF
  // 'U3541771420558f3a0464800cc8853fa1', 
  // 'Ucc62ebd20b5becbb1f39fe2fa8bba40f' //กู้เกียรติ ชัยวัณณคุปต์
  
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
