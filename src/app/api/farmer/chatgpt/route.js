// src/app/api/farmer/chatgpt/route.js

export async function POST(req) {
  try {
    const { message, image, mime } = await req.json();

    // System Prompt - ระบุบทบาทให้ชัด
    const systemPrompt =
      "คุณคือผู้เชี่ยวชาญด้านการเกษตรมืออาชีพ หน้าที่ของคุณคือช่วยเหลือ User ในเรื่องนี้อย่างเชี่ยวชาญ โดยใช้ภาษาไทยเท่านั้น";

    // เตรียม messages (รองรับทั้งมีภาพ/ไม่มีภาพ)
    let messages;
    if (image) {
      // ถ้ามีภาพ
      const imageMime = mime || "image/jpeg";
      messages = [
        { role: "system", content: systemPrompt },
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
        { role: "system", content: systemPrompt },
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
        model: "gpt-4o", // หรือ "gpt-4-vision-preview" ถ้ามีสิทธิ์ vision
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
