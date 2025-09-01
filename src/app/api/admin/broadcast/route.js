// api/admin/broadcast
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../lib/mongodb';
import BroadcastSetting from '../../../../../models/BroadcastSetting';

// export async function POST(req) {
//   try {
//     await connectMongoDB();
//     const body = await req.json();

//     const {
//       message, targetType, targetGroup, targetIds, sendAt,
//       flexData, altText = 'ประกาศ/ประชาสัมพันธ์',
//     } = body;

//     if ((!message && !flexData) || !targetType || !sendAt) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     const sendAtDate = new Date(sendAt);
//     if (Number.isNaN(sendAtDate.getTime())) {
//       return NextResponse.json({ error: 'sendAt is invalid' }, { status: 400 });
//     }

//     const doc = await BroadcastSetting.create({
//       messageType: flexData ? 'flex' : 'text',
//       message: flexData ? '' : (message || '').trim(),
//       flexData: flexData || null,
//       altText,

//       targetType,
//       targetGroup: targetGroup || {},
//       targetIds: Array.isArray(targetIds) ? targetIds : [],
//       sendAt: sendAtDate,

//       sent: false,
//       status: 'queued',
//     });

//     return NextResponse.json({ success: true, broadcast: doc });
//   } catch (err) {
//     console.error('Broadcast API Error:', err);
//     return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
//   }
// }

// export async function GET(req) {
//   try {
//     await connectMongoDB();
//     const { searchParams } = new URL(req.url);

//     const page = parseInt(searchParams.get('page') || '1', 10);
//     const perPage = Math.min(parseInt(searchParams.get('perPage') || '10', 10), 50);
//     const q = (searchParams.get('q') || '').trim();
//     const status = searchParams.get('status') || '';        // queued|processing|done
//     const upcoming = (searchParams.get('upcoming') || '1') === '1';

//     const filter = {};
//     if (upcoming) filter.sent = false;
//     if (status) filter.status = status;
//     if (q) {
//       filter.$or = [
//         { message: { $regex: q, $options: 'i' } },
//         { messageType: { $regex: q, $options: 'i' } },
//         { 'flexData.title': { $regex: q, $options: 'i' } },
//       ];
//     }

//     // ✅ ใหม่สุดอยู่บนสุด
//     const sort = { sendAt: -1, createdAt: -1 };

//     const total = await BroadcastSetting.countDocuments(filter);
//     const items = await BroadcastSetting.find(filter)
//       .sort(sort)
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .lean();

//     return NextResponse.json({ page, perPage, total, items });
//   } catch (err) {
//     console.error('Broadcast GET Error:', err);
//     return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
//   }
// }

export const runtime = "nodejs";

function bad(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const {
      messageType,            // "text" | "flex" | "image"
      message,                // for text
      altText = "ประกาศ/ประชาสัมพันธ์",
      flexData,               // for flex
      media,                  // for image { originalContentUrl, previewImageUrl?, contentType?, sizeBytes? }
      targetType,             // "individual" | "group" | "all"
      targetIds,              // for individual
      targetGroup,            // for group { regType: string[], province: string[] }
      sendAt,                 // ISO string
    } = body || {};

    // --- validate sendAt ---
    const sendAtDate = new Date(sendAt);
    if (!sendAt || Number.isNaN(sendAtDate.getTime())) {
      return bad("sendAt is invalid");
    }

    // --- validate target ---
    if (!targetType) return bad("targetType is required");

    if (targetType === "individual") {
      if (!Array.isArray(targetIds) || targetIds.length === 0) {
        return bad("targetIds is required and must be a non-empty array for targetType=individual");
      }
    } else if (targetType === "group") {
      const r = Array.isArray(targetGroup?.regType) ? targetGroup.regType : [];
      const p = Array.isArray(targetGroup?.province) ? targetGroup.province : [];
      if (r.length === 0 && p.length === 0) {
        return bad("targetGroup.regType or targetGroup.province is required for targetType=group");
      }
    } else if (targetType !== "all") {
      return bad("targetType must be one of: individual | group | all");
    }

    // --- validate by messageType ---
    if (!messageType) return bad("messageType is required");
    const doc = {
      messageType,
      targetType,
      sendAt: sendAtDate,
      sent: false,
      status: "queued",
    };

    if (messageType === "text") {
      if (!message || !String(message).trim()) return bad("message is required for text");
      doc.message = String(message).trim();
    } else if (messageType === "flex") {
      if (!altText || !String(altText).trim()) return bad("altText is required for flex");
      if (!flexData) return bad("flexData is required for flex");
      doc.altText = String(altText);
      doc.flexData = flexData;
    } else if (messageType === "image") {
      const img = media?.originalContentUrl;
      if (!img || !String(img).trim()) return bad("media.originalContentUrl is required for image");
      doc.media = {
        originalContentUrl: String(img),
        previewImageUrl: media?.previewImageUrl || String(img),
        contentType: media?.contentType || "",
        sizeBytes: Number(media?.sizeBytes || 0),
      };
    } else {
      return bad("messageType must be one of: text | flex | image");
    }

    // --- map targets ---
    if (targetType === "individual") {
      doc.targetIds = targetIds;
      doc.targetGroup = { regType: [], province: [] };
    } else if (targetType === "group") {
      doc.targetGroup = {
        regType: Array.isArray(targetGroup?.regType) ? targetGroup.regType : [],
        province: Array.isArray(targetGroup?.province) ? targetGroup.province : [],
      };
      doc.targetIds = [];
    } else { // all
      doc.targetIds = [];
      doc.targetGroup = { regType: [], province: [] };
    }

    const created = await BroadcastSetting.create(doc); // schema จะ validate อีกรอบ
    return NextResponse.json({ ok: true, id: created._id }, { status: 201 });
  } catch (err) {
    console.error("Broadcast API Error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = Math.min(parseInt(searchParams.get("perPage") || "10", 10), 50);
    const q = (searchParams.get("q") || "").trim();
    const status = searchParams.get("status") || ""; // queued|processing|done
    const upcoming = (searchParams.get("upcoming") || "1") === "1";

    const filter = {};
    if (upcoming) filter.sent = false;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { message: { $regex: q, $options: "i" } },
        { messageType: { $regex: q, $options: "i" } },
        { "flexData.title": { $regex: q, $options: "i" } },
      ];
    }

    const sort = { sendAt: -1, createdAt: -1 };
    const total = await BroadcastSetting.countDocuments(filter);
    const items = await BroadcastSetting.find(filter)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return NextResponse.json({ page, perPage, total, items });
  } catch (err) {
    console.error("Broadcast GET Error:", err);
    return NextResponse.json({ ok: false, error: err.message || "Server Error" }, { status: 500 });
  }
}