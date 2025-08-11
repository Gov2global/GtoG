// api/farmer/users
import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/mongodb';
import Users from '../../../../../models/users';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body?.username || !body?.password || !body?.name || !body?.email || !body?.phone || !body?.role) {
      return NextResponse.json({ message: 'กรอกข้อมูลไม่ครบ' }, { status: 400 });
    }
    if (String(body.password).length < 6) {
      return NextResponse.json({ message: 'รหัสผ่านอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
    }

    const doc = await Users.create(body);
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      const fields = Object.keys(err.keyPattern || {});
      return NextResponse.json({ message: `ข้อมูลซ้ำ: ${fields.join(', ')}` }, { status: 409 });
    }
    return NextResponse.json({ message: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Math.min(Number(searchParams.get('pageSize') || 10), 100);

    const filter = q
      ? { $or: [{ name: new RegExp(q, 'i') }, { username: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }
      : {};

    const [items, total] = await Promise.all([
      Users.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
      Users.countDocuments(filter),
    ]);

    return NextResponse.json({ items, total, page, pageSize });
  } catch (err) {
    return NextResponse.json({ message: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
