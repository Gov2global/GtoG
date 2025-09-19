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
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/mission/get/regmissos")
      const json = await res.json()
      const found = json.data?.find((p) => p._id === id)
      setPlot(found)
      setLoading(false)
    }
    fetchData()
  }, [id])

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (plot.images?.length >= 3) {
      alert("อัปโหลดได้สูงสุด 3 รูป")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/mission/upload", {
      method: "POST",
      body: formData,
    })
    const json = await res.json()
    if (json.success) {
      // [ADDED] update state
      setPlot((prev) => ({
        ...prev,
        images: [...(prev.images || []), json.url].slice(0, 3)
      }))
    } else {
      alert("อัปโหลดไม่สำเร็จ: " + json.message)
    }
    setUploading(false)
  }

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
      </div>

      {/* ✅ การ์ดแสดงรูปภาพ */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">📷 รูปภาพแปลง (สูงสุด 3)</h3>

        <div className="grid grid-cols-3 gap-2 mb-2">
          {plot.images?.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`plot-img-${idx}`}
              className="w-full h-32 object-cover rounded-lg shadow"
            />
          ))}
        </div>

        {plot.images?.length < 3 && (
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
        )}
      </div>

      {/* ✅ การ์ดพยากรณ์อากาศ */}
      {plot.lat && plot.lon && (
        <div className="bg-white rounded-lg shadow p-4">
          <Weather7Day lat={parseFloat(plot.lat)} lon={parseFloat(plot.lon)} />
        </div>
      )}
    </div>
  )
}
