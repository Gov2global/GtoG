import { useEffect, useState } from "react"

export default function DailyForecastTMD({ lat, lon }) {
  const [forecast, setForecast] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchForecast() {
      try {
        const token = "Bearer ใส่ token ที่คุณมี"; // 👈 ใส่ token ที่ถูกต้องตรงนี้
        const today = new Date().toISOString().split("T")[0]

        const res = await fetch(
          `https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at?lat=${lat}&lon=${lon}&date=${today}&duration=7&fields=tc_max,tc_min,rh,cond`,
          {
            headers: {
              accept: "application/json",
              authorization: token,
            },
          }
        )

        if (!res.ok) {
          const text = await res.text()
          throw new Error(`API error ${res.status}: ${text}`)
        }

        const json = await res.json()
        setForecast(json)
      } catch (err) {
        console.error(err)
        setError(err.message)
      }
    }

    fetchForecast()
  }, [lat, lon])

  if (error) return <p className="text-red-500 text-center">เกิดข้อผิดพลาด: {error}</p>
  if (!forecast) return <p className="text-center">กำลังโหลดข้อมูลพยากรณ์...</p>
  if (!forecast.daily_forecast || forecast.daily_forecast.length === 0) return <p className="text-center">ไม่พบข้อมูลพยากรณ์</p>

  return (
    <div className="mt-4">
      <h3 className="font-bold text-lg mb-2">พยากรณ์อากาศ 7 วันข้างหน้า</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
        {forecast.daily_forecast.map((day, index) => (
          <div key={index} className="bg-white p-2 rounded shadow text-sm">
            <p className="font-bold">{day.date}</p>
            <p>🌡 สูง: {day.tc_max}°C</p>
            <p>🌡 ต่ำ: {day.tc_min}°C</p>
            <p>💧 RH: {day.rh}%</p>
            <p>☁️ สภาพ: {weatherCondition(day.cond)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function weatherCondition(code) {
  const mapping = {
    1: "แจ่มใส",
    2: "มีเมฆบางส่วน",
    3: "มีเมฆเป็นส่วนมาก",
    4: "มีเมฆมาก",
    5: "ฝนเล็กน้อย",
    6: "ฝนปานกลาง",
    7: "ฝนหนัก",
    8: "พายุฝนฟ้าคะนอง",
    9: "ร้อนจัด",
    10: "หนาว",
    11: "หนาวจัด",
    12: "ร้อนจัดมาก",
  }

  return mapping[code] || `ไม่ทราบ (${code})`
}
