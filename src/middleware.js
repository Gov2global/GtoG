// /src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(req) {
  const session = req.cookies.get('session')?.value
  const url = req.nextUrl.clone()
  const { pathname } = url

  // อนุญาตให้เข้าหน้า /admin (หน้า login) ได้เสมอ
  if (pathname === '/admin') return NextResponse.next()

  // กันหน้าใต้ /admin ถ้าไม่มี session → ส่งไปหน้า /admin (login)
  if (pathname.startsWith('/admin') && !session) {
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // มี session แล้วมาที่ /admin → ส่งไปเมนู
  if (pathname === '/admin' && session) {
    url.pathname = '/admin/menu'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
