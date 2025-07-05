const axios = require('axios');
const fs = require('fs');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';
const richMenuId = 'richmenu-e46d4ab20a88e706fafb29e99659ad50';
const imagePath = '../../../../../public/richmenu/All_RichManu.png';
const imageBuffer = fs.readFileSync(imagePath);

axios.post(
  `https://api.line.me/v2/bot/richmenu/${richMenuId}/content`,
  imageBuffer,
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "image/png",
    },
  }
)
.then(() => {
  console.log('Upload image success!');
})
.catch(err => {
  console.error('Upload image error:', err.response?.data || err.message);
});

