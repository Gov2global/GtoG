"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { LocateIcon, CheckCircle2, Camera, X, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import liff from "@line/liff"

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lon: "",
    plantType: "",
    spacing: "",
    lineId: "", // ✅ เก็บจาก LIFF
    images: {
      general: [null, null, null, null],
      tree: null,
      leaf: null,
      fruit: null,
    },
  })
  const router = useRouter()

  const [locating, setLocating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // --- Init LIFF ---
  useEffect(() => {
    liff.init({ liffId: "2007697520-ReVxGaBb" })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then((profile) => {
            const userId = profile.userId
            console.log("✅ ได้ Line UserID:", userId)
            setForm((prev) => ({ ...prev, lineId: userId }))
          })
        } else {
          liff.login({ redirectUri: window.location.href })
        }
      })
      .catch((err) => {
        console.error("❌ LIFF init error:", err)
      })
  }, [])

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("อุปกรณ์นี้ไม่รองรับการใช้ GPS")
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setForm((prev) => ({
          ...prev,
          lat: latitude.toFixed(6),
          lon: longitude.toFixed(6),
        }))
        setLocating(false)
      },
      (err) => {
        alert("ไม่สามารถดึงพิกัดได้: " + err.message)
        setLocating(false)
      }
    )
  }

  useEffect(() => {
    handleGetLocation()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("lat", form.lat)
      formData.append("lon", form.lon)
      formData.append("plantType", form.plantType)
      formData.append("spacing", form.spacing)
      formData.append("lineId", form.lineId)

      form.images.general.forEach((file, i) => {
        if (file) formData.append(`general${i + 1}`, file)
      })
      if (form.images.tree) formData.append("tree", form.images.tree)
      if (form.images.leaf) formData.append("leaf", form.images.leaf)
      if (form.images.fruit) formData.append("fruit", form.images.fruit)

      const res = await fetch("/api/mission/regmission", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        console.log("✅ ลงทะเบียนสำเร็จ:", data)
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.push("/mission")
        }, 2000)
      } else {
        alert("❌ บันทึกไม่สำเร็จ: " + data.error)
      }
    } catch (err) {
      console.error("Error:", err)
      alert("❌ เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const renderImageUpload = (label, key) => (
  <div className="space-y-2">
    <Label className="text-green-700 font-semibold">{label}</Label>
    <div className="relative w-40 h-40 border-2 border-dashed rounded-xl flex items-center justify-center bg-green-50">
      {form.images[key] ? (
        <>
          <img
            src={URL.createObjectURL(form.images[key])}
            alt={label}
            className="object-cover w-full h-full rounded-xl"
          />
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                images: { ...prev.images, [key]: null },
              }))
            }
            className="absolute top-[-6px] right-[-6px] bg-red-500 text-white p-1 rounded-full shadow"
            aria-label="ลบรูป"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-green-600">
          <Camera className="mb-1" size={26} />
          <span className="text-xs">กดเพื่อถ่ายรูป</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"   // ✅ เพิ่มตรงนี้ เพื่อใช้กล้องหลัง
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setForm((prev) => ({
                  ...prev,
                  images: { ...prev.images, [key]: file },
                }))
              }
            }}
          />
        </label>
      )}
    </div>
  </div>
)


  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 text-green-700 hover:text-green-900"
          onClick={() => router.push("/mission")}
        >
          <ArrowLeft className="w-5 h-5" />
          กลับ
        </Button>
      </div>

      <h1 className="text-2xl font-extrabold text-center mb-6 text-green-800 flex items-center justify-center gap-2">
        🌱 ลงทะเบียนแปลงปลูก
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 text-base bg-white p-6 rounded-2xl shadow-md">
        {/* ชื่อแปลง */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ชื่อแปลง</Label>
          <Input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="เช่น แปลงมีความสุข"
            className="h-12 text-lg"
          />
        </div>

        {/* รูปทั่วไป */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ถ่ายรูปลักษณะ (สูงสุด 4 รูป)</Label>
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="relative w-28 h-28 border-2 border-dashed rounded-xl flex items-center justify-center bg-green-50"
              >
                {form.images.general[index] ? (
                  <>
                    <img
                      src={URL.createObjectURL(form.images.general[index])}
                      alt={`ลักษณะ ${index + 1}`}
                      className="object-cover w-full h-full rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...form.images.general]
                        updated[index] = null
                        setForm({
                          ...form,
                          images: { ...form.images, general: updated },
                        })
                      }}
                      className="absolute top-[-6px] right-[-6px] bg-red-500 text-white p-1 rounded-full shadow"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-green-600">
                    <Camera className="mb-1" size={26} />
                    <span className="text-xs">กดเพื่อถ่ายรูป</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment" // ✅ ใช้กล้องหลัง
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const updated = [...form.images.general]
                          updated[index] = file
                          setForm({
                            ...form,
                            images: { ...form.images, general: updated },
                          })
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* รูปต้น / ใบ / ผล */}
        {renderImageUpload("รูปต้น", "tree")}
        {renderImageUpload("รูปใบ", "leaf")}
        {renderImageUpload("รูปผล", "fruit")}

        {/* พิกัด */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-green-700 font-semibold">ละติจูด</Label>
            <Input name="lat" value={form.lat} onChange={handleInputChange} />
          </div>
          <div className="space-y-1">
            <Label className="text-green-700 font-semibold">ลองจิจูด</Label>
            <Input name="lon" value={form.lon} onChange={handleInputChange} />
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGetLocation}
          disabled={locating}
          variant="outline"
          className="w-full text-blue-700 border-blue-400 gap-2 py-3 font-semibold"
        >
          <LocateIcon className="w-5 h-5" />
          {locating ? "กำลังดึงพิกัด..." : "📍 ดึงพิกัดจาก GPS"}
        </Button>

        {/* ชนิดพืช */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ชนิดพืช</Label>
          <Select onValueChange={(v) => setForm({ ...form, plantType: v })}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="เลือกชนิดพืช" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทุเรียน">ทุเรียน</SelectItem>
              <SelectItem value="มังคุด">มังคุด</SelectItem>
              <SelectItem value="ลองกอง">ลองกอง</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ระยะพืช */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ระยะพืช</Label>
          <Select onValueChange={(v) => setForm({ ...form, spacing: v })}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="เลือกระยะพืช" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ระยะไข่ปลา">ระยะไข่ปลา</SelectItem>
              <SelectItem value="ระยะหว่าน">ระยะหว่าน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Line ID */}
        <p className="text-sm text-gray-500">Line ID: {form.lineId}</p>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white text-xl hover:bg-green-700 py-4 rounded-2xl gap-2 shadow-lg"
        >
          {loading ? "⏳ กำลังบันทึก..." : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              ลงทะเบียน
            </>
          )}
        </Button>
      </form>

      {success && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          ✅ ลงทะเบียนสำเร็จ!
        </div>
      )}
    </main>
  )
}
