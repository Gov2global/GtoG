// อ่าน user จาก cookie "session" ฝั่งเซิร์ฟเวอร์
import { cookies } from 'next/headers'
import { connectDB } from './mongodb.js'
import Users from '../models/users.js'

export async function getCurrentUser() {
  const sessionId = cookies().get('session')?.value
  if (!sessionId) return null
  await connectDB()
  const u = await Users.findOne({ sessionId, isActive: true })
  if (!u) return null
  return { id: u.id, role: u.role, name: u.name, email: u.email }
}
