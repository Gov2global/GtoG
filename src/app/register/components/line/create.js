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
      action: { type: "uri", uri: "https://liff.line.me/2007697520-ReVxGaBb" }
    },
    {
      bounds: { x: 987, y: 1094, width: 640, height:293 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-m4qMPp1k" } 
    },
    {
      bounds: { x:1643, y: 1094, width: 558, height: 293 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-RkBMgYlp" } 
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
      action: { type: "uri", uri: "https://liff.line.me/2007697520-eb5NJ0jD" } //แจ้งผลผลิต
    },
 {
      bounds: { x: 1396, y: 1451, width: 603, height: 293 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-JzdQxW3y" } 
    },
    {
      bounds: { x: 2117, y: 1451, width: 695, height: 293},
      action: { type: "message", text: "สั่งซื้อผลิตภัณฑ์ปุ๋ย ยา" }
    },
    {
      bounds: { x: 2222, y: 634, width: 486, height: 293},
      action: { type: "message", text: "Hello Bot" }
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
//     areas: [
//     {
//       bounds: {x: 482, y: 1410, width: 780, height: 430},
//       action: {  type: "message", label: "ติดตามสวน", text: "ติดตามสวน" }
//     },
//     {
//       bounds: {x: 1353, y: 1410, width: 780, height: 430},
//       action: { type: "uri", uri: "https://liff.line.me/2007697520-RkBMgYlp" } 
//     },
//     {
//       bounds: {x: 2143, y: 1410, width: 631, height: 430},
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

//เมนูหน่วยงานท้องถิ่น
// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuGovernmentAgency",
//   chatBarText: "หน่วยงานท้องถิ่น",
  // areas: [
  //   {
  //     bounds: {x: 482, y: 1410, width: 780, height: 430},
  //     action: {  type: "message", label: "ติดตามสวน", text: "ติดตามสวน" }
  //   },
  //   {
  //     bounds: {x: 1353, y: 1410, width: 780, height: 430},
  //     action: { type: "uri", uri: "https://liff.line.me/2007697520-RkBMgYlp" } 
  //   },
  //   {
  //     bounds: {x: 2143, y: 1410, width: 631, height: 430},
  //     action: { type: "message", label: "ติดต่อเจ้าหน้าที่", text: "ติดต่อเจ้าหน้าที่" }
  //   }
  // ]
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
//       bounds: {x: 482, y: 1410, width: 780, height: 430},
//       action: { type: "message", label: "รายชื่อเกษตรกร", text: "รายชื่อเกษตรกร" }
//       // หรือใช้ type: "uri" เช่น { type: "uri", label: "สนับสนุนปัจจัย", uri: "https://your-donate-link" }
//     },
//     {
//       bounds: { x: 1353, y: 1410, width: 780, height: 430 },
//       action: { type: "uri", uri: "https://liff.line.me/2007697520-RkBMgYlp" } 
//       // หรือ { type: "uri", label: "พิกัดสวน", uri: "https://your-location-link" }
//     },
//     {
//       bounds: {x: 2143, y: 1410, width: 631, height: 430},
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
//   size: { width: 2500, height: 843 },
//   selected: true,
//   name: "RichMenuEducational",
//   chatBarText: "หน่วยงานเอกชน",
//   areas: [
//     // 1. ติดตามสวน
//     {
//       bounds: { x: 1031, y: 563, width: 631, height: 430 },
//       action: { type: "message", label: "รายชื่อสวน", text: "รายชื่อสวน" }
//     },
//     // 4. ติดต่อเจ้าหน้าที่ (มุมขวาล่าง)
//     {
//       bounds: { x: 1940, y: 512, width: 1031, height: 530},
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
