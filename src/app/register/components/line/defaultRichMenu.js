
const fs = require('fs');
const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU='; // Token เดิม
const richMenuId = 'richmenu-96d0dfce214c4670e25bf1c4180b2cda'; // richMenuId ของคุณ
const imagePath = '../../../../../public/richmenu/AllRichManu.png'; // ถ้าอยู่ใน public\richmenu\All_RichManu.png

axios.post(
  `https://api.line.me/v2/bot/richmenu/${richMenuId}/content`,
  fs.createReadStream(imagePath),
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "image/png"
    }
  }
)
.then(res => {
  console.log('อัปโหลดรูป RichMenu สำเร็จ', res.data);
})
.catch(err => {
  console.error('Error:', err.response?.data || err.message);
});
