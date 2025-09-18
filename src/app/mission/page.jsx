"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, SortAsc, SortDesc, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import liff from "@line/liff"

export default function PlotsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [regLineID, setRegLineID] = useState("")
  const [user, setUser] = useState({ firstName: "", lastName: "" })
  const [plots, setPlots] = useState([])
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false) // [ADDED: toggle ช่องค้นหา]
  const [sortBy, setSortBy] = useState("latest") // latest | az | za

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
          setUser({
            firstName: result.data.regName || "",
            lastName: result.data.regSurname || "",
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

  const toggleSort = () => {
    if (sortBy === "latest") setSortBy("az")
    else if (sortBy === "az") setSortBy("za")
    else setSortBy("latest")
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
      
      // ✅ Default: ล่าสุด
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
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
      {/* Header */}
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-gray-800">แปลงปลูกของท่าน</h1>
        {regLineID && (
          <p className="mt-2 text-gray-600">
            👤 {user.firstName} {user.lastName}
          </p>
        )}
      </header>

      {/* Search & Sort */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setShowSearch(!showSearch)} className="p-2">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button onClick={toggleSort} className="p-2">
          {sortBy === "latest" && <Clock className="w-5 h-5 text-gray-600" />}
          {sortBy === "az" && <SortAsc className="w-5 h-5 text-gray-600" />}
          {sortBy === "za" && <SortDesc className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {showSearch && (
        <div className="mb-4">
          <Input
            placeholder="ค้นหาแปลง / ชนิดพืช"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Plot Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPlots.length === 0 ? (
          <div className="text-center text-gray-400 col-span-full mt-8">
            ไม่พบข้อมูลที่ค้นหา
          </div>
        ) : (
          filteredPlots.map((plot) => (
            <div
              key={plot._id}
              className="flex items-center justify-between border rounded-xl px-4 py-3 shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              {/* LEFT: Info */}
              <div className="text-sm text-gray-700 w-full pr-3">
                <div className="flex justify-between font-semibold">
                  <span className="flex items-center gap-1 text-gray-700">
                    <span className="text-green-500 text-base">🌱</span>
                    {plot.name}
                  </span>
                  
                </div>
                <p className="text-gray-600 mt-1">ชนิดพืช: {plot.plantType}</p>
                <p className="text-gray-600">ระยะ: {plot.spacing}</p>
              </div>

              {/* RIGHT: Button */}
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500">#{plot.regCode}</span>
                <Button
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={() => handleManagePlot(plot._id)}
                >
                  บริหารสวน
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
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
