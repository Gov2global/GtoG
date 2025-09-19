"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Weather7Day from "../components/Weather7Day"

export default function ManagePageInner() {
  const { id } = useParams()
  const router = useRouter()
  const [plot, setPlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState([]) // [ADDED: เก็บ preview ของภาพ]

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/mission/get/regmissos")
        const json = await res.json()
        const found = json.data?.find((p) => p._id === id)
        setPlot(found)
      } catch (err) {
        console.error("❌ error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // ✅ เมื่อเลือกไฟล์
  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file), // [ADDED: แปลงเป็น preview URL]
    }))

    setImages((prev) => {
      const updated = [...prev, ...newPreviews].slice(0, 3) // จำกัดสูงสุด 3
      return updated
    })

    e.target.value = "" // reset input เพื่อเลือกไฟล์ใหม่ซ้ำได้
  }

  // ✅ ลบภาพ
  function handleRemove(idx) {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== idx)
      return updated
    })
  }

  if (loading) return <p className="text-center mt-10">⏳ กำลังโหลด...</p>
  if (!plot) return <p className="text-center mt-10">❌ ไม่พบข้อมูลแปลง</p>

  return (
    <div className="p-4 space-y-4">
      {/* การ์ดข้อมูลแปลง */}
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
      </div>

      {/* ✅ การ์ดรูปภาพ */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">📷 รูปภาพแปลง (สูงสุด 3)</h3>

        {/* Preview รูป */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={img.url}
                alt={`preview-${idx}`}
                className="w-full h-32 object-cover rounded-lg shadow"
              />
              <button
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ปุ่มเลือกไฟล์ */}
        {images.length < 3 && (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        )}
      </div>

      {/* การ์ดพยากรณ์อากาศ */}
      {plot.lat && plot.lon && (
        <div className="bg-white rounded-lg shadow p-4">
          <Weather7Day lat={parseFloat(plot.lat)} lon={parseFloat(plot.lon)} />
        </div>
      )}
    </div>
  )
}
