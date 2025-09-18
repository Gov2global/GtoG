"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // [ADDED: ช่องค้นหา]
import liff from "@line/liff"

export default function PlotsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [regLineID, setRegLineID] = useState("")
  const [user, setUser] = useState({ firstName: "", lastName: "" })
  const [plots, setPlots] = useState([])
  const [search, setSearch] = useState("") // [ADDED]
  const [sortBy, setSortBy] = useState("latest") // [ADDED]

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

        const plotsRes = await fetch("/api/mission/get/regmissos")
        const plotsData = await plotsRes.json()
        if (mounted && plotsData.success && plotsData.data) {
          setPlots(plotsData.data)
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
    router.push(`/mission/plots/manage/${plotId}`)
  }

  const filteredPlots = plots
    .filter((plot) => {
      const query = search.toLowerCase()
      return (
        plot.name?.toLowerCase().includes(query) ||
        plot.plantType?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === "az") return a.name.localeCompare(b.name)
      if (sortBy === "za") return b.name.localeCompare(a.name)
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-600">
        ⏳ กำลังโหลด...
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-white p-4 pb-28">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">แปลงปลูกของท่าน</h1>
        {regLineID && (
          <p className="mt-2 text-gray-600">
            👤 {user.firstName} {user.lastName}
          </p>
        )}
      </header>

      {/* [ADDED] Search + Sort */}
      <div className="flex flex-col sm:flex-row justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="ค้นหาแปลง / ชนิดพืช"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm text-gray-700 bg-white w-full sm:w-auto"
        >
          <option value="latest">เรียงจากล่าสุด</option>
          <option value="az">ชื่อสวน A-Z</option>
          <option value="za">ชื่อสวน Z-A</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPlots.length === 0 ? (
          <div className="text-center text-gray-400 col-span-full mt-8">
            ไม่พบข้อมูลที่ค้นหา
          </div>
        ) : (
          filteredPlots.map((plot) => (
            <div
              key={plot._id}
              className="border rounded-xl px-4 py-3 shadow-sm bg-gray-50 text-sm hover:shadow-md transition"
            >
              <h2 className="font-semibold text-gray-700 flex items-center gap-1">
                <span className="text-green-500 text-base">🌱</span>
                {plot.name}
                <span className="text-xs text-gray-400 ml-1">#{plot.regCode}</span>
              </h2>
              <p className="text-gray-600 mt-1">ชนิดพืช: {plot.plantType}</p>
              <p className="text-gray-600">ระยะ: {plot.spacing}</p>
              <Button
                size="sm"
                className="mt-2"
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
