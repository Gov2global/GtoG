"use client";

import React, { useState, useEffect, useMemo, useRef } from "react"; // [CHANGED: เพิ่ม useRef]
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import Field from "./Field";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty,
} from "@/components/ui/command";

const CalendarClient = dynamic(() => import("./CalendarClient"), { ssr: false });

// [ADDED] helper โหลด JSON + ตรวจ content-type
async function fetchJSON(url, init) { // [ADDED: ใช้ซ้ำ]
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, ...init }); // [ADDED]
  const ct = res.headers.get("content-type") || ""; // [ADDED]
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[fetchJSON] Fail:", url, res.status, res.statusText, text.slice(0,200)); // [ADDED]
    throw new Error(`API ${url} ${res.status} ${res.statusText}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    console.error("[fetchJSON] Non-JSON:", url, ct, text.slice(0,200)); // [ADDED]
    throw new Error(`API ${url} returned non-JSON (${ct || "unknown"})`);
  }
  return res.json(); // [ADDED]
}

// [ADDED] dedupe เข้มขึ้น (normalize/trim + ใช้ Map)
function dedupeByValueStrict(list) { // [ADDED]
  const seen = new Map();
  for (const item of list || []) {
    const v = String(item?.value ?? "").trim();
    if (!v) continue;
    if (!seen.has(v)) seen.set(v, { label: String(item?.label ?? "").trim() || "(ไม่ระบุชื่อ)", value: v });
  }
  return Array.from(seen.values());
}

function SingleMultiSelect({
  regOptions = [],
  provOptions = [],
  selectedRegTypes = [],
  setSelectedRegTypes,
  selectedProvinces = [],
  setSelectedProvinces,
}) {
  const [tab, setTab] = useState("reg");
  const [q, setQ] = useState("");

  const activeOptions = useMemo(() => {
    const list = tab === "reg" ? regOptions : provOptions;
    const term = q.trim().toLowerCase();
    return term ? list.filter((o) => String(o).toLowerCase().includes(term)) : list;
  }, [tab, q, regOptions, provOptions]);

  const isChecked = (val) => (tab === "reg" ? selectedRegTypes.includes(val) : selectedProvinces.includes(val));
  const toggle = (val) => {
    if (tab === "reg") {
      setSelectedRegTypes((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
    } else {
      setSelectedProvinces((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
    }
  };

  const clearAll = () => { if (tab === "reg") setSelectedRegTypes([]); else setSelectedProvinces([]); };
  const selectAll = () => { if (tab === "reg") setSelectedRegTypes(activeOptions); else setSelectedProvinces(activeOptions); };

  return (
    <div className="space-y-2">
      <Label className="text-sm">กลุ่มเป้าหมาย (ช่องเดียว)</Label>
      <Card className="border-dashed">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">เลือกกลุ่มเป้าหมาย</p>
              <p className="text-xs text-muted-foreground">
                ประเภทผู้ใช้ {selectedRegTypes.length} • จังหวัด {selectedProvinces.length}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>ล้าง</Button> {/* [ADDED: ปุ่มล้าง] */}
              <Button variant="secondary" size="sm" onClick={selectAll}>เลือกทั้งหมด</Button> {/* [ADDED] */}
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="reg">ประเภทผู้ใช้</TabsTrigger>
                <TabsTrigger value="prov">จังหวัด</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`ค้นหา${tab === "reg" ? "ประเภทผู้ใช้" : "จังหวัด"}`} className="h-9" />
                <Button variant="outline" size="sm" onClick={() => setQ("")}>ล้างค้นหา</Button>
              </div>
            </div>

            <TabsContent value="reg" className="mt-3">
              <ScrollArea className="h-72 rounded-md border">
                <div className="p-3 grid grid-cols-1 gap-2">
                  {activeOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่พบประเภทผู้ใช้</p>
                  ) : (
                    activeOptions.map((opt, idx) => ( // [CHANGED: ใช้ idx ปลอดภัย]
                      <label
                        key={`reg-${idx}`} // [CHANGED: กัน key ซ้ำ]
                        htmlFor={`reg-${idx}`} // [CHANGED]
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          id={`reg-${idx}`} // [CHANGED]
                          checked={isChecked(opt)}
                          onCheckedChange={(checked) => { if (checked === true) toggle(opt); if (checked === false) toggle(opt); }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="prov" className="mt-3">
              <ScrollArea className="h-72 rounded-md border">
                <div className="p-3 grid grid-cols-1 gap-2">
                  {activeOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">ไม่พบจังหวัด</p>
                  ) : (
                    activeOptions.map((opt, idx) => ( // [CHANGED]
                      <label
                        key={`prov-${idx}`} // [CHANGED]
                        htmlFor={`prov-${idx}`} // [CHANGED]
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          id={`prov-${idx}`} // [CHANGED]
                          checked={isChecked(opt)}
                          onCheckedChange={(checked) => { if (checked === true) toggle(opt); if (checked === false) toggle(opt); }}
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateBroadcastDialog({ open, onOpenChange, onCreated }) {
  const [messageType, setMessageType] = useState("text");
  const [textMessage, setTextMessage] = useState("");
  const [altText, setAltText] = useState("ประชาสัมพันธ์");
  const [distance, setDistance] = useState("");
  const [action, setAction] = useState("");
  const [water, setWater] = useState("");
  const [fertilizer, setFertilizer] = useState("");
  const [disease, setDisease] = useState("");
  const [insect, setInsect] = useState("");

  const [targetType, setTargetType] = useState("individual");
  const [targetIdsText, setTargetIdsText] = useState(""); // [CHANGED: เก็บพิมพ์เอง]
  const parsedIds = useMemo(() => targetIdsText.split(/[\s,]+/).map(s=>s.trim()).filter(Boolean), [targetIdsText]); // [ADDED]

  const [userOptions, setUserOptions] = useState([]); // [{label, value}] — value = regLineID
  const [selectedUsers, setSelectedUsers] = useState([]); // [regLineID]
  const cmdInputRef = useRef(null); // [ADDED]

  const [selectedRegTypes, setSelectedRegTypes] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [optionsRegType, setOptionsRegType] = useState([]);
  const [optionsProvince, setOptionsProvince] = useState([]);

  const [sendDate, setSendDate] = useState(new Date());
  const [sendTime, setSendTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true); // [ADDED]
  const [error, setError] = useState(""); // [ADDED]

  // [ADDED] รวม id ทั้งหมดที่ “จะส่งจริง”
  const combinedIds = useMemo(() => { // [ADDED]
    return Array.from(new Set([...selectedUsers, ...parsedIds]));
  }, [selectedUsers, parsedIds]);

  useEffect(() => {
    if (!open) {
      setMessageType("text"); setTextMessage(""); setAltText("ประชาสัมพันธ์");
      setDistance(""); setAction(""); setWater(""); setFertilizer(""); setDisease(""); setInsect("");
      setTargetType("individual"); setTargetIdsText(""); setSelectedUsers([]);
      setSelectedRegTypes([]); setSelectedProvinces([]); setSendDate(new Date()); setSendTime("08:00");
      setError("");
    }
  }, [open]);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true); setError("");
        const [meta, lineid] = await Promise.all([
          fetchJSON("/api/admin/broadcast-get/register"),
          fetchJSON("/api/admin/broadcast-get/lineid"),
        ]);
        const uniqueUsers = dedupeByValueStrict(lineid.users || []); // [ADDED]
        setOptionsRegType(Array.from(new Set((meta.regTypes || []).map(v => String(v)))));
        setOptionsProvince(Array.from(new Set((meta.provinces || []).map(v => String(v)))));
        setUserOptions(uniqueUsers);
      } catch (err) {
        console.error("loadOptions error:", err);
        setError(err?.message || "โหลดตัวเลือกไม่สำเร็จ");
        setOptionsRegType([]); setOptionsProvince([]); setUserOptions([]);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const [hStr, mStr] = sendTime.split(":");
      const sendAt = new Date(sendDate);
      sendAt.setHours(Number(hStr), Number(mStr), 0, 0);

      const payload = { targetType, sendAt: sendAt.toISOString() };

      if (messageType === "text") {
        const msg = textMessage.trim();
        if (!msg) throw new Error("กรุณากรอกข้อความทั่วไป");
        payload.messageType = "text";
        payload.message = msg;
      } else {
        const title = distance.trim();
        if (!title && !action && !water && !fertilizer && !disease && !insect)
          throw new Error("กรุณากรอกข้อมูล Flex อย่างน้อย 1 ช่อง");
        payload.messageType = "flex";
        payload.altText = altText.trim();
        payload.flexData = {
          title: title || "หัวข้อ",
          "การปฏิบัติงาน": action,
          "การให้น้ำ": water,
          "การให้ปุ๋ย": fertilizer,
          "โรค": disease,
          "แมลง": insect,
        };
      }

      if (targetType === "individual") {
        if (!combinedIds.length) throw new Error("กรุณาเลือก/กรอกผู้รับอย่างน้อย 1 รายการ"); // [CHANGED: ตรวจจาก combinedIds]
        payload.targetIds = combinedIds; // [CHANGED: ส่ง id ที่รวมแล้ว]
      } else if (targetType === "group") {
        if (!selectedRegTypes.length || !selectedProvinces.length)
          throw new Error("กรุณาเลือก regType และ จังหวัดให้ครบ");
        payload.targetGroup = { regType: selectedRegTypes, province: selectedProvinces };
      }

      const res = await fetch("/api/admin/broadcast", {
        method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "ส่งข้อมูลไม่สำเร็จ");

      onCreated?.(); onOpenChange(false);
    } catch (e) {
      alert("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const displayDate = (() => { try { return format(sendDate, "yyyy-MM-dd"); } catch { return "-"; } })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:w-[70vw] lg:w-[50vw] max-w-none max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">เพิ่มข้อความแจ้งเตือน</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="mb-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            กำลังโหลดตัวเลือก...
          </div>
        )}
        {!!error && (
          <div className="mb-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            โหลดข้อมูลล้มเหลว: {error}
          </div>
        )}

        <Card className="overflow-y-auto max-h-[70vh]">
          <CardContent className="space-y-6 py-6">
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

            {messageType === "text" ? (
              <div className="space-y-2">
                <Label className="text-sm">ข้อความ</Label>
                <Textarea value={textMessage} onChange={(e) => setTextMessage(e.target.value)} rows={4} placeholder="พิมพ์ข้อความที่ต้องการส่ง เช่น สวัสดีครับ/ค่ะ" />
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

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">วิธีการส่ง</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">ส่งเฉพาะบุคคล</SelectItem>
                  <SelectItem value="group">ส่งตามกลุ่ม</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ===== รายบุคคล ===== */}
            {targetType === "individual" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">เลือกผู้รับ (ชื่อ‑นามสกุล) — ค่าจริงใช้ regLineID</Label>
                  <Command className="border rounded-md">
                    <CommandInput
                      ref={cmdInputRef}
                      placeholder="พิมพ์ค้นหาชื่อหรือ regLineID… แล้วกด Enter/คลิก เพื่อเพิ่ม" // [CHANGED: อธิบายค้นหา id ได้]
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading ? "กำลังโหลด..." : "ไม่พบผลลัพธ์ (ตรวจว่า API /lineid คืน users หรือไม่)"}
                      </CommandEmpty>
                      <CommandGroup heading={`รายชื่อทั้งหมด (${userOptions.length})`}>
                        {userOptions.map((u, idx) => (
                          <CommandItem
                            key={`user-${idx}`} // [CHANGED: key ปลอดภัย]
                            value={`${u.label} ${u.value}`} // [ADDED: ให้ค้นหาได้ทั้งชื่อและ id]
                            onSelect={() => {
                              setSelectedUsers((prev) => (prev.includes(u.value) ? prev : [...prev, u.value]));
                              setTimeout(() => cmdInputRef.current?.focus(), 0);
                            }}
                          >
                            {u.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>

                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((id, idx) => {
                      const user = userOptions.find((u) => u.value === id);
                      return (
                        <Badge key={`chip-${idx}`} title={`regLineID: ${id}`} variant="secondary" className="gap-1"> {/* [ADDED: tooltip แสดง id] */}
                          {user?.label || id}
                          <button
                            type="button"
                            className="inline-flex size-5 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none" // [CHANGED: แก้ class สะกดผิด]
                            aria-label={`ลบ ${user?.label || id}`}
                            onClick={() => setSelectedUsers((prev) => prev.filter((x) => x !== id))}
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Preview regLineID ที่จะถูกส่งจริง */}
                <div className="space-y-1" hidden> {/* [ADDED] */}
                  <Label className="text-sm">หรือวาง regLineID หลายรายการ (คั่นด้วย , หรือเว้นบรรทัด)</Label>
                  <Textarea
                    value={targetIdsText}
                    onChange={(e) => setTargetIdsText(e.target.value)}
                    rows={3}
                    placeholder="เช่น U123, U456 หรือพิมพ์ทีละบรรทัด"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>พิมพ์ได้: {parsedIds.length} รายการ</span>
                    <Button size="sm" variant="ghost" onClick={() => setTargetIdsText("")}>ล้างทั้งหมด</Button>
                  </div>
                </div>

                {/* [ADDED] กล่อง Preview id ที่จะส่งจริง */}
                <div className="space-y-1" hidden> {/* [ADDED] */}
                  <Label className="text-sm">regLineID ที่จะส่งจริง (รวมจากรายชื่อที่เลือก + พิมพ์เอง)</Label> {/* [ADDED] */}
                  <Textarea
                    value={combinedIds.join(", ")}
                    readOnly
                    rows={3}
                    className="bg-muted focus-visible:ring-0"
                  /> {/* [ADDED] */}
                  <div className="flex items-center justify-between text-xs">
                    <span>รวมทั้งหมด: <b>{combinedIds.length}</b> รายการ</span> {/* [ADDED] */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard?.writeText(combinedIds.join(", ")).catch(()=>{})}
                    >
                      คัดลอกทั้งหมด
                    </Button> {/* [ADDED] */}
                  </div>
                </div>
              </div>
            )}

            {/* ===== กลุ่ม ===== */}
            {targetType === "group" && (
              <SingleMultiSelect
                regOptions={optionsRegType}
                provOptions={optionsProvince}
                selectedRegTypes={selectedRegTypes}
                setSelectedRegTypes={setSelectedRegTypes}
                selectedProvinces={selectedProvinces}
                setSelectedProvinces={setSelectedProvinces}
              />
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm">เลือกวัน</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <CalendarClient selected={sendDate} onSelect={setSendDate} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">เลือกเวลา</Label>
              <Input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} className="h-10 mt-2" />
              <p className="text-xs mt-1 text-gray-500">จะส่งเมื่อ: {displayDate} เวลา {sendTime}</p>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="mt-6">
          <DialogClose asChild><Button variant="outline">ยกเลิก</Button></DialogClose>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกการแจ้งเตือน"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}