// ลงทะเบียน
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

/////////////////////////////////////////////////////////////////////////////////////////

//เกษตรกร
const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

const richMenuBody = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "RichMenuFarmer",
  chatBarText: "เกษตรกร",
    areas: [
    {
      bounds: { x: 321, y: 1094, width: 574, height: 293 },
      action: { type: "message", text: "เช็คภาระกิจ" }
    },
    {
      bounds: { x: 987, y: 1094, width: 640, height:293 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-m4qMPp1k" } 
    },
    {
      bounds: { x:1643, y: 1094, width: 558, height: 293 },
      action: { type: "message", text: "ผู้ช่วยส่วนตัว" }
    },
    {
      bounds: { x:2222, y: 1094, width: 486, height: 293 },
      action: { type: "message", text: "ติดต่อเจ้าหน้าที่" }
    },
    {
      bounds: { x: 276, y: 1451, width: 484, height: 293 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-6KRLnXVP" } 
    },
    {
      bounds: { x: 800, y: 1451, width: 490, height: 293 },
      action: { type: "message", text: "แจ้งผลผลิต" }
    },
 {
      bounds: { x: 1396, y: 1451, width: 603, height: 293 },
      action: { type: "message", text: "ขอเงินสนับสนุน" }
    },
    {
      bounds: { x: 2117, y: 1451, width: 695, height: 293},
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

////////////////////////////////////////////////////////////////////////////////////////


//การศึกษา
// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';


// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "fruit_premium_menu",
//   chatBarText: "สถาบันการศึกษา",
//   areas: [
//     {
//       bounds: { x: 1988, y: 293, width: 874, height: 282 },
//       action: { type: "message", text: "ติดตามสวน" }
//     },
//     {
//       bounds: {x: 1988, y: 690, width: 874, height: 282 },
//       action: { type: "message", text: "ส่งภาพแปลงปลูก" }
//     },
//     {
//       bounds: {x: 1988, y: 1034, width: 874, height: 282},
//       action: { type: "uri", uri: "https://your-gardens-link" }
//     },
//     {
//       bounds: { x: 2220, y: 1450, width: 412, height: 400 },
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

//เมนูหน่วยงานท้องถิ่น
// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuGovernmentAgency",
//   chatBarText: "หน่วยงานท้องถิ่น",
//   areas: [
//     {
//       bounds: { x: 565, y: 1106, width: 965, height: 270},
//       action: {  type: "message", label: "เอกสาร MOU", text: "สนับสนุนปัจจัย" }
//     },
//     {
//       bounds: {x: 1529, y: 1106, width: 706, height: 270},
//       action: {  type: "message", label: "รายชื่อเกษตรกร", text: "พิกัดสวน" }
//     },
//     {
//       bounds: { x: 1280, y: 1493, width: 1211, height: 270 },
//       action: {  type: "message", label: "นัดพบเกษตรกร", text: "รายชื่อเกษตรกร" }
//     },
//     {
//       bounds: {x: 2211, y: 1368, width: 392, height: 509 },
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




//เมนูราชการ
// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuLocalAgency",
//   chatBarText: "หน่วยงานราชการ",
//   areas: [
//     {
//       bounds: {x: 391, y: 1553, width: 635, height: 204},
//       action: { type: "message", label: "เอกสาร MOU", text: "เอกสาร MOU" }
//       // หรือใช้ type: "uri" เช่น { type: "uri", label: "สนับสนุนปัจจัย", uri: "https://your-donate-link" }
//     },
//     {
//       bounds: { x: 1232, y: 1553, width: 722, height: 204 },
//       action: { type: "message", label: "รายชื่อเกษตรกร", text: "รายชื่อเกษตรกร" }
//       // หรือ { type: "uri", label: "พิกัดสวน", uri: "https://your-location-link" }
//     },
//     {
//       bounds: { x: 2068, y: 1553, width: 722, height: 204 },
//       action: { type: "message", label: "นัดพบเกษตรกร", text: "นัดพบเกษตรกร" }
//       // หรือ { type: "uri", label: "รายชื่อเกษตรกร", uri: "https://your-farmer-list-link" }
//     },
//     {
//       bounds: {x: 2289, y: 1043, width: 285, height: 398},
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

//เมนูหน่วยงานเอกชน
// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuEducational",
//   chatBarText: "หน่วยงานเอกชน",
//   areas: [
//     // 1. ติดตามสวน
//     {
//       bounds: {x: 398, y: 1500, width: 516, height: 204},
//       action: { type: "message", label: "พิกัดสวน", text: "พิกัดสวน" }
//     },
//     // 2. ฟาร์มตัวอย่าง
//     {
//       bounds: { x: 1232, y: 1500, width: 877, height: 204 },
//       action: { type: "message", label: "ผลผลิตพร้อมขาย", text: "ผลผลิตพร้อมขาย" }
//     },
//     // 3. ส่งภาพแปลงปลูก
//     {
//       bounds: { x: 2126, y: 1500, width: 606, height: 204 },
//       action: { type: "message", label: "รายชื่อสวน", text: "รายชื่อสวน" }
//     },
//     // 4. ติดต่อเจ้าหน้าที่ (มุมขวาล่าง)
//     {
//       bounds: {x: 2289, y: 1091, width: 285, height: 398 },
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
