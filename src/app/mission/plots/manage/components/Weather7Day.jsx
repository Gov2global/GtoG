"use client"

import { useEffect, useState } from "react"

// mapping weathercode → icon / text
function weatherCodeToIconText(code) {
  const map = {
    0: { icon: "☀️", text: "ท้องฟ้าแจ่มใส" },
    1: { icon: "🌤️", text: "ฟ้าโปร่ง" },
    2: { icon: "⛅", text: "มีเมฆบางส่วน" },
    3: { icon: "☁️", text: "มีเมฆมาก" },
    45: { icon: "🌫️", text: "หมอก" },
    48: { icon: "🌫️", text: "หมอกน้ำแข็ง" },
    51: { icon: "🌧️", text: "ฝนปรอย" },
    53: { icon: "🌧️", text: "ฝนปานกลาง" },
    55: { icon: "🌧️", text: "ฝนหนัก" },
    61: { icon: "🌦️", text: "ฝนเล็กน้อย" },
    63: { icon: "🌦️", text: "ฝนปานกลาง" },
    65: { icon: "🌧️", text: "ฝนหนักมาก" },
    80: { icon: "🌧️", text: "ฝนโปรย" },
    81: { icon: "🌧️", text: "ฝนตกหนัก" },
    95: { icon: "⛈️", text: "พายุฝนฟ้าคะนอง" },
    96: { icon: "⛈️", text: "พายุลูกเห็บเล็ก" },
    99: { icon: "⛈️", text: "พายุลูกเห็บใหญ่" },
  }
  return map[code] || { icon: "❓", text: "ไม่ทราบ" }
}

export default function Weather7Day({ lat, lon }) {
  const [current, setCurrent] = useState(null)
  const [daily, setDaily] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${parseFloat(lat)}&longitude=${parseFloat(lon)}&timezone=Asia/Bangkok&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_mean&current_weather=true`
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(`Open-Meteo API error ${res.status}`)
        }
        const json = await res.json()
        setCurrent(json.current_weather)
        setDaily(json.daily)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (lat && lon) fetchWeather()
    else {
      setLoading(false)
      setError("ไม่มีพิกัด lat/lon")
    }
  }, [lat, lon])

  if (loading) return <p className="text-center mt-4">⏳ กำลังโหลดข้อมูลอากาศ...</p>
  if (error) return <p className="text-red-500 text-center mt-4">❌ {error}</p>
  if (!current || !daily) return <p className="text-center mt-4">ไม่พบข้อมูลอากาศ</p>

  return (
    <div className="mt-6">
      {/* ปัจจุบัน */}
      <div className="bg-white rounded-lg p-3 shadow mb-3 flex justify-between items-center text-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{weatherCodeToIconText(current.weathercode).icon}</span>
            <span className="text-lg font-bold">{current.temperature}°C</span>
          </div>
          <div className="text-gray-600">ลม: {current.windspeed_10m} m/s</div>
        </div>
        <div className="text-gray-500 text-xs">สภาพอากาศปัจจุบัน</div>
      </div>

      {/* รายวัน 7 วัน แนวนอนเลื่อนได้ */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {daily.time.map((dateStr, idx) => {
            const iconText = weatherCodeToIconText(daily.weathercode[idx])
            return (
              <div
                key={dateStr}
                className="bg-white rounded-lg shadow p-2 w-32 text-center flex-shrink-0 text-xs"
              >
                <div className="font-medium text-sm">
                  {new Date(dateStr).toLocaleDateString("th-TH", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-base font-bold mt-1">
                  {daily.temperature_2m_max[idx].toFixed(0)}° / {daily.temperature_2m_min[idx].toFixed(0)}°
                </div>
                <div className="text-blue-500 mt-1">
                  💧 {daily.precipitation_probability_mean[idx]}%
                </div>
                <div className="text-gray-600 mt-1">
                  {iconText.icon} {iconText.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
