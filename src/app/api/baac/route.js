
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

    // ✅ gen baac_ID
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

    // ✅ บันทึกข้อมูลลง MongoDB
    const newBaac = await Baac.create({ ...body, baac_ID });

    // ✅ ส่งข้อความไปที่ LINE (เฉพาะ user ที่ส่งฟอร์ม)
    if (body.regLineID) {
      try {
        const resLine = await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            to: body.regLineID,
            messages: [
              {
                type: "text",
                text: `✅ ส่งคำขอสำเร็จ!\nรหัสลงทะเบียนของคุณคือ ${baac_ID}\nเจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้`,
              },
            ],
          }),
        });

        if (!resLine.ok) {
          const errText = await resLine.text();
          console.error("❌ LINE Push Error:", errText);
        }
      } catch (err) {
        console.error("❌ Error sending LINE message:", err);
      }
    }

    return NextResponse.json({ success: true, data: newBaac }, { status: 201 });
  } catch (err) {
    console.error("❌ Error saving BAAC:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const list = await Baac.find().sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    console.error("❌ Error fetching BAAC:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}