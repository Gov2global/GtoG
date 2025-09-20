//  api/auth/login
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { connectMongoDB } from '../../../../../lib/mongodb'
import Users from '../../../../../models/users'
import bcrypt from 'bcrypt'              // ✅ ใช้ native แทน bcryptjs
import crypto from 'crypto'

export async function POST(req) {
  const t0 = Date.now()
  try {
    await connectMongoDB()

    let payload
    try {
      payload = await req.json()
    } catch (_) {
      return NextResponse.json({ message: 'รูปแบบคำขอไม่ถูกต้อง' }, { status: 400 })
    }

    const identifier = String(payload?.identifier || '').trim().toLowerCase()
    const password   = String(payload?.password || '')
    const remember   = !!payload?.remember

    if (!identifier || !password) {
      return NextResponse.json({ message: 'กรอกอีเมล/ชื่อผู้ใช้ และรหัสผ่าน' }, { status: 400 })
    }

    // ✅ ใส่ isActive ใน query (ตรงกับ index) + เลือกเฉพาะฟิลด์ที่ต้องใช้ + lean()
    const user = await Users.findOne(
      { isActive: true, $or: [{ email: identifier }, { username: identifier }] },
      { password: 1, role: 1 } // projection
    ).select('+password').lean()

    // ใช้ข้อความรวม ๆ เพื่อลดการเดา (option)
    if (!user) {
      return NextResponse.json({ message: 'บัญชีหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      // เพิ่มตัวนับ (ไม่ critical จะ await ไว้ก็ได้เพื่อความถูกต้อง)
      await Users.updateOne(
        { $or: [{ email: identifier }, { username: identifier }] },
        { $inc: { failedLoginAttempts: 1 } }
      )
      return NextResponse.json({ message: 'บัญชีหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 })
    }

    const sessionId = crypto.randomUUID()

    // ✅ อัปเดตสถานะให้เร็ว + ใช้ filter ที่ชัดเจน
    await Users.updateOne(
      { $or: [{ email: identifier }, { username: identifier }] },
      { $set: { sessionId, lastLoginAt: new Date(), failedLoginAttempts: 0 } }
    )

    // ตอบกลับสั้น ๆ เพื่อลดเวลา parse ที่ฝั่ง client
    const res = NextResponse.json({ ok: true, redirect: '/admin/menu', tookMs: Date.now() - t0 })

    res.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
      priority: 'high',          // optional: ช่วย browser ให้ความสำคัญคุกกี้นี้
    })

    return res
  } catch (err) {
    return NextResponse.json({ message: err?.message || 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}