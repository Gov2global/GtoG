const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';
const richMenuId = 'richmenu-fc4e718786460aae6d82a6b4626492ec'; // richMenuId ที่ upload รูปสำเร็จแล้ว

axios.post(
  `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
  {},
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json",
    },
  }
)
.then(() => {
  console.log('✅ Set Default RichMenu success!');
})
.catch((err) => {
  console.error('❌ Set Default RichMenu error:', err.response?.data || err.message);
});
