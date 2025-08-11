//  api/auth/login
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { connectDB } from '../../../../../lib/mongodb'
import Users from '../../../../../models/users'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'


export async function POST(req) {
  try {
    await connectDB()
    const { identifier, password, remember } = await req.json()
    if (!identifier || !password) {
      return NextResponse.json({ message: 'กรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน' }, { status: 400 })
    }

    const idLower = String(identifier).trim().toLowerCase()
    const user = await Users.findOne({
      $or: [{ email: idLower }, { username: idLower }],
    })
      .select('+password role isActive') // ต้องมี +password เพื่อ override select:false
      .lean()                            // ✅ เร็วขึ้น

    if (!user) return NextResponse.json({ message: 'ไม่พบบัญชีผู้ใช้' }, { status: 401 })
    if (!user.isActive) return NextResponse.json({ message: 'บัญชีถูกปิดการใช้งาน' }, { status: 403 })

    const ok = await bcrypt.compare(String(password), user.password)
    if (!ok) {
      await Users.updateOne({ _id: user._id }, { $inc: { failedLoginAttempts: 1 } })
      return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    const sessionId = crypto.randomUUID()
    await Users.updateOne(
      { _id: user._id },
      { $set: { sessionId, lastLoginAt: new Date(), failedLoginAttempts: 0 } }
    )

    const res = NextResponse.json({ ok: true, role: user.role, redirect: '/admin/menu' })
    res.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    })
    return res
  } catch (err) {
    return NextResponse.json({ message: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}