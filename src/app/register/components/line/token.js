// const axios = require('axios');
// const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';
// axios.get(
//   'https://api.line.me/v2/bot/richmenu/list',
//   { headers: { "Authorization": `Bearer ${channelAccessToken}` } }
// ).then(res => {
//   console.log('RichMenu List:', res.data);
// });


const axios = require('axios');
const richMenuId = 'richmenu-de998bd0e0ffeb7d4bdacf46a282c010'; // หรือ id ไหนก็ได้
const token = '...';
axios.get(`https://api.line.me/v2/bot/richmenu/${richMenuId}/content`, {
  headers: { Authorization: `Bearer ${token}` },
  responseType: 'arraybuffer'
}).then(res => {
  console.log('✅ RichMenu นี้มีรูป!');
}).catch(err => {
  if (err.response?.status === 404) {
    console.log('❌ RichMenu นี้ “ไม่มีรูป” (ต้อง upload image ก่อน)');
  } else {
    console.log('❌ ERROR:', err.message);
  }
});
