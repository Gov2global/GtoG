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
  const [user, setUser] = useState({ firstName: "", lastName: "" })
  const [plots, setPlots] = useState([]) // [ADDED: เก็บรายการแปลง]

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

        if (mounted) setRegLineID(userId)

        const res = await fetch(`/api/farmer/get/line-get/${userId}`)
        const result = await res.json()
        if (mounted && result.success && result.data) {
          const farmer = result.data
          setUser({
            firstName: farmer.regName || "",
            lastName: farmer.regSurname || "",
          })
        }

        // ✅ ดึงข้อมูลแปลงปลูก
        const plotsRes = await fetch("/api/mission/get/regmissos")
        const plotsData = await plotsRes.json()
        if (mounted && plotsData.success && plotsData.data) {
          setPlots(plotsData.data) // [ADDED]
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

  const handleAddPlot = () => {
    if (!regLineID) {
      alert("❌ ไม่พบ Line ID")
      return
    }
    router.push(`/mission/plots/register?lineId=${regLineID}`)
  }

  const handleManagePlot = (plotId) => {
    router.push(`/mission/plots/manage/${plotId}`) // [ADDED: สมมุติหน้าบริหารแปลง]
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

      <div className="grid gap-4">
        {plots.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            ยังไม่มีแปลงปลูก
          </div>
        ) : (
          plots.map((plot) => (
            <div
              key={plot._id}
              className="border rounded-2xl p-4 shadow-sm bg-gray-50"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                🌱 {plot.name} <span className="text-sm text-gray-500">#{plot.regCode}</span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                ชนิดพืช: {plot.plantType}
              </p>
              <p className="text-sm text-gray-600">
                ระยะ: {plot.spacing}
              </p>
              <Button
                size="sm"
                className="mt-3"
                onClick={() => handleManagePlot(plot._id)}
              >
                บริหารสวน
              </Button>
            </div>
          ))
        )}
      </div>

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
