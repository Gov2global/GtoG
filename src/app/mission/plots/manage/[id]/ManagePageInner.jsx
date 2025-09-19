"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Weather7Day from "../components/Weather7Day"

export default function ManagePageInner() {
  const { id } = useParams()
  const router = useRouter()
  const [plot, setPlot] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [codes, setCodes] = useState([])

  // Mapping Code-Doing → ชื่อหมวด
  const CATEGORY_MAP = {
    DGP004: "💧 น้ำ",
    DGP001: "🌱 ปุ๋ย",
    DGP005: "✂️ ตัดแต่งกิ่ง",
    DGP003: "🐛 แมลง",
    DGP002: "🦠 โรค",
    DGP006: "📌 อื่นๆ",
  }

  // ลำดับการ์ดที่ต้องการ
  const CATEGORY_ORDER = ["DGP004", "DGP001", "DGP005", "DGP003", "DGP002", "DGP006"]

  useEffect(() => {
    async function fetchData() {
      try {
        // 🔹 1) โหลด plot
        const res = await fetch("/api/mission/get/regmissos")
        const json = await res.json()
        const found = json.data?.find((p) => p._id === id)
        setPlot(found)

        // 🔹 2) โหลด weather
        if (found?.lat && found?.lon) {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${found.lat}&longitude=${found.lon}&current_weather=true`
          )
          const weatherJson = await weatherRes.json()
          setWeather(weatherJson.current_weather)
        }

        // 🔹 3) โหลด learn52week ทั้งหมด
        const learnRes = await fetch("/api/mission/get/learn52week")
        const learnJson = await learnRes.json()
        const learnRecords = learnJson.data || []

        // filter โดยใช้ span === plot.spacing
        const matched = learnRecords.filter(
          (r) => r.span?.trim() === found?.spacing?.trim()
        )

        // ดึงรหัส code
        const extractedCodes = matched.map((r) => r.code?.trim()).filter(Boolean)
        setCodes(extractedCodes)

        if (extractedCodes.length > 0) {
          // 🔹 4) โหลด todolist
          const todoRes = await fetch("/api/mission/get/todolist")
          const todoJson = await todoRes.json()
          const allTodos = todoJson.data || []

          // 🔹 5) filter โดย match code กับ Code-farmer
          const filtered = allTodos.filter((todo) => {
            const farmerCode = todo["Code-farmer"]?.toLowerCase().trim()
            return farmerCode && extractedCodes.map(c => c.toLowerCase()).includes(farmerCode)
          })

          setTasks(filtered)
        }
      } catch (err) {
        console.error("❌ error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <p className="text-center mt-10">⏳ กำลังโหลด...</p>
  if (!plot) return <p className="text-center mt-10">❌ ไม่พบข้อมูลแปลง</p>

  return (
    <div className="p-4 space-y-4">
      {/* การ์ดแปลง */}
      <div className="relative bg-gray-100 p-4 rounded-lg shadow">
        <Button
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => router.push("/mission")}
        >
          ออกจากแปลง
        </Button>

        <h2 className="text-xl font-bold">
          {plot.name}{" "}
          <span className="text-sm text-gray-500">#{plot.regCode}</span>
        </h2>
        <p>ชนิดพืช: {plot.plantType}</p>
        <p>ระยะ: {plot.spacing}</p>
        {plot.lat && plot.lon && <p>พิกัด: {plot.lat}, {plot.lon}</p>}

        {/* ✅ แสดง code ที่ได้จาก learn52week */}
        {codes.length > 0 ? (
          <p className="mt-2 text-blue-700">
            📌 รหัสที่ได้จาก learn52week: {codes.join(", ")}
          </p>
        ) : (
          <p className="mt-2 text-gray-500">⚠️ ไม่มี code สำหรับ span นี้</p>
        )}
      </div>

      {/* การ์ดพยากรณ์อากาศ */}
      {plot.lat && plot.lon && (
        <div className="bg-white rounded-lg shadow p-4">
          <Weather7Day
            lat={parseFloat(plot.lat)}
            lon={parseFloat(plot.lon)}
          />
        </div>
      )}

      {/* การ์ดงานที่ต้องทำ แยกตามประเภท */}
      {CATEGORY_ORDER.map((cat) => {
        const groupTasks = tasks.filter((t) => t["Code-Doing"] === cat)
        if (groupTasks.length === 0) return null

        return (
          <div key={cat} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{CATEGORY_MAP[cat]}</h3>
            <ul className="space-y-2">
              {groupTasks.map((task) => (
                <li key={task._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={task.ID}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={task.ID} className="text-gray-700">
                    {task.Detail}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
