const axios = require('axios');

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const richMenuId = 'richmenu-de998bd0e0ffeb7d4bdacf46a282c010';

axios.get(
  `https://api.line.me/v2/bot/richmenu/${richMenuId}/content`,
  {
    headers: {
      Authorization: `Bearer ${channelAccessToken}`,
    },
    responseType: 'arraybuffer', // จะได้เป็น buffer ภาพ ถ้ามีรูป
  }
).then(res => {
  if (res.status === 200) {
    console.log('✅ RichMenu นี้มีรูปภาพ (buffer length: ' + res.data.byteLength + ')');
    // สามารถ save เป็นไฟล์ดูได้:
    require('fs').writeFileSync('richmenu-img.png', res.data);
  }
}).catch(err => {
  if (err.response?.status === 404) {
    console.log('❌ RichMenu นี้ "ไม่มีรูป" (ต้อง upload image ก่อน)');
  } else {
    console.log('❌ ERROR:', err.message);
  }
});
