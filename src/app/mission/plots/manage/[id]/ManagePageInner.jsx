"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
// import DailyForecastTMD from "../components/DailyForecastTMD" 
import Weather7Day from "../components/Weather7Day"


export default function ManagePageInner() {
  const { id } = useParams()
  const router = useRouter()
  const [plot, setPlot] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/mission/get/regmissos")
        const json = await res.json()
        const found = json.data?.find((p) => p._id === id)
        setPlot(found)

        if (found?.lat && found?.lon) {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${found.lat}&longitude=${found.lon}&current_weather=true`
          )
          const weatherJson = await weatherRes.json()
          setWeather(weatherJson.current_weather)
        }
      } catch (err) {
        console.error("error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <p className="text-center mt-10">⏳ กำลังโหลด...</p>
  if (!plot) return <p className="text-center mt-10">❌ ไม่พบข้อมูลแปลง</p>

  return (
    <div className="p-4">
      {/* Card + ปุ่มขวาบน */}
      <div className="relative bg-gray-100 p-4 rounded-lg shadow mb-4">
        {/* ปุ่มออกจากแปลง */}
        <Button
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => router.push("/mission")}
        >
          ออกจากแปลง
        </Button>

        {/* รายละเอียดแปลง */}
        <h2 className="text-xl font-bold">
          {plot.name}{" "}
          <span className="text-sm text-gray-500">#{plot.regCode}</span>
        </h2>
        <p>ชนิดพืช: {plot.plantType}</p>
        <p>ระยะ: {plot.spacing}</p>
        {plot.lat && plot.lon && <p>พิกัด: {plot.lat}, {plot.lon}</p>}
        {/* {weather && <p>อุณหภูมิปัจจุบัน: {weather.temperature}°C</p>} */}
      </div>

      {/* ✅ ต่อ weather forecast (TMD) ถ้ามี lat/lon */}
      {plot.lat && plot.lon && (
        <Weather7Day
          lat={parseFloat(plot.lat)}
          lon={parseFloat(plot.lon)}
        />
      )}

    </div>
  )
}
