"use client"; // [ADDED: หน้าใช้ state/interaction ทั้งหมด]

import React, { useState } from "react"; // [ADDED]
import dynamic from "next/dynamic"; // [ADDED]
import { Textarea } from "@/components/ui/textarea"; // [ADDED]
import { Input } from "@/components/ui/input"; // [ADDED]
import { Button } from "@/components/ui/button"; // [ADDED]
import { Label } from "@/components/ui/label"; // [ADDED]
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; // [ADDED]
import { Badge } from "@/components/ui/badge"; // [ADDED]
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // [ADDED]
import { Card, CardContent } from "@/components/ui/card"; // [ADDED]
import { ScrollArea } from "@/components/ui/scroll-area"; // [ADDED]
import { Separator } from "@/components/ui/separator"; // [ADDED]
import { format } from "date-fns"; // [ADDED]

import Field from "./components/Field"; // [CHANGED: ใช้คอมโพเนนต์ Field แยกไฟล์]
const CalendarClient = dynamic(() => import("./components/CalendarClient"), {
  ssr: false,
}); // [ADDED]

// ===== helper กัน format() พัง =====
function isValidDate(d) { // [ADDED]
  return d instanceof Date && !Number.isNaN(d);
}

/* ---------- หน้า Broadcast ---------- */
export default function Broadcastpage() { // [UNCHANGED: คงชื่อเดิม]
  // ====== โหมดการส่ง ======
  const [messageType, setMessageType] = useState("flex"); // [UNCHANGED]
  const [textMessage, setTextMessage] = useState(""); // [UNCHANGED]

  // ====== Flex fields ======
  const [distance, setDistance] = useState(""); // [UNCHANGED]
  const [action, setAction] = useState(""); // [UNCHANGED]
  const [water, setWater] = useState(""); // [UNCHANGED]
  const [fertilizer, setFertilizer] = useState(""); // [UNCHANGED]
  const [disease, setDisease] = useState(""); // [UNCHANGED]
  const [insect, setInsect] = useState(""); // [UNCHANGED]
  const [altText, setAltText] = useState("ประชาสัมพันธ์"); // [UNCHANGED]

  // ====== Target ======
  const [targetType, setTargetType] = useState("all"); // [UNCHANGED]
  const [regType, setRegType] = useState(""); // [UNCHANGED]
  const [targetIds, setTargetIds] = useState(""); // [UNCHANGED]

  // ====== Schedule ======
  const [sendDate, setSendDate] = useState(new Date()); // [UNCHANGED]
  const [sendTime, setSendTime] = useState("12:00"); // [UNCHANGED]

  // refresh ตารางหลังบันทึก
  const [refreshToken, setRefreshToken] = useState(0); // [UNCHANGED]

  const handleSubmit = async () => { // [UNCHANGED logic]
    try {
      if (!targetType) throw new Error("กรุณาเลือกวิธีการส่ง"); // [ADDED]
      if (!sendDate || !isValidDate(sendDate)) throw new Error("กรุณาเลือกวันที่"); // [CHANGED]
      if (!sendTime || !/^\d{2}:\d{2}$/.test(sendTime))
        throw new Error("กรุณาเลือกเวลาที่ถูกต้อง (HH:mm)"); // [ADDED]

      const [hStr, mStr] = sendTime.split(":"); // [ADDED]
      const h = Number(hStr), m = Number(mStr); // [ADDED]
      const sendAt = new Date(sendDate); // [ADDED]
      sendAt.setHours(h, m, 0, 0); // [ADDED]

      let payload = { targetType, sendAt: sendAt.toISOString() }; // [ADDED]

      if (messageType === "text") { // [ADDED]
        const msg = (textMessage || "").trim(); // [ADDED]
        if (!msg) throw new Error("กรุณากรอกข้อความทั่วไป"); // [ADDED]
        payload = { ...payload, messageType: "text", message: msg }; // [ADDED]
      } else {
        const title = (distance || "").trim(); // [ADDED]
        if (!title && !action && !water && !fertilizer && !disease && !insect) {
          throw new Error("กรุณากรอกข้อมูลอย่างน้อย 1 ช่องใน Flex"); // [ADDED]
        }
        payload = {
          ...payload,
          messageType: "flex",
          altText: (altText || "ประชาสัมพันธ์").trim(),
          flexData: {
            title: title || "หัวข้อ",
            "การปฏิบัติงาน": action,
            "การให้น้ำ": water,
            "การให้ปุ๋ย": fertilizer,
            "โรค": disease,
            "แมลง": insect,
          },
        }; // [ADDED]
      }

      if (targetType === "group") { // [ADDED]
        if (!regType.trim())
          throw new Error("กรุณากรอก regType สำหรับการส่งแบบกลุ่ม"); // [ADDED]
        payload.targetGroup = { regType: regType.trim() }; // [ADDED]
      } else if (targetType === "individual") {
        const ids = (targetIds || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean); // [ADDED]
        if (ids.length === 0)
          throw new Error("กรุณากรอก regLineID อย่างน้อย 1 รายการ"); // [ADDED]
        payload.targetIds = ids; // [ADDED]
      }

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      }); // [ADDED]
      const data = await res.json(); // [ADDED]
      if (!res.ok) throw new Error(data?.error || "Error saving broadcast"); // [ADDED]

      alert("✅ บันทึกสำเร็จ"); // [ADDED]
      setRefreshToken((x) => x + 1); // [ADDED]

      // reset
      setTextMessage(""); // [ADDED]
      setDistance(""); // [ADDED]
      setAction(""); // [ADDED]
      setWater(""); // [ADDED]
      setFertilizer(""); // [ADDED]
      setDisease(""); // [ADDED]
      setInsect(""); // [ADDED]
      setAltText("ประชาสัมพันธ์"); // [ADDED]
      setRegType(""); // [ADDED]
      setTargetIds(""); // [ADDED]
    } catch (err) {
      console.error("[Client Error]", err); // [ADDED]
      alert("❌ เกิดข้อผิดพลาด: " + err.message); // [ADDED]
    }
  };

  const displayDate = isValidDate(sendDate) ? format(sendDate, "yyyy-MM-dd") : "-"; // [ADDED]

  return ( // [CHANGED: ปรับซ้าย 420px ให้โปร่งขึ้น]
    <div className="min-h-screen w-full bg-gray-50"> {/* [ADDED] */}
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6"> {/* [ADDED] */}
        <h1 className="text-2xl font-bold mb-4">ตั้งค่าการส่งข้อความ</h1> {/* [ADDED] */}

        {/* ซ้าย 420px / ขวาขยาย */}
        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6"> {/* [CHANGED] */}
          {/* ====== ฟอร์ม (ซ้าย) ====== */}
          <Card className="shadow-sm"> {/* [ADDED] */}
            <CardContent className="space-y-6 p-4 sm:p-6"> {/* [ADDED] */}
              <div className="space-y-2">
                <Label className="text-sm">รูปแบบข้อความ</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="เลือกรูปแบบข้อความ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">ข้อความทั่วไป (Text)</SelectItem>
                    <SelectItem value="flex">Flex Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* เนื้อหา */}
              {messageType === "text" ? (
                <div className="space-y-2">
                  <Label className="text-sm">ข้อความ</Label>
                  <Textarea
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    rows={4}
                    placeholder="พิมพ์ข้อความที่ต้องการส่ง เช่น สวัสดีครับ/ค่ะ"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm">ข้อความสำรอง (altText)</Label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="เช่น ข่าวประชาสัมพันธ์"
                      className="h-10" // [ADDED]
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="ระยะ (หัวข้อ)" value={distance} onChange={setDistance} />
                    <Field label="การปฏิบัติงาน" value={action} onChange={setAction} />
                    <Field label="การให้น้ำ" value={water} onChange={setWater} />
                    <Field label="การให้ปุ๋ย" value={fertilizer} onChange={setFertilizer} />
                    <Field label="โรค" value={disease} onChange={setDisease} />
                    <Field label="แมลง" value={insect} onChange={setInsect} />
                  </div>
                </>
              )}

              {/* Target */}
              <Separator /> {/* [ADDED] */}
              <div className="space-y-2">
                <Label className="text-sm">เลือกวิธีการส่ง</Label>
                <Select value={targetType} onValueChange={setTargetType}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="เลือกวิธีการส่ง" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ส่งหาทั้งหมด</SelectItem>
                    <SelectItem value="group">ส่งตามกลุ่ม (regType)</SelectItem>
                    <SelectItem value="individual">ส่งเฉพาะบุคคล (regLineID)</SelectItem>
                  </SelectContent>
                </Select>

                {targetType === "group" && (
                  <div className="mt-3">
                    <Label className="text-sm">regType</Label>
                    <Input value={regType} onChange={(e) => setRegType(e.target.value)} placeholder="เช่น เกษตรกร" className="h-10" />
                  </div>
                )}

                {targetType === "individual" && (
                  <div className="mt-3">
                    <Label className="text-sm">regLineID (คั่นด้วย ,)</Label>
                    <Input value={targetIds} onChange={(e) => setTargetIds(e.target.value)} placeholder="เช่น Uxxxxxx, Uyyyyyy" className="h-10" />
                  </div>
                )}
              </div>

              {/* Schedule */}
              <Separator /> {/* [ADDED] */}
              <div className="grid grid-cols-1 gap-4">
                <div className="min-w-0">
                  <Label className="text-sm">เลือกวัน</Label>
                  <div className="mt-2 rounded-lg border overflow-hidden relative z-10">
                    <CalendarClient selected={sendDate} onSelect={setSendDate} />
                  </div>
                </div>
                <div className="min-w-0">
                  <Label className="text-sm">เลือกเวลา</Label>
                  <Input
                    className="mt-2 h-10"
                    type="time"
                    value={sendTime}
                    onChange={(e) => setSendTime(e.target.value)}
                    aria-label="เลือกเวลา"
                  />
                  <p className="text-xs mt-2 text-gray-600">
                    จะส่งเมื่อ: {displayDate} เวลา {sendTime}
                  </p>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full h-10">บันทึกการแจ้งเตือน</Button>
            </CardContent>
          </Card>

          {/* ====== ตาราง (ขวา) ====== */}
          <Card className="shadow-sm"> {/* [ADDED] */}
            <CardContent className="p-4 sm:p-6"> {/* [ADDED] */}
              <ScheduledList refreshToken={refreshToken} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ==================== LIST ==================== */
