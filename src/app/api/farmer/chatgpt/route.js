// src/app/api/farmer/chatgpt/route.js

export async function POST(req) {
  const { message, image } = await req.json();

  const messages = [
    { role: "system", content: "คุณคือผู้ช่วย AI ภาษาไทย" },
    { role: "user", content: [
        { type: "text", text: message },
        ...(image ? [{ type: "image_url", image_url: { "url": `data:image/jpeg;base64,${image}` } }] : [])
      ]},
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-vision-preview", // ต้องใช้ model ที่รองรับภาพ
      messages,
      max_tokens: 1024,
    }),
  });

  const data = await res.json();
  const botReply = data.choices?.[0]?.message?.content || "ขออภัย ระบบมีปัญหา";
  return Response.json({ reply: botReply });
}
