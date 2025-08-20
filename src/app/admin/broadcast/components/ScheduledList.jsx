"use client"; // [ADDED: มี state + interaction]

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify"; // [ADDED: สำหรับแสดงข้อความแจ้งเตือน]
import Link from "next/link"; // [ADDED: สำหรับลิงก์ไปหน้าแก้ไข]

export default function ScheduledList({ refreshToken = 0 }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [upcoming, setUpcoming] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  async function fetchList(p = page) {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(p),
        perPage: String(perPage),
        upcoming: upcoming ? "1" : "0",
      });
      if (q.trim()) params.set("q", q.trim());
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/broadcast?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "โหลดข้อมูลไม่สำเร็จ");

      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPerPage(data.perPage || perPage);
    } catch (e) {
      toast.error("❌ " + e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, status, upcoming, perPage]);

  async function handleDelete(id) {
    if (!confirm("ยืนยันลบรายการนี้?")) return;
    try {
      const res = await fetch(`/api/admin/broadcastdelete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "ลบไม่สำเร็จ");
      }
      toast.success("✅ ลบรายการสำเร็จ");
      fetchList();
    } catch (e) {
      toast.error("❌ " + e.message);
    }
  }

  return (
    <div className="space-y-4">
      <ToastContainer position="top-center" /> {/* [ADDED] */}
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="sm:col-span-2">
            <Label className="text-sm">ค้นหา</Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="เช่น หัวข้อ/ข้อความ"
              onKeyDown={(e) => e.key === "Enter" && fetchList(1)}
              className="h-10"
            />
          </div>
          <div>
            <Label className="text-sm">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="queued">queued</SelectItem>
                <SelectItem value="processing">processing</SelectItem>
                <SelectItem value="done">done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">ต่อหน้า</Label>
            <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant={upcoming ? "default" : "outline"} onClick={() => setUpcoming(true)}>ยังไม่ส่ง</Button>
          <Button variant={!upcoming ? "default" : "outline"} onClick={() => setUpcoming(false)}>ทั้งหมด</Button>
          <Button variant="secondary" onClick={() => fetchList()}>รีเฟรช</Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="min-w-[960px] w-full text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="text-left px-3 py-2 w-[160px]">กำหนดส่ง</th>
              <th className="text-left px-3 py-2 w-[100px]">ประเภท</th>
              <th className="text-left px-3 py-2 w-[100px]">โหมด</th>
              <th className="text-left px-3 py-2">เนื้อหา</th>
              <th className="text-left px-3 py-2 w-[100px]">สถานะ</th>
              <th className="text-left px-3 py-2 w-[160px]">จัดการ</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center px-4 py-6 text-gray-500">ไม่พบรายการ</td>
              </tr>
            ) : (
              items.map((it) => {
                const sendAt = it.sendAt ? new Date(it.sendAt) : null;
                const fullTitle = it.messageType === "flex"
                  ? it.flexData?.title || "(ไม่มีหัวข้อ)"
                  : it.message || "";

                const statusColor = it.sent
                  ? "bg-green-100 text-green-800"
                  : it.status === "processing"
                  ? "bg-yellow-100 text-yellow-800"
                  : it.status === "queued"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800";

                return (
                  <tr key={it._id} className="border-t">
                    <td className="px-3 py-2">{sendAt ? format(sendAt, "yyyy-MM-dd HH:mm") : "-"}</td>
                    <td className="px-3 py-2"><Badge variant="secondary">{it.targetType}</Badge></td>
                    <td className="px-3 py-2"><Badge>{it.messageType}</Badge></td>
                    <td className="px-3 py-2 whitespace-pre-wrap">{fullTitle}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${statusColor}`}>
                        {it.sent ? "sent" : it.status}
                      </span>
                    </td>
                    {it.sent ? (
                      <td className="px-3 py-2 text-gray-400">-</td>
                    ) : (
                      <td className="px-3 py-2 flex gap-2">
                        <Link href={`/admin/broadcast/edit/${it._id}`}>
                          <Button variant="outline" size="sm">แก้ไข</Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(it._id)}>ลบ</Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
        <span>
          ทั้งหมด {total} รายการ • หน้า {page}/{Math.max(1, Math.ceil(total / perPage))}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => {
            const p = Math.max(1, page - 1);
            setPage(p);
            fetchList(p);
          }}>ก่อนหน้า</Button>
          <Button variant="outline" size="sm" disabled={loading || page >= Math.ceil(total / perPage)} onClick={() => {
            const p = Math.min(page + 1, Math.ceil(total / perPage));
            setPage(p);
            fetchList(p);
          }}>ถัดไป</Button>
        </div>
      </div>
    </div>
  );
}
