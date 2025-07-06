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



// const axios = require('axios');

// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

// const richMenuBody = {
//   size: { width: 2500, height: 1686 },
//   selected: true,
//   name: "RichMenuFarmer",
//   chatBarText: "เกษตรกร",
//   areas: [
//     {
//       bounds: { x: 0, y: 843, width: 834, height: 421 },
//       action: { type: "message", text: "เช็คภาระกิจ" }
//     },
//     {
//       bounds: { x: 833, y: 843, width: 834, height: 421 },
//       action: { type: "message", text: "ลงทะเบียนเข้าร่วม GAP" }
//     },
//     {
//       bounds: { x: 1667, y: 843, width: 834, height: 421 },
//       action: { type: "message", text: "ติดต่อเจ้าหน้าที่" }
//     },
//     {
//       bounds: { x: 0, y: 1264, width: 834, height: 421 },
//       action: { type: "message", text: "แจ้งผลผลิต" }
//     },
//     {
//       bounds: { x: 833, y: 1264, width: 834, height: 421 },
//       action: { type: "message", text: "ขอเงินสนับสนุน" }
//     },
//     {
//       bounds: { x: 1667, y: 1264, width: 834, height: 421 },
//       action: { type: "message", text: "สั่งซื้อผลิตภัณฑ์ปุ๋ย ยา" }
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




const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';


const richMenuBody = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "fruit_premium_menu",
  chatBarText: "เมนูหลัก",
  areas: [
    {
      bounds: { x: 0, y: 1286, width: 625, height: 400 },
      action: { type: "uri", uri: "https://your-location-link" }
    },
    {
      bounds: { x: 625, y: 1286, width: 625, height: 400 },
      action: { type: "uri", uri: "https://your-produce-link" }
    },
    {
      bounds: { x: 1250, y: 1286, width: 625, height: 400 },
      action: { type: "uri", uri: "https://your-gardens-link" }
    },
    {
      bounds: { x: 1875, y: 1286, width: 625, height: 400 },
      action: { type: "message", text: "ติดต่อเจ้าหน้าที่" }
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
