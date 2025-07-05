const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

const richMenuBody = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "LargeMenu",
  chatBarText: "เมนูใหญ่",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 1250, height: 1686 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-g59jM8X3" }
    },
    {
      bounds: { x: 1250, y: 0, width: 1250, height: 1686 },
      action: { type: "uri", uri: "https://liff.line.me/2007697520-g59jM8X3" }
    }
  ]
};

async function createRichMenu() {
  try {
    const response = await axios.post(
      "https://api.line.me/v2/bot/richmenu",
      richMenuBody,
      {
        headers: {
          "Authorization": `Bearer ${channelAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log('✅ RichMenu created successfully!');
    console.log('RichMenuId:', response.data.richMenuId);
    // ถ้าอยากไป upload รูปต่อ เอา id นี้ไปใช้ได้เลย
  } catch (err) {
    console.error('❌ Failed to create RichMenu:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

createRichMenu();
