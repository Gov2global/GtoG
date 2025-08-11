'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Loader2 } from 'lucide-react'
import BackToMenu from '../components/BackToMenu'

// ให้ role สอดคล้องกับฝั่งโมเดล/เมนู
const ROLE_OPTIONS = ['admin', 'private', 'government', 'local', 'educational', 'farmer']

function AddUserDialog({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'private',
    isActive: true,
  })

  const isValid = useMemo(() => {
    if (!form.username || !form.password || !form.name || !form.email || !form.phone || !form.role) return false
    const emailOk = /[^@\s]+@[^@\s]+\.[^@\s]+/.test(form.email)
    return emailOk
  }, [form])

  const onChange = (key, value) => setForm((s) => ({ ...s, [key]: value }))

  const resetState = () => {
    setForm({ username: '', password: '', name: '', email: '', phone: '', role: 'private', isActive: true })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...form,
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
      }

      // เปลี่ยนเป็น /api/farmer/users
      const res = await fetch('/api/farmer/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data?.message || 'สร้างผู้ใช้ไม่สำเร็จ')

      setSuccess('เพิ่มสมาชิกสำเร็จ!')
      onCreated?.(data)
      setTimeout(() => { setOpen(false); resetState() }, 600)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState() }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> เพิ่มสมาชิก
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>เพิ่มสมาชิก</DialogTitle>
          <DialogDescription>กรอกข้อมูลผู้ใช้ให้ครบถ้วน จากนั้นกดบันทึก</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="เช่น john" value={form.username} onChange={(e) => onChange('username', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => onChange('password', e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">ชื่อ - นามสกุล</Label>
              <Input id="name" placeholder="เช่น John Doe" value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">โทรศัพท์</Label>
              <Input id="phone" placeholder="เช่น 0812345678" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>สิทธิ์การใช้งาน (Role)</Label>
              <Select value={form.role} onValueChange={(v) => onChange('role', v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="เลือก role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3 sm:col-span-2">
              <div>
                <Label className="mb-0">สถานะการใช้งาน</Label>
                <p className="text-sm text-muted-foreground">เปิด/ปิด การใช้งานของผู้ใช้รายนี้</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => onChange('isActive', v)} aria-label="สลับสถานะใช้งาน" />
            </div>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</div>}
          {success && <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">{success}</div>}

          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>ยกเลิก</Button>
            <Button type="submit" className="rounded-xl" disabled={!isValid || submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function UsersPage() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')

  const fetchList = async (signal) => {
    try {
      setLoading(true)
      setListError('')
      // เปลี่ยนเป็น /api/farmer/users
      const url = `/api/farmer/users?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`
      const res = await fetch(url, { signal })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'โหลดข้อมูลไม่สำเร็จ')
      setItems(data.items || [])
      setTotal(Number(data.total || 0))
    } catch (err) {
      if (err.name !== 'AbortError') setListError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    fetchList(ctrl.signal)
    return () => ctrl.abort()
  }, [q, page])

  const handleCreated = () => {
    const ctrl = new AbortController()
    fetchList(ctrl.signal)
    return () => ctrl.abort()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">ผู้ใช้ระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการสมาชิกและสิทธิ์การใช้งาน</p>
        </div>
        <div className="flex items-center gap-2">
        <BackToMenu/>
          <Input
            placeholder="ค้นหา ชื่อ / username / email"
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value) }}
            className="w-64"
            aria-label="ค้นหาผู้ใช้"
          />
          <AddUserDialog onCreated={handleCreated} />
        </div>
      </div>

      <div className="rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-3 w-40 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-28 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-56 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3 text-right"><div className="ml-auto h-8 w-20 rounded bg-gray-200" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้ใช้</td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.username}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="secondary" className="rounded-lg">แก้ไข</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm">
          <div>ทั้งหมด {total} รายการ • หน้า {page} / {totalPages}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>ก่อนหน้า</Button>
            <Button size="sm" className="rounded-lg" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>ถัดไป</Button>
          </div>
        </div>

        {listError && <div className="border-t bg-red-50 px-4 py-3 text-sm text-red-700">{listError}</div>}
      </div>
    </div>
  )
}

export default UsersPage
