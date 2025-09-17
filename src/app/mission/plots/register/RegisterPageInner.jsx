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
import { useRouter, useSearchParams } from "next/navigation"
import liff from "@line/liff"

export default function RegisterPageInner() {
  const searchParams = useSearchParams()
  const lineIdFromQuery = searchParams.get("lineId") || "" // ✅ ดึงจาก query string

  const [form, setForm] = useState({
    name: "",
    lat: "",
    lon: "",
    plantType: "",
    spacing: "",
    lineId: lineIdFromQuery, // ✅ ตั้งค่าเริ่มต้นจาก query
    images: { general: [null, null, null, null], tree: null, leaf: null, fruit: null },
  })

  const router = useRouter()
  const [locating, setLocating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // --- Init LIFF ---
  useEffect(() => {
    let mounted = true

    async function initLiff() {
      try {
        await liff.init({ liffId: "2007697520-ReVxGaBb" })

        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href })
          return
        }

        const profile = await liff.getProfile()
        const userId = profile.userId

        if (mounted) {
          setForm((prev) => ({ ...prev, lineId: userId }))
        }
      } catch (err) {
        console.error("❌ LIFF init error:", err)
      }
    }

    initLiff()
    return () => { mounted = false }
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

  // --- Submit ---
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
      formData.append("lineId", form.lineId) // ✅ ส่ง Line ID ไป DB

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          className="flex items-center gap-2 text-green-700 hover:text-green-900"
          onClick={() => router.push("/mission")}
          aria-label="กลับไปที่ Mission"
        >
          <ArrowLeft className="w-5 h-5" />
          กลับ
        </Button>
      </div>

      <h1 className="text-2xl font-extrabold text-center mb-6 text-green-800 flex items-center justify-center gap-2">
        🌱 ลงทะเบียนแปลงปลูก
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 text-base bg-white p-6 rounded-2xl shadow-md">
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

        {/* ✅ แสดง Line ID แต่ไม่ให้แก้ */}
        {form.lineId && (
          <div className="space-y-2">
            <Label className="text-green-700 font-semibold">Line ID</Label>
            <Input value={form.lineId} disabled className="h-12 bg-gray-100" />
          </div>
        )}

        {/* ปุ่ม Submit */}
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
