"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import liff from "@line/liff"

export default function PlotsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [regLineID, setRegLineID] = useState("")
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
  })

  // --- Init LIFF ---
  useEffect(() => {
    let mounted = true

    async function initLiff() {
      try {
        await liff.init({ liffId: "2007697520-ReVxGaBb" })

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }

        const profile = await liff.getProfile()
        const userId = profile.userId

        if (mounted) {
          setRegLineID(userId)
        }

        // ✅ ดึงข้อมูลจาก backend
        const res = await fetch(`/api/farmer/get/line-get/${userId}`)
        const result = await res.json()
        if (mounted && result.success && result.data) {
          const farmer = result.data
          setUser({
            firstName: farmer.regName || "",
            lastName: farmer.regSurname || "",
          })
        }
      } catch (err) {
        console.error("❌ LIFF init error:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initLiff()
    return () => {
      mounted = false
    }
  }, [])

  // --- ปุ่มกดเพิ่มแปลง ---
  const handleAddPlot = () => {
    if (!regLineID) {
      alert("❌ ไม่พบ Line ID")
      return
    }

    // ✅ ส่งค่า regLineID ไปด้วย (query string)
    router.push(`/mission/plots/register?lineId=${regLineID}`)
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-600">
        ⏳ กำลังโหลด...
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-white p-4 pb-28">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-bold text-gray-800">แปลงปลูกของท่าน</h1>
        {regLineID && (
          <p className="mt-2 text-gray-600">
            👤 {user.firstName} {user.lastName}
          </p>
        )}
      </header>

      {/* ถ้ามีรายการแปลง */}
      <div className="text-center text-gray-400 mt-12">
        ยังไม่มีแปลงปลูก
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={handleAddPlot}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg"
        aria-label="เพิ่มแปลง"
      >
        <Plus className="w-7 h-7 text-white" />
      </Button>
    </main>
  )
}
