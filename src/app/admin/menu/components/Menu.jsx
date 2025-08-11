'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { LayoutGrid, List, Search } from 'lucide-react'
import { getMenuByRole } from './Role'
import LogoutButton from '../../components/LogoutButton'

export default function MenuClient({ role = 'farmer', name }) {
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState('grid')

  const items = useMemo(() => {
    const base = getMenuByRole(role)
    if (!query) return base
    const q = query.toLowerCase()
    return base.filter(i => i.label.toLowerCase().includes(q) || i.key.includes(q))
  }, [role, query])

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ยินดีต้อนรับ{name ? `, ${name}` : ''} • สิทธิ์ใช้งาน: <span className="capitalize font-medium">{role}</span>
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ค้นหาเมนู..." className="pl-9" />
          </div>

          <div className="inline-flex rounded-2xl border p-1">
            <Button variant={layout==='grid'?'default':'ghost'} size="icon" className="rounded-xl" onClick={()=>setLayout('grid')} aria-pressed={layout==='grid'}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={layout==='list'?'default':'ghost'} size="icon" className="rounded-xl" onClick={()=>setLayout('list')} aria-pressed={layout==='list'}>
              <List className="h-4 w-4" />
            </Button>
          </div>

          <LogoutButton /> 
        </div>
      </div>

      {items.length === 0 ? <EmptyState /> : layout === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <motion.div key={item.key} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.05 }}>
              <Link href={item.path} className="block focus:outline-none">
                <Card className="group h-full cursor-pointer rounded-2xl border hover:shadow-md focus-visible:ring-2">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl ${item.bg}`}>
                      <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription className="mt-0.5">จัดการข้อมูล {item.label}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground">
                      <li>• ดูรายการ / เพิ่ม / แก้ไข</li>
                      <li>• ส่งออกข้อมูล</li>
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <motion.div key={item.key} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.05 }}>
              <Link href={item.path} className="block">
                <Card className="group cursor-pointer rounded-2xl border hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid h-10 w-10 place-items-center rounded-lg ${item.bg}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{item.label}</CardTitle>
                        <CardDescription className="mt-0.5">จัดการข้อมูล {item.label}</CardDescription>
                      </div>
                    </div>
                    <Button variant="secondary" className="rounded-xl">เปิด</Button>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="rounded-2xl border">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-14 text-center">
        <Search className="h-6 w-6" aria-hidden="true" />
        <h2 className="text-base font-medium">ไม่พบเมนูที่ตรงกับคำค้นหา</h2>
        <p className="text-sm text-muted-foreground">ลองปรับคำค้นหรือเลือกดูทั้งหมด</p>
      </CardContent>
    </Card>
  )
}
