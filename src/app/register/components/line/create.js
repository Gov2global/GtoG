// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// //ลงทะเบียน
// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "Register",
//   chatBarText: "ลงทะเบียน",
//   areas: [
//     {
//       bounds: { x: 0, y: 0, width: 2500, height: 1686 },
//       action: {
//         type: "uri",
//         uri: "https://liff.line.me/2007697520-g59jM8X3",
//       },
//     },
//   ],
// };


// axios.post(
//   "https://api.line.me/v2/bot/richmenu",
//   richMenuBody,
//   {
//     headers: {
//       "Authorization": `Bearer ${channelAccessToken}`,
//       "Content-Type": "application/json",
//     },
//   }
// )
// .then(res => {
//   console.log('RichMenu created:', res.data);
// })
// .catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });



const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

const richMenuBody = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "RichMenuFarmer",
  chatBarText: "เกษตรกร",
  areas: [
    {
      bounds: { x: 1123, y: 950, width: 606, height: 306 },
      action: { type: "message", text: "เช็คภาระกิจ" }
    },
    {
      bounds: { x: 1123, y: 1550, width: 606, height: 306 },
      action: { type: "message", text: "ลงทะเบียนเข้าร่วม GAP" }
    },
    {
      bounds: { x: 1123, y: 2078, width: 606, height: 306 },
      action: { type: "message", text: "ติดต่อเจ้าหน้าที่" }
    },
    {
      bounds: { x: 1495, y: 950, width: 606, height: 306 },
      action: { type: "message", text: "แจ้งผลผลิต" }
    },
    {
      bounds: { x: 1495, y: 1550, width: 606, height: 306 },
      action: { type: "message", text: "ขอเงินสนับสนุน" }
    },
    {
      bounds: { x: 1495, y: 2078, width: 606, height: 306 },
      action: { type: "message", text: "สั่งซื้อผลิตภัณฑ์ปุ๋ย ยา" }
    }
  ]
};

axios.post(
  "https://api.line.me/v2/bot/richmenu",
  richMenuBody,
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
  }
)
.then(res => {
  console.log('RichMenu created:', res.data);
})
.catch(err => {
  console.error('Error:', err.response?.data || err.message);
});




// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';


// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "fruit_premium_menu",
//   chatBarText: "เมนูหลัก",
//   areas: [
//     {
//       bounds: { x: 0, y: 1286, width: 625, height: 400 },
//       action: { type: "uri", uri: "https://your-location-link" }
//     },
//     {
//       bounds: { x: 625, y: 1286, width: 625, height: 400 },
//       action: { type: "uri", uri: "https://your-produce-link" }
//     },
//     {
//       bounds: { x: 1250, y: 1286, width: 625, height: 400 },
//       action: { type: "uri", uri: "https://your-gardens-link" }
//     },
//     {
//       bounds: { x: 1875, y: 1286, width: 625, height: 400 },
//       action: { type: "message", text: "ติดต่อเจ้าหน้าที่" }
//     }
//   ]
// };

// axios.post(
//   "https://api.line.me/v2/bot/richmenu",
//   richMenuBody,
//   {
//     headers: {
//       "Authorization": `Bearer ${channelAccessToken}`,
//       "Content-Type": "application/json",
//     },
//   }
// )
// .then(res => {
//   console.log('RichMenu created:', res.data);
// })
// .catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });


// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuGovernmentAgency",
//   chatBarText: "หน่วยงานราชการ",
//   areas: [
//     {
//       bounds: { x: 65, y: 1200, width: 700, height: 330 },
//       action: {  type: "message", label: "เอกสาร MOU", text: "เอกสาร MOU" }
//     },
//     {
//       bounds: { x: 825, y: 1200, width: 680, height: 330 },
//       action: {  type: "message", label: "รายชื่อเกษตรกร", text: "รายชื่อเกษตรกร" }
//     },
//     {
//       bounds: { x: 1540, y: 1200, width: 600, height: 330 },
//       action: {  type: "message", label: "นัดพบเกษตรกร", text: "นัดพบเกษตรกร" }
//     },
//     {
//       bounds: { x: 2190, y: 1085, width: 250, height: 420 },
//       action: { type: "message", label: "ติดต่อเจ้าหน้าที่", text: "ติดต่อเจ้าหน้าที่" }
//     }
//   ]
// };

