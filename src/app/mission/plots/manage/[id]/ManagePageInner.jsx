"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ManagePlotPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [plot, setPlot] = useState(null)
  const [weather, setWeather] = useState(null)
  const [inPlot, setInPlot] = useState(true)

  useEffect(() => {
    async function fetchPlot() {
      try {
        const res = await fetch("/api/mission/get/regmissos")
        const result = await res.json()
        if (result.success && Array.isArray(result.data)) {
          const found = result.data.find(p => p._id === id)
          setPlot(found)

          if (found?.lat != null && found?.lon != null) {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${found.lat}&longitude=${found.lon}&current_weather=true`
            )
            const weatherData = await weatherRes.json()
            setWeather(weatherData.current_weather)
          }
        }
      } catch (err) {
        console.error("error fetch plot/manage:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlot()
  }, [id])

  const handleLeavePlot = () => {
    setInPlot(false)
    router.push("/mission/plots")
  }

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen">⏳ กำลังโหลด...</main>
  }

  if (!plot) {
    return <main className="flex items-center justify-center min-h-screen">ไม่พบแปลงที่ระบุ</main>
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="border rounded-xl p-4 shadow-sm bg-gray-50 mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {plot.name} <span className="text-sm text-gray-500">#{plot.regCode}</span>
        </h2>
        <p>ชนิดพืช: {plot.plantType}</p>
        <p>ระยะ: {plot.spacing}</p>
        {plot.lat && plot.lon && (
          <p>พิกัด: {plot.lat.toFixed(4)}, {plot.lon.toFixed(4)}</p>
        )}

        {weather && (
          <div className="bg-blue-50 rounded-lg p-4 mt-4 shadow-inner">
            <h3 className="font-semibold text-blue-700 mb-1">🌤️ สภาพอากาศปัจจุบัน</h3>
            <p className="text-blue-800">อุณหภูมิ: {weather.temperature}°C</p>
            <p className="text-blue-800">ลม: {weather.windspeed} กม./ชม.</p>
          </div>
        )}
      </div>

      {inPlot && (
        <Button
          size="sm"
          className="bg-red-600 text-white hover:bg-red-700"
          onClick={handleLeavePlot}
        >
          ออกจากแปลง
        </Button>
      )}
    </main>
  )
}