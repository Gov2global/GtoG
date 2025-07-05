const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';

const richMenuBody = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "Register",
  chatBarText: "ลงทะเบียนเข้างาน",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 2500, height: 1686 },
      action: {
        type: "uri",
        uri: "https://liff.line.me/2007697520-g59jM8X3",
      },
    },
  ],
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