function ScheduledList({ refreshToken = 0 }) { // [UNCHANGED core]
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("all"); // all|queued|processing|done
  const [upcoming, setUpcoming] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
      if (!res.ok) throw new Error(data?.error || "Load failed");

      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setPerPage(data.perPage || perPage);
    } catch (e) {
      alert("โหลดรายการไม่สำเร็จ: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("ต้องการยกเลิก/ลบงานนี้หรือไม่?")) return;
    try {
      const res = await fetch(`/api/admin/broadcastdelete/${id}`, { method: "DELETE" });
      if (res.status === 204) { fetchList(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || res.statusText || "Delete failed");
      fetchList();
    } catch (e) {
      alert("ลบไม่สำเร็จ: " + e.message);
    }
  }

  async function onEditOpen(id) {
    try {
      const res = await fetch(`/api/admin/broadcast/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Load failed");
      setEditing(data.item);
      setEditOpen(true);
    } catch (e) {
      alert("เปิดแบบฟอร์มแก้ไขไม่สำเร็จ: " + e.message);
    }
  }

  async function onEditSave(payload) {
    try {
      const id = editing?._id;
      const res = await fetch(`/api/admin/broadcast/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      setEditOpen(false);
      setEditing(null);
      fetchList();
    } catch (e) {
      alert("บันทึกการแก้ไขไม่สำเร็จ: " + e.message);
    }
  }

  React.useEffect(() => {
    fetchList(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perPage, status, upcoming, refreshToken]);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="sm:col-span-2">
            <Label className="text-sm">ค้นหา</Label>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="เช่น ข้อความ/หัวข้อ"
              className="h-10"
              onKeyDown={(e) => e.key === "Enter" && fetchList(1)}
            />
          </div>
          <div>
            <Label className="text-sm">สถานะ</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10"><SelectValue placeholder="ทั้งหมด" /></SelectTrigger>
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
            <Select
              value={String(perPage)}
              onValueChange={(v) => setPerPage(parseInt(v, 10))}
            >
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

        <div className="flex items-center gap-2">
          <Button variant={upcoming ? "default" : "outline"} onClick={() => setUpcoming(true)} className="h-10">ยังไม่ส่ง</Button>
          <Button variant={!upcoming ? "default" : "outline"} onClick={() => setUpcoming(false)} className="h-10">ทั้งหมด</Button>
          <Button variant="secondary" onClick={() => fetchList()} className="h-10">รีเฟรช</Button>
        </div>
      </div>

      {/* ตาราง */}
      <div className="rounded-lg border">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-left w-[150px]">กำหนดส่ง</th>
                <th className="px-3 py-2 text-left w-[120px]">ประเภท</th>
                <th className="px-3 py-2 text-left w-[100px]">โหมด</th>
                <th className="px-3 py-2 text-left">เนื้อหา/หัวข้อ</th>
                <th className="px-3 py-2 text-left w-[120px]">สถานะ</th>
                <th className="px-3 py-2 text-right w-[160px]">จัดการ</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-gray-50/40">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-gray-500">ไม่พบรายการ</td>
                </tr>
              )}
              {items.map((it) => {
                const sendAt = it.sendAt ? new Date(it.sendAt) : null;
                const fullTitle =
                  it.messageType === "flex"
                    ? it.flexData?.title || "(ไม่มีหัวข้อ)"
                    : it.message || "";
                const canEdit = !it.sent && it.status !== "processing";
                const statusColor =
                  it.sent ? "bg-emerald-100 text-emerald-800"
                  : it.status === "processing" ? "bg-amber-100 text-amber-800"
                  : it.status === "queued" ? "bg-sky-100 text-sky-800"
                  : "bg-gray-100 text-gray-800";

                return (
                  <tr key={it._id} className="border-t align-top">
                    <td className="px-3 py-2">{sendAt && !Number.isNaN(sendAt) ? format(sendAt, "yyyy-MM-dd HH:mm") : "-"}</td>{/* no space */}
                    <td className="px-3 py-2"><Badge variant="secondary">{it.targetType}</Badge></td>{/* no space */}
                    <td className="px-3 py-2"><Badge>{it.messageType || "text"}</Badge></td>{/* no space */}
                    <td className="px-3 py-2 whitespace-pre-wrap break-words leading-relaxed">{fullTitle}</td>{/* no space */}
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColor}`}>
                        {it.sent ? "sent" : it.status}
                      </span>
                    </td>{/* no space */}
                    <td className="px-3 py-2 text-right space-x-2">
                      {canEdit ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => onEditOpen(it._id)}>แก้ไข</Button>
                          <Button variant="destructive" size="sm" onClick={() => onDelete(it._id)}>ยกเลิก</Button>
                        </>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3">
        <div className="text-sm text-gray-600">
          ทั้งหมด {total} รายการ • หน้า {page}/{Math.max(1, Math.ceil(total / perPage))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading || page <= 1}
            onClick={() => { const p = Math.max(1, page - 1); setPage(p); fetchList(p); }}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            disabled={loading || page >= Math.max(1, Math.ceil(total / perPage))}
            onClick={() => { const p = Math.min(Math.max(1, Math.ceil(total / perPage)), page + 1); setPage(p); fetchList(p); }}
          >
            ถัดไป
          </Button>
        </div>
      </div>

      {/* Dialog แก้ไข (Full Screen) */}
      <EditDialog
        open={editOpen}
        onOpenChange={(v) => { setEditOpen(v); if (!v) setEditing(null); }}
        item={editing}
        onSave={onEditSave}
      />
    </div>
  );
}

/* ==================== EDIT DIALOG (FULL SCREEN) ==================== */
function EditDialog({ open, onOpenChange, item, onSave }) { // [CHANGED: ปรับให้เต็มจอ + โครง flex]
  const [saving, setSaving] = useState(false);

  const [messageType, setMessageType] = useState(item?.messageType || "flex");
  const [textMessage, setTextMessage] = useState(item?.message || "");

  const [distance, setDistance] = useState(item?.flexData?.title || "");
  const [action, setAction] = useState(item?.flexData?.["การปฏิบัติงาน"] || "");
  const [water, setWater] = useState(item?.flexData?.["การให้น้ำ"] || "");
  const [fertilizer, setFertilizer] = useState(item?.flexData?.["การให้ปุ๋ย"] || "");
  const [disease, setDisease] = useState(item?.flexData?.["โรค"] || "");
  const [insect, setInsect] = useState(item?.flexData?.["แมลง"] || "");
  const [altText, setAltText] = useState(item?.altText || "ประชาสัมพันธ์");

  const [targetType, setTargetType] = useState(item?.targetType || "all");
  const [regType, setRegType] = useState(item?.targetGroup?.regType || "");
  const [targetIds, setTargetIds] = useState((item?.targetIds || []).join(","));

  const sendAt = item?.sendAt ? new Date(item.sendAt) : new Date();
  const [sendDate, setSendDate] = useState(sendAt);
  const [sendTime, setSendTime] = useState(
    `${String(sendAt.getHours()).padStart(2, "0")}:${String(sendAt.getMinutes()).padStart(2, "0")}`
  );

  React.useEffect(() => {
    if (!item) return;
    setMessageType(item.messageType || "flex");
    setTextMessage(item.message || "");
    setDistance(item.flexData?.title || "");
    setAction(item.flexData?.["การปฏิบัติงาน"] || "");
    setWater(item.flexData?.["การให้น้ำ"] || "");
    setFertilizer(item.flexData?.["การให้ปุ๋ย"] || "");
    setDisease(item.flexData?.["โรค"] || "");
    setInsect(item.flexData?.["แมลง"] || "");
    setAltText(item.altText || "ประชาสัมพันธ์");
    setTargetType(item.targetType || "all");
    setRegType(item.targetGroup?.regType || "");
    setTargetIds((item.targetIds || []).join(","));
    const dt = item.sendAt ? new Date(item.sendAt) : new Date();
    setSendDate(dt);
    setSendTime(`${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`);
  }, [item]);

  async function submit() {
    try {
      setSaving(true);
      if (!sendDate || Number.isNaN(sendDate)) throw new Error("กรุณาเลือกวันที่");
      if (!/^\d{2}:\d{2}$/.test(sendTime)) throw new Error("กรุณาเลือกเวลาที่ถูกต้อง (HH:mm)");

      const [hStr, mStr] = sendTime.split(":");
      const h = Number(hStr), m = Number(mStr);
      const nextSend = new Date(sendDate);
      nextSend.setHours(h, m, 0, 0);

      const payload = {
        targetType,
        targetGroup: targetType === "group" ? { regType: regType.trim() } : {},
        targetIds: targetType === "individual" ? targetIds.split(",").map(s => s.trim()).filter(Boolean) : [],
        sendAt: nextSend.toISOString(),
      };

      if (messageType === "text") {
        const msg = (textMessage || "").trim();
        if (!msg) throw new Error("กรุณากรอกข้อความทั่วไป");
        payload.messageType = "text";
        payload.message = msg;
        payload.flexData = null;
        payload.altText = "";
      } else {
        const title = (distance || "").trim();
        if (!title && !action && !water && !fertilizer && !disease && !insect) {
          throw new Error("กรุณากรอกข้อมูลอย่างน้อย 1 ช่องใน Flex");
        }
        payload.messageType = "flex";
        payload.altText = (altText || "ประชาสัมพันธ์").trim();
        payload.flexData = {
          title: title || "หัวข้อ",
          "การปฏิบัติงาน": action,
          "การให้น้ำ": water,
          "การให้ปุ๋ย": fertilizer,
          "โรค": disease,
          "แมลง": insect,
        };
        payload.message = "";
      }

      await onSave(payload);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">แก้ไขการส่งข้อความ</DialogTitle>
        </DialogHeader>

        {!item ? (
          <div className="text-sm text-gray-500">กำลังโหลด...</div>
        ) : (
          <div className="flex flex-col h-full"> {/* [ADDED: โครงหลักของ fullscreen] */}
            <ScrollArea className="flex-1 pr-2"> {/* [ADDED: เนื้อหาเลื่อน-ได้] */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ซ้าย: เนื้อหา */}
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <h3 className="text-base font-semibold">เนื้อหา</h3>
                    <div className="space-y-2">
                      <Label className="text-sm">รูปแบบข้อความ</Label>
                      <Select value={messageType} onValueChange={setMessageType}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">ข้อความทั่วไป (Text)</SelectItem>
                          <SelectItem value="flex">Flex Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {messageType === "text" ? (
                      <div className="space-y-2">
                        <Label className="text-sm">ข้อความ</Label>
                        <Textarea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} rows={12} />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm">ข้อความสำรอง (altText)</Label>
                          <Input value={altText} onChange={(e) => setAltText(e.target.value)} className="h-10" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="ระยะ (หัวข้อ)" value={distance} onChange={setDistance} />
                          <Field label="การปฏิบัติงาน" value={action} onChange={setAction} />
                          <Field label="การให้น้ำ" value={water} onChange={setWater} />
                          <Field label="การให้ปุ๋ย" value={fertilizer} onChange={setFertilizer} />
                          <Field label="โรค" value={disease} onChange={setDisease} />
                          <Field label="แมลง" value={insect} onChange={setInsect} />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* ขวา: Target + Schedule */}
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <h3 className="text-base font-semibold">กลุ่มเป้าหมาย & เวลา</h3>

                    <div className="space-y-2">
                      <Label className="text-sm">วิธีการส่ง</Label>
                      <Select value={targetType} onValueChange={setTargetType}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">ส่งหาทั้งหมด</SelectItem>
                          <SelectItem value="group">ส่งตามกลุ่ม (regType)</SelectItem>
                          <SelectItem value="individual">ส่งเฉพาะบุคคล (regLineID)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {targetType === "group" && (
                      <div className="space-y-2">
                        <Label className="text-sm">regType</Label>
                        <Input value={regType} onChange={(e) => setRegType(e.target.value)} className="h-10" />
                      </div>
                    )}

                    {targetType === "individual" && (
                      <div className="space-y-2">
                        <Label className="text-sm">regLineID (คั่นด้วย ,)</Label>
                        <Input value={targetIds} onChange={(e) => setTargetIds(e.target.value)} className="h-10" />
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm">เลือกวัน</Label>
                        <div className="mt-2 rounded-lg border overflow-hidden">
                          <CalendarClient selected={sendDate} onSelect={setSendDate} />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm">เลือกเวลา</Label>
                        <Input className="mt-2 h-10" type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            {/* Footer */}
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="h-10">ยกเลิก</Button></DialogClose>
              <Button onClick={submit} disabled={saving} className="h-10">{saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
