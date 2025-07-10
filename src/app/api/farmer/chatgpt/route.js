// src/app/api/farmer/chatgpt/route.js

export async function POST(req) {
  try {
    const { message, images } = await req.json();

    const systemPrompt =
      "คุณคือผู้เชี่ยวชาญด้านการเกษตรมืออาชีพ หน้าที่ของคุณคือช่วยเหลือ User ในเรื่องนี้อย่างเชี่ยวชาญ โดยใช้ภาษาไทยเท่านั้น";

    let messages;
    if (images && images.length > 0) {
      const imageContents = images.map(img => ({
        type: "image_url",
        image_url: {
          url: `data:${img.mime};base64,${img.base64}`
        }
      }));

      messages = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: message || "วิเคราะห์ภาพเหล่านี้ให้หน่อย" },
            ...imageContents
          ]
        }
      ];
    } else {
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
    }

    // เรียก OpenAI
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // หรือ "gpt-4-vision-preview"
        messages,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();
    if (data.error) {
      return Response.json({ reply: `Error: ${data.error.message}` });
    }
    const botReply = data.choices?.[0]?.message?.content || "ขออภัย ระบบมีปัญหา";
    return Response.json({ reply: botReply });

  } catch (err) {
    return Response.json({ reply: "ขออภัย ระบบมีปัญหาภายใน (server error)" });
  }
}
