// api/line-message


import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const res = await fetch("https://api.line.me/v2/bot/message/push", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
//       },
//       body: JSON.stringify({
//         to: "U9522cc6ee5337c62188de55406470c41", // 🔹 regLineID ของคุณ
//         messages: [{ type: "text", text: "🚀 ทดสอบส่งข้อความจาก OA สำเร็จ!" }],
//       }),
//     });

//     const result = await res.json();
//     return NextResponse.json({ status: res.status, result });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }


export async function GET() {
  const flexMessage = {
    type: "flex",
    altText: "ทดสอบ Flex",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          { type: "text", text: "Hello Flex!" }
        ]
      }
    }
  };

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: "U9522cc6ee5337c62188de55406470c41", // 👈 userId เดิม
      messages: [flexMessage],
    }),
  });

  const text = await res.text();
  return NextResponse.json({ status: res.status, text });
}