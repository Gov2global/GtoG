"use client"

import { useEffect, useState } from "react"

export default function DailyForecastTMD({ lat, lon, duration = 7 }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const date = new Date().toISOString().split("T")[0]
        const token = process.env.NEXT_PUBLIC_TMD_TOKEN
        const url = `https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at?lat=${lat}&lon=${lon}&date=${date}&duration=${duration}&fields=tc_min,tc_max,rh,cond`

        const res = await fetch(url, {
          headers: {
            "accept": "application/json",
            "authorization": `Bearer ${token}`
          }
        })

        if (!res.ok) throw new Error("API error " + res.status)
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon) fetchData()
  }, [lat, lon])

  if (loading) return <p>กำลังโหลดข้อมูล...</p>
  if (error) return <p className="text-red-500">เกิดข้อผิดพลาด: {error}</p>
  if (!data || !data.daily_data) return <p>ไม่พบข้อมูลพยากรณ์</p>

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">🌤 พยากรณ์อากาศ 7 วันจาก TMD</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {data.daily_data.map((d) => {
          const date = new Date(d.date)
          const day = date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" })
          const condMap = {
            1: "แจ่มใส", 2: "มีเมฆบางส่วน", 3: "เมฆบางส่วน", 4: "เมฆมาก", 5: "ฝนเล็กน้อย",
            6: "ฝนปานกลาง", 7: "ฝนหนัก", 8: "ฝนฟ้าคะนอง", 9: "ร้อนจัด", 10: "หนาว", 11: "หนาวจัด"
          }

          return (
            <div key={d.date} className="bg-white shadow rounded p-2 text-center">
              <div className="font-medium">{day}</div>
              <div>{d.tc_max}° / {d.tc_min}°</div>
              <div className="text-sm text-blue-600">💧 {d.rh}%</div>
              <div className="text-sm text-gray-600">{condMap[d.cond] || "ไม่ระบุ"}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
