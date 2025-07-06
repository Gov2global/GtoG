import axios from "axios";

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function setRichMenuToUser(userId, richMenuId) {
  if (!CHANNEL_ACCESS_TOKEN) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is missing in environment.");
  }
  if (!userId || !richMenuId) {
    throw new Error("userId and richMenuId are required.");
  }

  try {
    const response = await axios.post(
      `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    // Logging for dev
    // console.error("Set RichMenu error:", error?.response?.data || error.message);
    throw error?.response?.data || new Error("Cannot set rich menu");
  }
}
