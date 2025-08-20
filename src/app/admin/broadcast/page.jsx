"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ScheduledList from "./components/ScheduledList";
import CreateBroadcastDialog from "./components/CreateBroadcastDialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BroadcastPage() {
  const [open, setOpen] = useState(false); // เปิด/ปิด Dialog
  const [refreshToken, setRefreshToken] = useState(0); // trigger refresh list

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">รายการข้อความแจ้งเตือน</h1>
          <div className="flex items-center gap-3">
            {/* ปุ่มกลับไป */}
            <Link
              href="/admin/menu"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition"
            >
              <ArrowLeft className="h-4 w-4" /> กลับไป
            </Link>
            {/* ปุ่มเพิ่มข้อความ */}
            <Button onClick={() => setOpen(true)}>
              + เพิ่มข้อความแจ้งเตือน
            </Button>
          </div>
        </div>

        {/* ตารางรายการข้อความ */}
        <ScheduledList refreshToken={refreshToken} />
      </div>

      {/* Dialog สำหรับสร้างข้อความใหม่ */}
      <CreateBroadcastDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => setRefreshToken((x) => x + 1)}
      />
    </div>
  );
}
