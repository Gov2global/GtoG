'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('') // email หรือ username
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // 👈 toggle ดู/ซ่อน
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      router.replace('/admin/menu')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-neutral-200 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-800">
      <div className="w-full max-w-sm relative rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl p-8 flex flex-col gap-6 transition-all duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-white dark:bg-neutral-900 shadow-md p-2 w-24 h-24 flex items-center justify-center -mt-20 border-4 border-white dark:border-neutral-900">
            <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain rounded-full" />
          </div>
        </div>

        <div className="text-center mt-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white drop-shadow-sm">
            Welcome back!
          </h1>
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
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 shadow-sm bg-white/70 dark:bg-neutral-900/70 transition"
          />

          {/* Password + toggle show/hide */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 shadow-sm bg-white/70 dark:bg-neutral-900/70 transition"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                className="accent-blue-500 focus:outline-none transition"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline hover:text-blue-600 transition">
              Forgot?
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold h-11 text-base rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg hover:scale-[1.03] hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-all duration-200"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </main>
  )
}
