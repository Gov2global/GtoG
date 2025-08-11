'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function LogoutButton({ className = '' }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onLogout = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('ออกจากระบบไม่สำเร็จ')
      router.replace('/admin') // กลับไปหน้า login (/admin)
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={`rounded-xl ${className}`}
      onClick={onLogout}
      disabled={loading}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? 'กำลังออก...' : 'ออกจากระบบ'}
    </Button>
  )
}
