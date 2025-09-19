"use client"

import { useEffect, useState } from "react"

// mapping weathercode → icon / text
function weatherCodeToIconText(code) {
  // ตาม spec Open-Meteo
  const map = {
    0: { icon: "☀️", text: "Clear sky" },
    1: { icon: "🌤️", text: "Mainly clear" },
    2: { icon: "⛅", text: "Partly cloudy" },
    3: { icon: "☁️", text: "Overcast" },
    45: { icon: "🌫️", text: "Fog" },
    48: { icon: "🌫️", text: "Depositing rime fog" },
    51: { icon: "🌧️", text: "Light drizzle" },
    53: { icon: "🌧️", text: "Moderate drizzle" },
    55: { icon: "🌧️", text: "Dense drizzle" },
    56: { icon: "🌧️", text: "Light freezing drizzle" },
    57: { icon: "🌧️", text: "Dense freezing drizzle" },
    61: { icon: "🌦️", text: "Slight rain" },
    63: { icon: "🌦️", text: "Moderate rain" },
    65: { icon: "🌧️", text: "Heavy rain" },
    66: { icon: "🌧️", text: "Light freezing rain" },
    67: { icon: "🌧️", text: "Heavy freezing rain" },
    71: { icon: "❄️", text: "Slight snow fall" },
    73: { icon: "❄️", text: "Moderate snow fall" },
    75: { icon: "❄️", text: "Heavy snow fall" },
    77: { icon: "🌨️", text: "Snow grains" },
    80: { icon: "🌦️", text: "Rain showers" },
    81: { icon: "🌧️", text: "Heavy rain showers" },
    82: { icon: "🌧️", text: "Violent rain showers" },
    85: { icon: "❄️", text: "Snow showers slight" },
    86: { icon: "❄️", text: "Snow showers heavy" },
    95: { icon: "⛈️", text: "Thunderstorm" },
    96: { icon: "⛈️", text: "Thunderstorm with slight hail" },
    99: { icon: "⛈️", text: "Thunderstorm with heavy hail" },
  }
  return map[code] || { icon: "❓", text: "Unknown" }
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
        console.error("fetchWeather error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (lat != null && lon != null) {
      fetchWeather()
    } else {
      setLoading(false)
      setError("ไม่มีพิกัด lat/lon")
    }
  }, [lat, lon])

  if (loading) {
    return <p className="text-center mt-4">⏳ กำลังโหลดข้อมูลอากาศ...</p>
  }
  if (error) {
    return <p className="text-red-500 text-center mt-4">❌ เกิดข้อผิดพลาด: {error}</p>
  }
  if (!current || !daily) {
    return <p className="text-center mt-4">ไม่พบข้อมูลอากาศ</p>
  }

  return (
    <div className="mt-6">
      {/* ปัจจุบัน */}
      <div className="bg-white rounded-lg p-4 shadow mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {weatherCodeToIconText(current.weathercode).icon}
            <span className="text-2xl font-bold">{current.temperature}°C</span>
          </div>
          <div className="text-gray-600">ความเร็วลม: {current.windspeed_10m} m/s</div>
        </div>
        <div className="text-sm text-gray-500">
          ปัจจุบัน
        </div>
      </div>

      {/* พยากรณ์รายวัน 7 วัน */}
      <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {daily.time.map((dateStr, idx) => {
          const iconText = weatherCodeToIconText(daily.weathercode[idx])
          return (
            <div
              key={dateStr}
              className="bg-white rounded-lg shadow p-2 text-center"
            >
              <div className="text-sm font-medium">
                {new Date(dateStr).toLocaleDateString("th-TH", { weekday: 'short', day: 'numeric', month: 'short'})}
              </div>
              <div className="mt-1 text-xl font-bold">
                {daily.temperature_2m_max[idx].toFixed(0)}° / {daily.temperature_2m_min[idx].toFixed(0)}°
              </div>
              <div className="mt-1 text-blue-600 text-sm">
                {daily.precipitation_probability_mean ? `💧 ${daily.precipitation_probability_mean[idx]}%` : null}
              </div>
              <div className="mt-1 text-gray-600 text-sm">
                {iconText.icon} {iconText.text}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
