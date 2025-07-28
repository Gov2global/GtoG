// src/app/api/farmer/chatgpt/route.js
export async function POST(req) {
  try {
    const { history } = await req.json();

    const systemPrompt = `
      คุณคือปราชญ์เกษตรผู้มีประสบการณ์กว่า 50 ปี
      - วิเคราะห์ “อาการในภาพ” ว่าเกิดจาก โรค แมลง สัตว์ศัตรูพืช หรือปัจจัยแวดล้อมใด
      - อธิบายชนิดของโรค/แมลง/สาเหตุ พร้อมสาเหตุ ปัจจัยที่กระตุ้น หรือสภาพอากาศ/อุณหภูมิที่เสี่ยง
      - ยกตัวอย่างวิธีสังเกตลักษณะเฉพาะที่แยกแยะโรคกับแมลงและปัจจัยอื่น
      - แนะนำการจัดการป้องกัน-แก้ไขเบื้องต้น (ธรรมชาติ/เคมี/ชีวภาพ)
      - ตอบภาษาไทย สุภาพ ละเอียด ชี้จุดที่ควรสังเกตและเตือนผู้ใช้งาน
      - ถ้ามีข้อมูลไม่พอ ให้แจ้งให้ชัดเจนว่าต้องการข้อมูลเพิ่มหรือให้ผู้ใช้อัพโหลดภาพชัดเจนขึ้น
      - หาก user มีประวัติหรือ context ก่อนหน้า ให้ตอบต่อเนื่องกับบทสนทนา
    `;

    // Helper: filter เฉพาะ image mime type
    const filterImage = (img) =>
      img &&
      typeof img.mime === "string" &&
      img.mime.startsWith("image/") &&
      typeof img.base64 === "string" &&
      img.base64.length > 0;

    // ---- Build messages array ----
    let messages = [
      { role: "system", content: systemPrompt },
      ...(history?.map(item => {
        if (item.role === "user" && Array.isArray(item.images) && item.images.length > 0) {
          const imageContents = item.images
            .filter(filterImage)
            .map(img => ({
              type: "image_url",
              image_url: { url: `data:${img.mime};base64,${img.base64}` }
            }));

          // ถ้าไม่มีรูป valid เลย fallback เป็นข้อความปกติ
          if (imageContents.length === 0) {
            return { role: "user", content: item.content || "" };
          }
          // ถ้า user ไม่พิมพ์ข้อความ ให้ gen คำถามให้อัตโนมัติ
          const userText = item.content?.trim()
            ? item.content
            : "โปรดวิเคราะห์ภาพนี้: แจ้งว่าเกิดโรค แมลง หรือปัจจัยอะไร มีช่วงอุณหภูมิหรือสภาพแวดล้อมอะไรที่เกี่ยวข้อง พร้อมวิธีป้องกัน/แก้ไข";
          return {
            role: "user",
            content: [
              { type: "text", text: userText },
              ...imageContents
            ]
          };
        }
        // ปกติ (ไม่มีรูป)
        return { role: item.role, content: item.content || "" };
      }) || [])
    ];

    // เรียก OpenAI API
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 1400,
        temperature: 0.25,
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
