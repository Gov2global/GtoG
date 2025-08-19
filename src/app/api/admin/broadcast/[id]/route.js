// api/admin/broadcast/[id]
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import BroadcastSetting from '../../../../../../models/BroadcastSetting';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const item = await BroadcastSetting.findById(id).lean();
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error('Broadcast GET:id Error:', err);
    return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const current = await BroadcastSetting.findById(id);
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (current.sent) return NextResponse.json({ error: 'Already sent' }, { status: 400 });
    if (current.status === 'processing') {
      return NextResponse.json({ error: 'In processing. Try again later.' }, { status: 409 });
    }

    const body = await req.json();

    // อนุญาตให้แก้เฉพาะฟิลด์เหล่านี้
    const update = {};

    // target
    if (body.targetType) update.targetType = body.targetType;
    if (body.targetGroup) update.targetGroup = body.targetGroup;
    if (Array.isArray(body.targetIds)) update.targetIds = body.targetIds;

    // schedule
    if (body.sendAt) {
      const dt = new Date(body.sendAt);
      if (Number.isNaN(dt.getTime())) {
        return NextResponse.json({ error: 'sendAt is invalid' }, { status: 400 });
      }
      update.sendAt = dt;
    }

    // content
    if (body.messageType === 'text') {
      update.messageType = 'text';
      update.message = (body.message || '').trim();
      update.flexData = null;
      update.altText = '';
    } else if (body.messageType === 'flex') {
      update.messageType = 'flex';
      update.message = '';
      update.flexData = body.flexData || null;
      update.altText = body.altText || 'ประกาศ/ประชาสัมพันธ์';
    }

    const updated = await BroadcastSetting.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error('Broadcast PUT:id Error:', err);
    return NextResponse.json({ error: 'Server Error', detail: err.message }, { status: 500 });
  }
}
