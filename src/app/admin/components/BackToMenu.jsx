// src/components/BackToMenu.jsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function BackToMenu({ className = '' }) {
  return (
    <Button asChild variant="outline" className={`rounded-xl ${className}`}>
      <Link href="/admin/menu" aria-label="กลับเมนูหลัก">
        <Home className="mr-2 h-4 w-4" />
        กลับเมนูหลัก
      </Link>
    </Button>
  )
}
