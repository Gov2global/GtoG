// lib/line.js
import axios from 'axios';

export async function sendLineMessage(lineUserId, message, isFlex = false) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const data = {
    to: lineUserId,
    messages: [
      isFlex
        ? {
            type: 'flex',
            altText: '📢 แจ้งเตือนจากระบบ',
            contents: message, // [CHANGED: ส่ง Flex Object]
          }
        : {
            type: 'text',
            text: message,
          },
    ],
  };

  await axios.post(url, data, { headers });
}
