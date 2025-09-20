// // lib/broadcastScheduler.js

// import { connectMongoDB } from './mongodb'; // [UNCHANGED]
// import BroadcastSetting from '../models/BroadcastSetting'; // [UNCHANGED]
// import Register from '../models/register'; // [UNCHANGED]
// import { sendLineMessage } from '../lib/line'; // [UNCHANGED]
// import { buildFlexBubble } from './buildFlexBubble.js'; // [CHANGED: ใส่ .js และใช้ named import แน่นอน]
// import crypto from 'crypto'; // [UNCHANGED]

// /** คืนจำนวนงานที่ประมวลผลได้ในรอบนี้ */
// export async function processDueBroadcasts() {
//   await connectMongoDB(); // [UNCHANGED]
//   const now = new Date(); // [UNCHANGED]
//   let processed = 0; // [UNCHANGED]

//   while (true) { // [UNCHANGED]
//     const lockId = crypto.randomUUID(); // [UNCHANGED]
//     const broadcast = await BroadcastSetting.findOneAndUpdate(
//       {
//         sent: false,
//         status: 'queued',
//         sendAt: { $lte: now },
//       },
//       {
//         $set: {
//           status: 'processing',
//           lockId,
//           lockedAt: new Date(),
//         },
//       },
//       { new: true }
//     );

//     if (!broadcast) break; // [UNCHANGED]

//     try {
//       // 2) resolve targets
//       let targets = []; // [UNCHANGED]
//       if (broadcast.targetType === 'all') {
//         targets = await Register.find({ regLineID: { $ne: null } }, { regLineID: 1 }).lean();
//       } else if (broadcast.targetType === 'group') {
//         const group = broadcast.targetGroup || {};
//         targets = await Register.find({ ...group, regLineID: { $ne: null } }, { regLineID: 1 }).lean();
//       } else if (broadcast.targetType === 'individual') {
//         targets = await Register.find({ regLineID: { $in: broadcast.targetIds || [] } }, { regLineID: 1 }).lean();
//       }

//       let ok = 0, fail = 0; // [UNCHANGED]
//       for (const u of targets) {
//         if (!u?.regLineID) continue; // [UNCHANGED]
//         try {
//           if (broadcast.flexData) {
//             const flexContent = buildFlexBubble(broadcast.flexData); // [UNCHANGED: ใช้ฟังก์ชันจากไฟล์ใหม่]
//             await sendLineMessage(u.regLineID, flexContent, true);   // [UNCHANGED: ส่งแบบ Flex]
//           } else {
//             await sendLineMessage(u.regLineID, broadcast.message);   // [UNCHANGED: ส่ง text]
//           }
//           ok++; // [UNCHANGED]
//         } catch (e) {
//           fail++; // [UNCHANGED]
//           console.error(`[LINE Error] ${u.regLineID}:`, e?.response?.data || e.message); // [UNCHANGED]
//         }
//       }

//       // 3) mark done
//       await BroadcastSetting.updateOne(
//         { _id: broadcast._id, lockId },
//         { $set: { sent: true, status: 'done' } }
//       );

//       console.log(`[Worker] Broadcast ${broadcast._id} sent: ok=${ok} fail=${fail}`); // [UNCHANGED]
//       processed++; // [UNCHANGED]
//     } catch (e) {
//       await BroadcastSetting.updateOne(
//         { _id: broadcast._id, lockId },
//         { $set: { status: 'queued', lockId: null, lockedAt: null } }
//       );
//       console.error(`[Worker Error] ${broadcast._id}:`, e); // [UNCHANGED]
//     }
//   }

//   return processed; // [UNCHANGED]
// }

// // [REMOVED: ถ้ามีการประกาศ buildFlexBubble ในไฟล์นี้ ให้ลบออกทั้งหมด เพื่อหลีกเลี่ยงชนกัน]


// lib/broadcastScheduler.js

// lib/broadcastScheduler.js

import { connectMongoDB } from './mongodb';
import BroadcastSetting from '../models/BroadcastSetting';
import Register from '../models/register';
import { sendFromJob } from './line'; // ✅ ใช้ helper เดียว ครอบทุกชนิดข้อความ
import crypto from 'crypto';

export async function processDueBroadcasts() {
  await connectMongoDB();
  const now = new Date();
  let processed = 0;

  while (true) {
    const lockId = crypto.randomUUID();
    const broadcast = await BroadcastSetting.findOneAndUpdate(
      { sent: false, status: 'queued', sendAt: { $lte: now } },
      { $set: { status: 'processing', lockId, lockedAt: new Date() } },
      { new: true }
    );

    if (!broadcast) break;

    try {
      // --- resolve targets ---
      let targets = [];
      if (broadcast.targetType === 'all') {
        targets = await Register.find({ regLineID: { $ne: null } }, { regLineID: 1 }).lean();
      } else if (broadcast.targetType === 'group') {
        // ถ้าฟิลด์ใน DB เป็น array ให้ปรับ query เป็น $in เองตามสคีมาใช้งานจริง
        const group = broadcast.targetGroup || {};
        const query = { regLineID: { $ne: null } };
        if (Array.isArray(group.regType) && group.regType.length) {
          query.regType = { $in: group.regType };
        }
        if (Array.isArray(group.province) && group.province.length) {
          query.province = { $in: group.province };
        }
        targets = await Register.find(query, { regLineID: 1 }).lean();
      } else if (broadcast.targetType === 'individual') {
        targets = await Register.find(
          { regLineID: { $in: broadcast.targetIds || [] } },
          { regLineID: 1 }
        ).lean();
      }

      // unique
      const seen = new Set();
      const userIds = [];
      for (const t of targets) {
        const id = t?.regLineID;
        if (id && !seen.has(id)) { seen.add(id); userIds.push(id); }
      }

      // --- send ---
      let ok = 0, fail = 0;
      for (const to of userIds) {
        try {
          // ✅ ส่งตาม messageType ของ doc: text / flex / image
          await sendFromJob(to, broadcast);
          ok++;
        } catch (e) {
          fail++;
          console.error(`[LINE Error] ${to}:`, e?.response?.data || e?.message || e);
        }
      }

      // --- mark done ---
      await BroadcastSetting.updateOne(
        { _id: broadcast._id, lockId },
        { $set: { sent: true, status: 'done', lockId: null, lockedAt: null } }
      );

      console.log(`[Worker] Broadcast ${broadcast._id} sent: ok=${ok} fail=${fail}`);
      processed++;
    } catch (e) {
      // คืนคิว (ปลดล็อก) ให้ลองรอบหน้า
      await BroadcastSetting.updateOne(
        { _id: broadcast._id, lockId },
        { $set: { status: 'queued', lockId: null, lockedAt: null } }
      );
      console.error(`[Worker Error] ${broadcast._id}:`, e);
    }
  }

  return processed;
}
