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
  const [codes, setCodes] = useState([]) // [ADDED: เก็บ code จาก learn52week]

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
        console.log("✅ learn52week ทั้งหมด:", learnRecords)

        // filter โดยใช้ span === plot.spacing
        const matched = learnRecords.filter(
          (r) => r.span?.trim() === found?.spacing?.trim()
        )
        console.log("✅ matched records:", matched)

        // ดึงรหัส code
        const extractedCodes = matched
          .map((r) => r.code?.trim())
          .filter(Boolean)
        setCodes(extractedCodes)
        console.log("✅ codes:", extractedCodes)

        if (extractedCodes.length > 0) {
          // 🔹 4) โหลด todolist
          const todoRes = await fetch("/api/mission/get/todolist")
          const todoJson = await todoRes.json()
          const allTodos = todoJson.data || []
          console.log("✅ allTodos Code-farmer:", allTodos.map(t => t["Code-farmer"]))

          // 🔹 5) filter โดย match code กับ Code-farmer
          const filtered = allTodos.filter((todo) => {
            const farmerCode = todo["Code-farmer"]?.toLowerCase().trim()
            return farmerCode && extractedCodes.map(c => c.toLowerCase()).includes(farmerCode)
          })
          console.log("✅ filtered tasks:", filtered)

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
    <div className="p-4">
      {/* Card + ปุ่มขวาบน */}
      <div className="relative bg-gray-100 p-4 rounded-lg shadow mb-4">
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
      </div>

      {/* ✅ ต่อ weather forecast (TMD) */}
      {plot.lat && plot.lon && (
        <Weather7Day
          lat={parseFloat(plot.lat)}
          lon={parseFloat(plot.lon)}
        />
      )}

      {/* ✅ แสดง Tasks จาก todolist */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">📝 ภารกิจที่ต้องทำ</h3>
        {tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map((task) => (
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
        ) : (
          <p className="text-gray-500">ไม่ภารกิจที่ต้องทำ</p>
        )}
      </div>
    </div>
  )
}
