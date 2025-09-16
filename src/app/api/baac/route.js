
// app/api/baac/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import Baac from "../../../../models/baac";

function pad(num, size) {
  return num.toString().padStart(size, "0");
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    // ✅ gen baac_ID (YYMMDD + running 4 digit)
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = pad(now.getMonth() + 1, 2);
    const dd = pad(now.getDate(), 2);
    const prefix = `${yy}${mm}${dd}`;

    const lastEntry = await Baac.findOne({ baac_ID: new RegExp(`^${prefix}`) })
      .sort({ baac_ID: -1 })
      .lean();

    let seq = 1;
    if (lastEntry) {
      const lastSeq = parseInt(lastEntry.baac_ID.slice(-4), 10);
      seq = lastSeq + 1;
    }

    const baac_ID = `${prefix}${pad(seq, 4)}`;

    // ✅ ensure dob is Date
    if (body.dob) {
      body.dob = new Date(body.dob);
    }

    // ✅ Save to MongoDB
    const newBaac = await Baac.create({ ...body, baac_ID });

    // ✅ Push LINE Flex Message (ไม่ให้พังถ้า LINE error)
    let lineResult = null;
    if (body.regLineID) {
      const flexMessage = {
        type: "flex",
        altText: "📋 ยืนยันการลงทะเบียน ธ.ก.ส.",
        contents: {
          type: "bubble",
          size: "mega",
          hero: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "✅ ส่งคำขอสำเร็จ!",
                weight: "bold",
                size: "xl",
                align: "center",
                color: "#1E824C",
              },
            ],
            paddingAll: "20px",
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: `รหัสลงทะเบียน: ${baac_ID}`,
                weight: "bold",
                size: "md",
              },
              {
                type: "text",
                text: `${body.firstName || ""} ${body.lastName || ""}`,
                size: "sm",
                color: "#555555",
              },
              {
                type: "text",
                text: `เบอร์: ${body.phone || "-"}`,
                size: "sm",
                color: "#555555",
              },
              {
                type: "text",
                text: "เจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้",
                margin: "md",
                size: "sm",
                color: "#888888",
              },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#1E824C",
                action: {
                  type: "uri",
                  label: "📑 ตรวจสอบข้อมูล",
                  uri: `https://farmer-eight-mu.vercel.app/baac-status/${baac_ID}`,
                },
              },
            ],
          },
        },
      };

      const payload = {
        to: body.regLineID,
        messages: [flexMessage],
      };

      try {
        const resLine = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify(payload),
        });

        const text = await resLine.text();
        console.log("📨 LINE API status:", resLine.status);
        console.log("📨 LINE API response:", text);

        lineResult = { status: resLine.status, response: text };
      } catch (err) {
        console.error("❌ LINE push error:", err.message);
        lineResult = { error: err.message };
      }
    }

    return NextResponse.json(
      { success: true, data: newBaac, line: lineResult },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error saving BAAC:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}