// src/app/api/farmer/chatgpt/route.js
export async function POST(req) {
  try {
    const { message, images } = await req.json();

    const systemPrompt = `
      คุณคือปราชญ์เกษตรผู้มีประสบการณ์กว่า 50 ปี
      - ช่วยแนะนำ ตอบคำถาม และวิเคราะห์ปัญหาทางการเกษตร
      - ตอบด้วยความรู้ลึกซึ้ง ร้อยเรียงคำตอบอย่างผู้มีประสบการณ์
      - เมื่อมีภาพและคำถาม ให้เชื่อมโยง วิเคราะห์แบบองค์รวม
      - อธิบายเนื้อหาให้เข้าใจง่าย เหมือนถ่ายทอดความรู้ให้คนรุ่นใหม่
      - ตอบภาษาไทย สุภาพ จริงใจ
      - หากข้อมูลไม่พอ ให้ถามกลับแบบชี้แนะ
      - หากพบจุดเด่น/จุดอ่อน ให้สรุปให้ครบถ้วน
    `;

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
            {
              type: "text",
              text: message
                ? `โปรดวิเคราะห์ภาพและข้อมูลต่อไปนี้โดยเชื่อมโยงกันในบริบทเดียว: ${message}`
                : "โปรดวิเคราะห์ภาพเหล่านี้ พร้อมร้อยเรียงเนื้อหาวิเคราะห์ให้เชื่อมโยงกันเป็นองค์รวม"
            },
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

    // ใช้ gpt-4o สำหรับทุกกรณี
    const model = "gpt-4o";

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1200,
        temperature: 0.3, // ตอบเนื้อหาเชื่อมโยง ร้อยเรียงขึ้นเล็กน้อย
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
