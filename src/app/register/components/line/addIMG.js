const axios = require('axios');
const fs = require('fs');
const path = require('path');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU='; // โหลดจาก .env จะดีกว่า
const richMenuId = 'richmenu-686c77465ec12879ec0a78ed82b45f61';

// ✅ ให้ path เป็น absolute
const imagePath = path.resolve(__dirname, '../../../../../public/richmenu/richmenu_1751820484363.jpg');

if (!fs.existsSync(imagePath)) {
  console.error('❌ ไม่พบไฟล์:', imagePath);
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);

axios.post(
  `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, // ✅ เปลี่ยน endpoint
  imageBuffer,
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "image/jpeg", // ✅ แก้ MIME type ให้ถูก
    },
  }
)
.then(() => {
  console.log('✅ Upload image success!');
})
.catch(err => {
  console.error('❌ Upload image error:', err.response?.data || err.message);
});
