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
import { LocateIcon, CheckCircle2, Plus, X } from "lucide-react"

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

  const [locating, setLocating] = useState(false)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("📦 ส่งข้อมูล:", form)
  }

  return (
    <main className="min-h-screen bg-white p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">ลงทะเบียนแปลงปลูก</h1>

      <form onSubmit={handleSubmit} className="space-y-6 text-sm">
        <div className="space-y-1">
          <Label>ชื่อแปลง</Label>
          <Input name="name" value={form.name} onChange={handleInputChange} placeholder="เช่น แปลงมีความสุข" />
        </div>

        {/* ถ่ายรูปลักษณะ แบบ 4 ช่อง */}
        <div className="space-y-1">
          <Label>ถ่ายรูปลักษณะ</Label>
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="relative w-24 h-24 border border-dashed rounded-md flex items-center justify-center"
              >
                {form.images.general[index] ? (
                  <>
                    <img
                      src={form.images.general[index]}
                      alt={`ลักษณะ ${index + 1}`}
                      className="object-cover w-full h-full rounded-md"
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
                      aria-label="ลบรูป"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex items-center justify-center">
                    <Plus className="text-blue-500" size={28} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = URL.createObjectURL(file)
                          const updated = [...form.images.general]
                          updated[index] = url
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

        {/* พิกัด */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>ละติจูด</Label>
            <Input name="lat" value={form.lat} onChange={handleInputChange} placeholder="16.9xxxxxx" />
          </div>
          <div className="space-y-1">
            <Label>ลองจิจูด</Label>
            <Input name="lon" value={form.lon} onChange={handleInputChange} placeholder="99.1xxxxxx" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleGetLocation}
            disabled={locating}
            variant="outline"
            className="text-blue-600 border-blue-500 gap-2"
          >
            <LocateIcon className="w-4 h-4" />
            {locating ? "กำลังดึงพิกัด..." : "ดึงจาก GPS"}
          </Button>
        </div>

        {/* ชนิดพืช */}
        <div className="space-y-1">
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
        </div>

        {/* ระยะพืช */}
        <div className="space-y-1">
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
        </div>

        {/* Line ID */}
        <div className="space-y-1">
          <Label>Line ID</Label>
          <Input name="lineId" value={form.lineId} onChange={handleInputChange} placeholder="@yourlineid" />
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 text-white text-lg hover:bg-green-600 py-4 rounded-xl gap-2"
        >
          <CheckCircle2 className="w-5 h-5" />
          ลงทะเบียน
        </Button>
      </form>
    </main>
  )
}
