
// src/app/api/farmer/chatgpt/route.js

export async function POST(req) {
  try {
    const { message, image, mime } = await req.json();

    // เตรียม messages (รองรับทั้งมีภาพ/ไม่มีภาพ)
    let messages;
    if (image) {
      // เช็ค mimetype (ถ้าไม่มีส่งมาก็ default เป็น jpeg)
      const imageMime = mime || "image/jpeg";
      messages = [
        { role: "system", content: "คุณคือผู้ช่วย AI ภาษาไทย" },
        {
          role: "user",
          content: [
            { type: "text", text: message || "วิเคราะห์ภาพนี้ให้หน่อย" },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMime};base64,${image}`,
              },
            },
          ],
        },
      ];
    } else {
      // ข้อความล้วน
      messages = [
        { role: "system", content: "คุณคือผู้ช่วย AI ภาษาไทย" },
        { role: "user", content: message },
      ];
    }

    // เรียก OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // หรือ "gpt-4o" ก็ได้ถ้า account ได้สิทธิ์
        messages,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();

    // ดัก error ของ OpenAI API
    if (data.error) {
      return Response.json({ reply: `Error: ${data.error.message}` });
    }

    // ตอบกลับปกติ
    const botReply = data.choices?.[0]?.message?.content || "ขออภัย ระบบมีปัญหา";
    return Response.json({ reply: botReply });

  } catch (err) {
    return Response.json({ reply: "ขออภัย ระบบมีปัญหาภายใน (server error)" });
  }
}
