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
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6),
        }))
        setLocating(false)
      },
      (err) => {
        alert("ไม่สามารถดึงพิกัดได้: " + err.message)
        setLocating(false)
      }
    )
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
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          router.push("/mission")
        }, 2000)
      } else {
        alert("บันทึกไม่สำเร็จ: " + data.error)
      }
    } catch (err) {
      console.error("Error:", err)
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
            capture="environment"
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
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Label>ชื่อแปลง</Label>
      <Input name="name" value={form.name} onChange={handleInputChange} />

      <Label>ละติจูด</Label>
      <Input name="lat" value={form.lat} onChange={handleInputChange} />

      <Label>ลองจิจูด</Label>
      <Input name="lon" value={form.lon} onChange={handleInputChange} />

      <Label>ชนิดพืช</Label>
      <Select onValueChange={(v) => setForm({ ...form, plantType: v })}>
        <SelectTrigger>
          <SelectValue placeholder="เลือกชนิดพืช" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ทุเรียน">ทุเรียน</SelectItem>
          <SelectItem value="มังคุด">มังคุด</SelectItem>
          <SelectItem value="ลองกอง">ลองกอง</SelectItem>
        </SelectContent>
      </Select>

      <Label>ระยะพืช</Label>
      <Select onValueChange={(v) => setForm({ ...form, spacing: v })}>
        <SelectTrigger>
          <SelectValue placeholder="เลือกระยะพืช" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ระยะไข่ปลา">ระยะไข่ปลา</SelectItem>
          <SelectItem value="ระยะหว่าน">ระยะหว่าน</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" disabled={loading}>
        {loading ? "⏳ กำลังบันทึก..." : "ลงทะเบียน"}
      </Button>
    </form>
  )
}