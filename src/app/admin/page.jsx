'use client'

import { useEffect, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ prefetch เมนู เพื่อให้เปลี่ยนหน้าไวขึ้น
  useEffect(() => {
    router.prefetch('/admin/menu')
  }, [router])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, remember }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || 'เข้าสู่ระบบไม่สำเร็จ')

      // ✅ ทำ navigation ใน transition ให้ UI ไม่ค้าง
      startTransition(() => {
        router.replace('/admin/menu')
      })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800">
      <div className="w-full max-w-sm relative rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl p-8 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-white dark:bg-neutral-900 shadow-md p-2 w-24 h-24 flex items-center justify-center -mt-20 border-4 border-white dark:border-neutral-900">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain rounded-full" />
          </div>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">Welcome back!</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sign in to your account</p>
        </div>

        <form className="flex flex-col gap-4" autoComplete="off" onSubmit={onSubmit}>
          <Input
            type="text"
            placeholder="Email or Username"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading} // ✅
            className="rounded-xl"
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // ✅
              className="rounded-xl pr-10"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading} // ✅
              className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 focus:outline-none"
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              aria-pressed={showPassword}
              title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading} // ✅
                className="accent-blue-500"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">Forgot?</Link>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl">
            {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังเข้าสู่ระบบ…</>) : 'Sign In'}
          </Button>
        </form>
      </div>
    </main>
  )
}
