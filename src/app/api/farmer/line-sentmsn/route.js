// api/farmer/line-sentmsn
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing userId or message" });
  }

  // กรอก access token ของ LINE OA ตัวเอง!
  const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  try {
    const pushRes = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: "text",
            text: message,
          },
        ],
      }),
    });

    const data = await pushRes.json();

    if (pushRes.ok) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(400).json({ success: false, error: data });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}