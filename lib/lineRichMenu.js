// Utility ฟังก์ชันสำหรับ set rich menu ให้ user แต่ละคน
import axios from "axios";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function setRichMenuToUser(userId, richMenuId) {
  return axios.post(
    `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}
