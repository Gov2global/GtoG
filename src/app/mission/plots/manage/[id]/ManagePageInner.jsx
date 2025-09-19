"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Weather7Day from "../components/Weather7Day"
import { v4 as uuidv4 } from "uuid" // [ADDED: สำหรับสร้าง UUID]

export default function ManagePageInner() {
  const { id } = useParams()
  const router = useRouter()
  const [plot, setPlot] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [codes, setCodes] = useState([])
  const [checked, setChecked] = useState({}) // [ADDED: เก็บ state checkbox]

  const CATEGORY_MAP = {
    DG004: "💧 น้ำ",
    DG001: "🌱 ปุ๋ย",
    DG005: "✂️ ตัดแต่งกิ่ง",
    DG003: "🐛 แมลง",
    DG002: "🦠 โรค",
    DG006: "📌 อื่นๆ",
  }

  const CATEGORY_ORDER = ["DG004", "DG001", "DG005", "DG003", "DG002", "DG006"]

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

        const learnRes = await fetch("/api/mission/get/learn52week")
        const learnJson = await learnRes.json()
        const matched = (learnJson.data || []).filter(
          (r) => r.span?.trim() === found?.spacing?.trim()
        )

        const extractedCodes = matched.map((r) => r.code?.trim()).filter(Boolean)
        setCodes(extractedCodes)

        if (extractedCodes.length > 0) {
          const todoRes = await fetch("/api/mission/get/todolist")
          const todoJson = await todoRes.json()
          const allTodos = todoJson.data || []

          const filtered = allTodos.filter((todo) => {
            const farmerCode = todo["Code-farmer"]?.toLowerCase().trim().replace(",", "")
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

  const handleCheckboxChange = (taskId) => {
    setChecked((prev) => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleSubmit = async () => {
    const confirmed = window.confirm("ยืนยันที่จะส่งข้อมูลหรือไม่?")
    if (!confirmed) return

    const selected = tasks.filter((t) => checked[t.ID])

    if (selected.length === 0) {
      alert("ไม่พบงานที่เลือก")
      return
    }

    const payload = selected.map((task) => ({
      id: task.ID,
      regCode: plot.regCode,
      done: true,
      uuid: uuidv4(),
    }))

    try {
      const res = await fetch("/api/mission/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        alert("✅ บันทึกสำเร็จแล้ว")
        setChecked({})
      } else {
        alert("❌ เกิดปัญหาในการบันทึก")
      }
    } catch (err) {
      console.error(err)
      alert("❌ บันทึกล้ม")
    }
  }

  if (loading) return <p className="text-center mt-10">⏳ กำลังโหลด...</p>
  if (!plot) return <p className="text-center mt-10">❌ ไม่พบข้อมูลแปลง</p>

  return (
    <div className="p-4">
      <div className="relative bg-gray-100 p-4 rounded-lg shadow mb-4">
        <Button
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => router.push("/mission")}
        >
          ออกจากแปลง
        </Button>
        <h2 className="text-xl font-bold">
          {plot?.name} <span className="text-sm text-gray-500">#{plot?.regCode}</span>
        </h2>
        <p>ชนิดพืช: {plot?.plantType}</p>
        <p>ระยะ: {plot?.spacing}</p>
        {plot?.lat && plot?.lon && <p>พิกัด: {plot.lat}, {plot.lon}</p>}
      </div>

      {plot?.lat && plot?.lon && (
        <div className="mt-5 mb-5">
          <Weather7Day lat={parseFloat(plot.lat)} lon={parseFloat(plot.lon)} />
        </div>
      )}

      {CATEGORY_ORDER.map((cat) => {
        const groupTasks = tasks.filter(
          (t) => t["Code-Doing"]?.replace(",", "").trim().toUpperCase() === cat
        )
        if (groupTasks.length === 0) return null

        return (
          <div key={cat} className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">
              {CATEGORY_MAP[cat] || "📁 ไม่ทราบหมวด"}
            </h3>
            <ul className="space-y-2">
              {groupTasks.map((task) => (
                <li key={task._id} className="flex items-start space-x-3">
                  <Checkbox id={task.ID} checked={checked[task.ID] || false} onCheckedChange={() => handleCheckboxChange(task.ID)} />
                  <label htmlFor={task.ID} className="text-gray-700">
                    {task.Detail}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      <div className="mt-6 text-center">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-base rounded-lg"
          onClick={handleSubmit}
        >
          ยืนยันการส่งญี่เช็คไว้
        </Button>
      </div>
    </div>
  )
}