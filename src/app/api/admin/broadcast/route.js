// api/admin/broadcast
import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../lib/mongodb';
import BroadcastSetting from '../../../../../models/BroadcastSetting';

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const {
      message, targetType, targetGroup, targetIds, sendAt,
      flexData, altText = 'ประกาศ/ประชาสัมพันธ์',
    } = body;

    if ((!message && !flexData) || !targetType || !sendAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sendAtDate = new Date(sendAt);
    if (Number.isNaN(sendAtDate.getTime())) {
      return NextResponse.json({ error: 'sendAt is invalid' }, { status: 400 });
    }

    const doc = await BroadcastSetting.create({
      messageType: flexData ? 'flex' : 'text',
      message: flexData ? '' : (message || '').trim(),
      flexData: flexData || null,
      altText,

      targetType,
      targetGroup: targetGroup || {},
      targetIds: Array.isArray(targetIds) ? targetIds : [],
      sendAt: sendAtDate,

      sent: false,
      status: 'queued',
    });

    return NextResponse.json({ success: true, broadcast: doc });
  } catch (err) {
    console.error('Broadcast API Error:', err);
    return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('perPage') || '10', 10), 50);
    const q = (searchParams.get('q') || '').trim();
    const status = searchParams.get('status') || '';        // queued|processing|done
    const upcoming = (searchParams.get('upcoming') || '1') === '1';

    const filter = {};
    if (upcoming) filter.sent = false;
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { message: { $regex: q, $options: 'i' } },
        { messageType: { $regex: q, $options: 'i' } },
        { 'flexData.title': { $regex: q, $options: 'i' } },
      ];
    }

    // ✅ ใหม่สุดอยู่บนสุด
    const sort = { sendAt: -1, createdAt: -1 };

    const total = await BroadcastSetting.countDocuments(filter);
    const items = await BroadcastSetting.find(filter)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return NextResponse.json({ page, perPage, total, items });
  } catch (err) {
    console.error('Broadcast GET Error:', err);
    return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
  }
}