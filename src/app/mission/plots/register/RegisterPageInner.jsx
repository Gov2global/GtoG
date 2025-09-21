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
import imageCompression from "browser-image-compression"

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    lat: "",
    lon: "",
    plantType: "",
    spacing: "",
    lineId: "",
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

  // ใช้ข้อมูลจาก learn52week
  const [data, setData] = useState([])
  const [types, setTypes] = useState([])
  const [spans, setSpans] = useState([])

  useEffect(() => {
    liff.init({ liffId: "2007697520-ReVxGaBb" })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then((profile) => {
            const userId = profile.userId
            setForm((prev) => ({ ...prev, lineId: userId }))
          })
        } else {
          liff.login({ redirectUri: window.location.href })
        }
      })
      .catch((err) => {
        console.error("LIFF init error:", err)
      })
  }, [])

  // โหลดข้อมูล learn52week
  useEffect(() => {
    fetch("/api/mission/get/learn52week")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          setData(res.data)
          setTypes([...new Set(res.data.map((d) => d.type))])
        }
      })
      .catch((err) => console.error("fetch error:", err))
  }, [])

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, plantType: type, spacing: "" }))
    const filtered = data.filter((d) => d.type === type)
    setSpans([...new Set(filtered.map((d) => d.span))])
  }

  const handleSpanChange = (span) => {
    setForm((prev) => ({ ...prev, spacing: span }))
  }

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

  const compressImage = async (file) => {
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1280,
        initialQuality: 0.6,
        useWebWorker: true,
      })
      return compressed
    } catch (err) {
      console.error("compress error:", err)
      return file
    }
  }

  const handleFileChange = async (fileInput, key, index = null) => {
    let actualFile = fileInput
    if (!(fileInput instanceof File)) {
      const blobType = fileInput.type || "image/jpeg"
      actualFile = new File([fileInput], `${key}-${Date.now()}.jpg`, { type: blobType })
    }

    const compressed = await compressImage(actualFile)

    if (key === "general") {
      const updated = [...form.images.general]
      updated[index] = compressed
      setForm({ ...form, images: { ...form.images, general: updated } })
    } else {
      setForm({ ...form, images: { ...form.images, [key]: compressed } })
    }
  }

  const appendImageToFormData = (formData, key, file) => {
    formData.append(key, file, file.name || `${key}.jpg`)
  }

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

      for (let i = 0; i < form.images.general.length; i++) {
        const file = form.images.general[i]
        if (file) {
          appendImageToFormData(formData, `general${i + 1}`, file)
        }
      }
      if (form.images.tree) appendImageToFormData(formData, "tree", form.images.tree)
      if (form.images.leaf) appendImageToFormData(formData, "leaf", form.images.leaf)
      if (form.images.fruit) appendImageToFormData(formData, "fruit", form.images.fruit)

      const res = await fetch("/api/mission/regmission", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.push("/mission")
        }, 2000)
      } else {
        alert("บันทึกไม่สำเร็จ: " + data.error)
      }
    } catch (err) {
      console.error("Error submitting:", err)
      alert("เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const renderImageUpload = (label, key) => (
    <div className="relative w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center bg-green-50">
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
        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-green-600 text-xs">
          <Camera className="mb-1" size={20} />
          กดเพื่อถ่ายรูป
          <input
            type="file"
            accept="image/*"
            // capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileChange(file, key)
            }}
          />
        </label>
      )}
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

        {/* รูปทั่วไป 4 รูป */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ถ่ายรูปลักษณะ (สูงสุด 4 รูป)</Label>
          <div className="flex flex-wrap justify-center gap-3">
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
                      // capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileChange(file, "general", index)
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* รูปต้น ใบ ผล */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">รูปต้น / ใบ / ผล</Label>
          <div className="grid grid-cols-3 gap-3">
            {renderImageUpload("รูปต้น", "tree")}
            {renderImageUpload("รูปใบ", "leaf")}
            {renderImageUpload("รูปผล", "fruit")}
          </div>
        </div>

        {/* พิกัด GPS */}
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

        {/* Step 1: Type */}
        <div className="space-y-2">
          <Label className="text-green-700 font-semibold">ชนิดพืช</Label>
          <Select onValueChange={handleTypeChange}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="เลือกชนิดพืช" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 2: Span */}
        {spans.length > 0 && (
          <div className="space-y-2">
            <Label className="text-green-700 font-semibold">ระยะพืช</Label>
            <Select onValueChange={handleSpanChange}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="เลือกระยะพืช" />
              </SelectTrigger>
              <SelectContent>
                {spans.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit */}
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