// axios.post(
//   "https://api.line.me/v2/bot/richmenu",
//   richMenuBody,
//   {
//     headers: {
//       "Authorization": `Bearer ${channelAccessToken}`,
//       "Content-Type": "application/json",
//     },
//   }
// )
// .then(res => {
//   console.log('RichMenu created:', res.data);
// })
// .catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });





// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuLocalAgency",
//   chatBarText: "หน่วยงานท้องถิ่น",
//   areas: [
//     {
//       bounds: { x: 60, y: 1200, width: 780, height: 350 },
//       action: { type: "message", label: "สนับสนุนปัจจัย", text: "สนับสนุนปัจจัย" }
//       // หรือใช้ type: "uri" เช่น { type: "uri", label: "สนับสนุนปัจจัย", uri: "https://your-donate-link" }
//     },
//     {
//       bounds: { x: 865, y: 1200, width: 610, height: 350 },
//       action: { type: "message", label: "พิกัดสวน", text: "พิกัดสวน" }
//       // หรือ { type: "uri", label: "พิกัดสวน", uri: "https://your-location-link" }
//     },
//     {
//       bounds: { x: 1510, y: 1200, width: 650, height: 350 },
//       action: { type: "message", label: "รายชื่อเกษตรกร", text: "รายชื่อเกษตรกร" }
//       // หรือ { type: "uri", label: "รายชื่อเกษตรกร", uri: "https://your-farmer-list-link" }
//     },
//     {
//       bounds: { x: 2200, y: 1200, width: 230, height: 350 },
//       action: { type: "message", label: "ติดต่อเจ้าหน้าที่", text: "ติดต่อเจ้าหน้าที่" }
//     }
//   ]
// };

// axios.post(
//   "https://api.line.me/v2/bot/richmenu",
//   richMenuBody,
//   {
//     headers: {
//       "Authorization": `Bearer ${channelAccessToken}`,
//       "Content-Type": "application/json",
//     },
//   }
// )
// .then(res => {
//   console.log('RichMenu created:', res.data);
// })
// .catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });


// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuEducational",
//   chatBarText: "การศึกษา",
//   areas: [
//     // 1. ติดตามสวน
//     {
//       bounds: { x: 1370, y: 160, width: 1060, height: 260 },
//       action: { type: "message", label: "ติดตามสวน", text: "ติดตามสวน" }
//     },
//     // 2. ฟาร์มตัวอย่าง
//     {
//       bounds: { x: 1370, y: 440, width: 1060, height: 260 },
//       action: { type: "message", label: "ฟาร์มตัวอย่าง", text: "ฟาร์มตัวอย่าง" }
//     },
//     // 3. ส่งภาพแปลงปลูก
//     {
//       bounds: { x: 1370, y: 720, width: 1060, height: 260 },
//       action: { type: "message", label: "ส่งภาพแปลงปลูก", text: "ส่งภาพแปลงปลูก" }
//     },
//     // 4. ติดต่อเจ้าหน้าที่ (มุมขวาล่าง)
//     {
//       bounds: { x: 2020, y: 1400, width: 410, height: 260 },
//       action: { type: "message", label: "ติดต่อเจ้าหน้าที่", text: "ติดต่อเจ้าหน้าที่" }
//     }
//   ]
// };

// axios.post(
//   "https://api.line.me/v2/bot/richmenu",
//   richMenuBody,
//   {
//     headers: {
//       "Authorization": `Bearer ${channelAccessToken}`,
//       "Content-Type": "application/json",
//     },
//   }
// )
// .then(res => {
//   console.log('RichMenu created:', res.data);
// })
// .catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });
