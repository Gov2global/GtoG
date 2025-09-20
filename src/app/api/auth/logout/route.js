// api/auth/logout
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import { connectMongoDB } from '../../../../../lib/mongodb'
import Users from '../../../../../models/users'

export async function POST() {
  try {
    await connectMongoDB()
    const res = NextResponse.json({ ok: true })
    const session = res.cookies.get('session')?.value 

    if (session) {
      await Users.updateOne({ sessionId: session }, { $unset: { sessionId: '' } })
    }

    // เคลียร์คุกกี้ให้หมดอายุ
    res.cookies.set('session', '', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    })

    return res
  } catch (err) {
    return NextResponse.json({ message: err.message || 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
