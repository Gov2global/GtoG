// api/admin/broadcastdelete/[id]
import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; 
import { connectMongoDB } from '../../../../../../lib/mongodb';
import BroadcastSetting from '../../../../../../models/BroadcastSetting';

export const runtime = 'nodejs';

export async function DELETE(_req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    // ลบแบบ atomic: ยังไม่ส่ง และไม่กำลังประมวลผล
    const res = await BroadcastSetting.deleteOne({
      _id: id,
      sent: false,
      status: { $ne: 'processing' },
    });

    if (res.deletedCount === 1) {
      return new NextResponse(null, { status: 204 });
    }

    // ล้มเหลว—ตรวจสอบสาเหตุ
    const doc = await BroadcastSetting.findById(id).lean();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (doc.sent) return NextResponse.json({ error: 'Already sent' }, { status: 400 });
    if (doc.status === 'processing') {
      return NextResponse.json({ error: 'In processing. Try again later.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Cannot delete' }, { status: 400 });
  } catch (err) {
    console.error('Broadcast DELETE Error:', err);
    return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
  }
}