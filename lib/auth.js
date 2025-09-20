// lib/auth.js
import 'server-only';                // ป้องกันถูก import ฝั่ง client
import { cookies } from 'next/headers';
import { connectMongoDB } from './mongodb';
import Users from '../models/users';

export async function getCurrentUser() {
  // ⬇️ ต้อง await
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;
  if (!sessionId) return null;

  await connectMongoDB();

  // ดึงเฉพาะฟิลด์ที่ต้องใช้ + .lean() ให้ออกมาเป็น plain object
  const u = await Users.findOne(
    { sessionId, isActive: true },
    { _id: 0, id: 1, role: 1, name: 1, email: 1 }
  ).lean();

  if (!u) return null;
  return { id: u.id, role: u.role, name: u.name, email: u.email };
}
