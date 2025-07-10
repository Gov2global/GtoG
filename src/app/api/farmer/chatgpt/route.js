// src/app/api/farmer/chatgpt/route.js

export async function POST(req) {
  const { message } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "คุณคือผู้ช่วย AI ภาษาไทย" },
        { role: "user", content: message },
      ],
      temperature: 0.6,
      max_tokens: 1024,
      stream: false,
    }),
  });

  const data = await res.json();
  const botReply = data.choices?.[0]?.message?.content || "ขออภัย ระบบมีปัญหา";
  return Response.json({ reply: botReply });
}
