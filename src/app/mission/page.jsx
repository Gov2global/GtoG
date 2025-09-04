"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PlotsPage() {
  const router = useRouter()

  const handleAddPlot = () => {
    router.push("/mission/plots/register")
  }

  return (
    <main className="relative min-h-screen bg-white p-4 pb-28">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 text-center">แปลงปลูกขอท่าน</h1>
      </header>

      {/* ถ้ามีรายการแปลง จะแสดงตรงนี้ */}
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
