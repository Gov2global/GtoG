const axios = require('axios');

const channelAccessToken = 'ZTaeR+B5PFNxv6Aye7iTYX9nLUqL52zPvvcu/x0r1Ej5vMBGno/xvMCq9nUYXt3TpqsZ9zo3UMjFlABu+f6VpNrelGI6RlRyVVr2mrNNP5c24rspXi4CJWQBIfk5kpi1C5EtQ1srjQ9eg+YHdVoENAdB04t89/1O/w1cDnyilFU=';
const richMenuId = 'richmenu-3885f8f149520f74e1b16fa7d9457a98';

axios.delete(
  `https://api.line.me/v2/bot/richmenu/${richMenuId}`,
  {
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
    },
  }
).then(res => {
  console.log('RichMenu deleted');
}).catch(err => {
  console.error('Error:', err.response?.data || err.message);
});
