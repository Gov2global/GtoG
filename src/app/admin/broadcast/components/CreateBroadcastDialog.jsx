// components/CreateBroadcastDialog.jsx
"use client"; // [UNCHANGED: บังคับ client component]

import React, { useState, useEffect, useMemo, useRef } from "react"; // [UNCHANGED]
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog"; // [UNCHANGED]
import { Label } from "@/components/ui/label"; // [UNCHANGED]
import { Input } from "@/components/ui/input"; // [UNCHANGED]
import { Textarea } from "@/components/ui/textarea"; // [UNCHANGED]
import { Button } from "@/components/ui/button"; // [UNCHANGED]
import { Card, CardContent } from "@/components/ui/card"; // [UNCHANGED]
import { Separator } from "@/components/ui/separator"; // [UNCHANGED]
import { Badge } from "@/components/ui/badge"; // [UNCHANGED]
import { ScrollArea } from "@/components/ui/scroll-area"; // [UNCHANGED]
import { Checkbox } from "@/components/ui/checkbox"; // [UNCHANGED]
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // [UNCHANGED]
import dynamic from "next/dynamic"; // [UNCHANGED]
import { format } from "date-fns"; // [UNCHANGED]
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"; // [UNCHANGED]
import {
  Command, CommandInput, CommandList, CommandGroup, CommandItem, CommandEmpty,
} from "@/components/ui/command"; // [UNCHANGED]
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover"; // [UNCHANGED]
import { Smile } from "lucide-react"; // [UNCHANGED]

const CalendarClient = dynamic(() => import("./CalendarClient"), { ssr: false }); // [UNCHANGED]

/* ========================= EMOJI UTILS ========================= */
const EMOJI_SET = [ // [UNCHANGED]
  "😀","😁","😂","🤣","😊","😍","🥰","😘","😎","🤩",
  "👍","👏","🙏","🔥","🎉","💯","✅","❗","⭐","🌟",
  "🌈","☀️","☂️","🍀","🍎","🍔","🚀","🛒","📌","📞","📍","📣"
];

function EmojiPickerPopover({ onPick }) { // [UNCHANGED]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="เพิ่มอิโมจิ" aria-label="เพิ่มอิโมจิ">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-7 gap-1">
          {EMOJI_SET.map((e, i) => (
            <button
              key={i}
              type="button"
              className="text-xl hover:scale-110 transition"
              onClick={() => onPick?.(e)}
              aria-label={`เลือกอิโมจิ ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function insertAtCursor(ref, value, setValue, emoji) { // [UNCHANGED]
  const el = ref?.current;
  if (!el) {
    setValue((v) => (v ?? "") + emoji);
    return;
  }
  try {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = value.slice(0, start);
    const after = value.slice(0 + end);
    const next = `${before}${emoji}${value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  } catch {
    setValue((v) => (v ?? "") + emoji);
  }
}

function WithEmoji({ children, onPick }) { // [UNCHANGED]
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">{children}</div>
      <EmojiPickerPopover onPick={onPick} />
    </div>
  );
}

/* ========================= HELPERS ========================= */
async function fetchJSON(url, init) { // [UNCHANGED]
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" }, ...init });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[fetchJSON] Fail:", url, res.status, res.statusText, text.slice(0, 200));
    throw new Error(`API ${url} ${res.status} ${res.statusText}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    console.error("[fetchJSON] Non-JSON:", url, ct, text.slice(0, 200));
    throw new Error(`API ${url} returned non-JSON (${ct || "unknown"})`);
  }
  return res.json();
}

function dedupeByValueStrict(list) { // [UNCHANGED]
  const seen = new Map();
  for (const item of list || []) {
    const v = String(item?.value ?? "").trim();
    if (!v) continue;
    if (!seen.has(v)) seen.set(v, { label: String(item?.label ?? "").trim() || "(ไม่ระบุชื่อ)", value: v });
  }
  return Array.from(seen.values());
}

// [ADDED] ทำความสะอาดชื่อไฟล์ฝั่ง client (กันช่องว่าง/อักขระพิเศษ)
function sanitizeFilename(name = "") { // [ADDED]
  return String(name).trim().replace(/[^a-zA-Z0-9._-]/g, "_"); // [ADDED]
}

/* ========================= S3 UPLOAD ========================= */
async function uploadToS3(file) {
  if (!file) throw new Error("ไม่พบไฟล์รูปภาพ");
  if (!["image/jpeg","image/png","image/jpg","image/webp"].includes(file.type)) {
    throw new Error("รองรับเฉพาะ .jpg .jpeg .png .webp เท่านั้น");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("ขนาดไฟล์ต้องไม่เกิน 2MB");
  }

  // ขอ signed URL
  const res = await fetch("/api/aws/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type || "" }),
  });
  if (!res.ok) throw new Error("ไม่สามารถสร้าง Signed URL ได้");
  const { signedUrl, publicUrl } = await res.json();

  // PUT: อย่าใส่ x-amz-acl; ใส่ Content-Type เฉพาะเมื่อมีจริง
  const init = { method: "PUT", body: file };
  if (file.type) init.headers = { "Content-Type": file.type };

  const put = await fetch(signedUrl, init);
  if (!put.ok) {
    const txt = await put.text().catch(()=> "");
    throw new Error("อัปโหลดไป S3 ไม่สำเร็จ: " + txt.slice(0,400));
  }

  return publicUrl;
}

/* ========================= UI: MULTI SELECT ========================= */
function SingleMultiSelect({ // [UNCHANGED]
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
              <Button variant="ghost" size="sm" onClick={clearAll}>ล้าง</Button>
              <Button variant="secondary" size="sm" onClick={selectAll}>เลือกทั้งหมด</Button>
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
                    activeOptions.map((opt, idx) => (
                      <label
                        key={`reg-${idx}`}
                        htmlFor={`reg-${idx}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          id={`reg-${idx}`}
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
                    activeOptions.map((opt, idx) => (
                      <label
                        key={`prov-${idx}`}
                        htmlFor={`prov-${idx}`}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          id={`prov-${idx}`}
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

/* ========================= MAIN DIALOG ========================= */
export default function CreateBroadcastDialog({ open, onOpenChange, onCreated }) { // [UNCHANGED]
  const [messageType, setMessageType] = useState("text"); // [UNCHANGED]
  const [textMessage, setTextMessage] = useState(""); // [UNCHANGED]
  const [altText, setAltText] = useState("ประชาสัมพันธ์"); // [UNCHANGED]
  const [distance, setDistance] = useState(""); // [UNCHANGED]
  const [action, setAction] = useState(""); // [UNCHANGED]
  const [water, setWater] = useState(""); // [UNCHANGED]
  const [fertilizer, setFertilizer] = useState(""); // [UNCHANGED]
  const [disease, setDisease] = useState(""); // [UNCHANGED]
  const [insect, setInsect] = useState(""); // [UNCHANGED]

  // ----- Image state -----
  const [imageFile, setImageFile] = useState(null); // [ADDED]
  const [imagePreview, setImagePreview] = useState(""); // [ADDED]
  const [imageUrl, setImageUrl] = useState(""); // [ADDED]

  const [targetType, setTargetType] = useState("individual"); // [UNCHANGED]
  const [targetIdsText, setTargetIdsText] = useState(""); // [UNCHANGED]
  const parsedIds = useMemo(() => targetIdsText.split(/[\s,]+/).map(s => s.trim()).filter(Boolean), [targetIdsText]); // [UNCHANGED]

  const [userOptions, setUserOptions] = useState([]); // [UNCHANGED]
  const [selectedUsers, setSelectedUsers] = useState([]); // [UNCHANGED]
  const cmdInputRef = useRef(null); // [UNCHANGED]

  const [selectedRegTypes, setSelectedRegTypes] = useState([]); // [UNCHANGED]
  const [selectedProvinces, setSelectedProvinces] = useState([]); // [UNCHANGED]
  const [optionsRegType, setOptionsRegType] = useState([]); // [UNCHANGED]
  const [optionsProvince, setOptionsProvince] = useState([]); // [UNCHANGED]

  const [sendDate, setSendDate] = useState(new Date()); // [UNCHANGED]
  const [sendTime, setSendTime] = useState("08:00"); // [UNCHANGED]
  const [saving, setSaving] = useState(false); // [UNCHANGED]

  const [loading, setLoading] = useState(true); // [UNCHANGED]
  const [error, setError] = useState(""); // [UNCHANGED]

  const textMessageRef = useRef(null); // [UNCHANGED]
  const altTextRef = useRef(null); // [UNCHANGED]

  const combinedIds = useMemo(() => Array.from(new Set([...selectedUsers, ...parsedIds])), [selectedUsers, parsedIds]); // [UNCHANGED]

  useEffect(() => { // [UNCHANGED]
    if (!open) {
      setMessageType("text"); setTextMessage(""); setAltText("ประชาสัมพันธ์");
      setDistance(""); setAction(""); setWater(""); setFertilizer(""); setDisease(""); setInsect("");
      setImageFile(null); setImagePreview(""); setImageUrl(""); // [ADDED: reset image states]
      setTargetType("individual"); setTargetIdsText(""); setSelectedUsers([]);
      setSelectedRegTypes([]); setSelectedProvinces([]); setSendDate(new Date()); setSendTime("08:00");
      setError("");
    }
  }, [open]);

  useEffect(() => { // [UNCHANGED]
    let aborted = false;
    async function loadOptions() {
      try {
        setLoading(true); setError("");
        const [meta, lineid] = await Promise.all([
          fetchJSON("/api/admin/broadcast-get/register"),
          fetchJSON("/api/admin/broadcast-get/lineid"),
        ]);
        if (aborted) return;
        const uniqueUsers = dedupeByValueStrict(lineid.users || []);
        setOptionsRegType(Array.from(new Set((meta.regTypes || []).map(v => String(v)))));
        setOptionsProvince(Array.from(new Set((meta.provinces || []).map(v => String(v)))));
        setUserOptions(uniqueUsers);
      } catch (err) {
        if (aborted) return;
        console.error("loadOptions error:", err);
        setError(err?.message || "โหลดตัวเลือกไม่สำเร็จ");
        setOptionsRegType([]); setOptionsProvince([]); setUserOptions([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }
    loadOptions();
    return () => { aborted = true; };
  }, []);

  const handleUploadImage = async (file) => { // [ADDED]
    try {
      setSaving(true); // [ADDED]
      const url = await uploadToS3(file); // [ADDED]
      setImageUrl(url); // [ADDED]
    } catch (e) {
      alert("อัปโหลดรูปไม่สำเร็จ: " + (e?.message || "ไม่ทราบสาเหตุ")); // [ADDED]
    } finally {
      setSaving(false); // [ADDED]
    }
  };

  const handleSubmit = async () => { // [CHANGED: รองรับ messageType image]
    if (saving) return; // [UNCHANGED]
    try {
      setSaving(true); // [UNCHANGED]
      const [hStr, mStr] = (sendTime || "08:00").split(":"); // [UNCHANGED]
      const sendAt = new Date(sendDate); // [UNCHANGED]
      sendAt.setHours(Number(hStr), Number(mStr), 0, 0); // [UNCHANGED]

      const payload = { targetType, sendAt: sendAt.toISOString() }; // [UNCHANGED]

      if (messageType === "text") { // [UNCHANGED]
        const msg = textMessage.trim();
        if (!msg) throw new Error("กรุณากรอกข้อความทั่วไป");
        payload.messageType = "text";
        payload.message = msg;
      } else if (messageType === "flex") { // [UNCHANGED]
        const title = distance.trim();
        if (!title && !action && !water && !fertilizer && !disease && !insect)
          throw new Error("กรุณากรอกข้อมูล Flex อย่างน้อย 1 ช่อง");
        const alt = altText.trim();
        if (!alt) throw new Error("กรุณากรอก altText สำหรับ Flex");
        payload.messageType = "flex";
        payload.altText = alt;
        payload.flexData = {
          title: title || "หัวข้อ",
          "การปฏิบัติงาน": action,
          "การให้น้ำ": water,
          "การให้ปุ๋ย": fertilizer,
          "โรค": disease,
          "แมลง": insect,
        };
      } else if (messageType === "image") { // [ADDED]
        if (!imageUrl) throw new Error("กรุณาอัปโหลดรูปภาพให้สำเร็จ");
        payload.messageType = "image"; // [ADDED]
        payload.media = { // [ADDED]
          originalContentUrl: imageUrl,
          previewImageUrl: imageUrl,
          contentType: imageFile?.type || "image/jpeg",
          sizeBytes: imageFile?.size || 0,
        };
      }

      if (targetType === "individual") { // [UNCHANGED]
        if (!combinedIds.length) throw new Error("กรุณาเลือก/กรอกผู้รับอย่างน้อย 1 รายการ");
        payload.targetIds = combinedIds;
      } else if (targetType === "group") { // [UNCHANGED]
        if (!selectedRegTypes.length || !selectedProvinces.length)
          throw new Error("กรุณาเลือก regType และ จังหวัดให้ครบ");
        payload.targetGroup = { regType: selectedRegTypes, province: selectedProvinces };
      }

      const res = await fetch("/api/admin/broadcast", { // [UNCHANGED]
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "ส่งข้อมูลไม่สำเร็จ");

      onCreated?.(); onOpenChange(false); // [UNCHANGED]
    } catch (e) {
      alert("❌ " + (e?.message || "ไม่สามารถบันทึกได้")); // [UNCHANGED]
    } finally {
      setSaving(false); // [UNCHANGED]
    }
  };

  const displayDate = (() => { try { return format(sendDate, "yyyy-MM-dd"); } catch { return "-"; } })(); // [UNCHANGED]

  const onKeyDownGlobal = (e) => { // [UNCHANGED]
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}> {/* [UNCHANGED] */}
      <DialogContent className="w-full md:w-[70vw] lg:w-[50vw] max-w-none max-h-[85vh] overflow-y-auto" onKeyDown={onKeyDownGlobal}> {/* [UNCHANGED] */}
        <DialogHeader> {/* [UNCHANGED] */}
          <DialogTitle className="text-xl font-semibold">เพิ่มข้อความแจ้งเตือน</DialogTitle> {/* [UNCHANGED] */}
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

        <Card className="overflow-y-auto max-h-[70vh]"> {/* [UNCHANGED] */}
          <CardContent className="space-y-6 py-6"> {/* [UNCHANGED] */}
            <div className="space-y-2"> {/* [UNCHANGED] */}
              <Label className="text-sm">รูปแบบข้อความ</Label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger className="h-10"><SelectValue placeholder="เลือกรูปแบบข้อความ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">ข้อความทั่วไป (Text)</SelectItem>
                  <SelectItem value="flex">Flex Message</SelectItem>
                  <SelectItem value="image">รูปภาพ (Image)</SelectItem> {/* [ADDED] */}
                </SelectContent>
              </Select>
            </div>

            {messageType === "text" ? ( // [UNCHANGED]
              <div className="space-y-2">
                <Label className="text-sm">ข้อความ</Label>
                <WithEmoji onPick={(emoji) => insertAtCursor(textMessageRef, textMessage, setTextMessage, emoji)}>
                  <Textarea
                    ref={textMessageRef}
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    rows={4}
                    placeholder="พิมพ์ข้อความที่ต้องการส่ง เช่น สวัสดีครับ/ค่ะ"
                  />
                </WithEmoji>
              </div>
            ) : messageType === "flex" ? ( // [UNCHANGED]
              <>
                <div className="space-y-2">
                  <Label className="text-sm">ข้อความสำรอง (altText)</Label>
                  <WithEmoji onPick={(emoji) => insertAtCursor(altTextRef, altText, setAltText, emoji)}>
                    <Input
                      ref={altTextRef}
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="h-10"
                      placeholder="เช่น 📣 โปรโมชันใหม่!"
                    />
                  </WithEmoji>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">ระยะ (หัวข้อ)</Label>
                    <Input value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="เช่น ระยะเก็บเกี่ยว" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">การปฏิบัติงาน</Label>
                    <Textarea value={action} onChange={(e) => setAction(e.target.value)} placeholder="งานที่ควรทำ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">การให้น้ำ</Label>
                    <Textarea value={water} onChange={(e) => setWater(e.target.value)} placeholder="แนวทางให้น้ำ" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">การให้ปุ๋ย</Label>
                    <Textarea value={fertilizer} onChange={(e) => setFertilizer(e.target.value)} placeholder="สูตร/อัตรา" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">โรค</Label>
                    <Textarea value={disease} onChange={(e) => setDisease(e.target.value)} placeholder="โรคที่ต้องเฝ้าระวัง" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">แมลง</Label>
                    <Textarea value={insect} onChange={(e) => setInsect(e.target.value)} placeholder="ศัตรูพืช/วิธีรับมือ" />
                  </div>
                </div>
              </>
            ) : (
              /* ============ IMAGE MODE ============ */ // [ADDED]
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm">แนบรูปภาพ (สูงสุด 2MB) — เก็บลง S3: broadcast-img/</Label> {/* [ADDED] */}
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null; // [ADDED]
                      setImageFile(f); // [ADDED]
                      setImagePreview(f ? URL.createObjectURL(f) : ""); // [ADDED]
                      setImageUrl(""); // [ADDED: reset URL เดิม]
                    }}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="max-h-56 rounded border" />
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => imageFile ? handleUploadImage(imageFile) : alert("กรุณาเลือกไฟล์ก่อน")}
                      disabled={saving}
                    >
                      {saving ? "กำลังอัปโหลด..." : "อัปโหลดขึ้น S3"}
                    </Button>
                    {imageUrl && (
                      <Badge variant="outline" title={imageUrl}>
                        อัปโหลดสำเร็จ
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="หรือวาง URL รูปที่โฮสต์ไว้แล้ว"
                    className="h-10"
                  />
                </div>
              </div>
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
                  <Label className="text-sm">เลือกผู้รับ (ชื่อ-นามสกุล) — ค่าจริงใช้ regLineID</Label>
                  <Command className="border rounded-md">
                    <CommandInput
                      ref={cmdInputRef}
                      placeholder="พิมพ์ค้นหาชื่อหรือ regLineID… แล้วกด Enter/คลิก เพื่อเพิ่ม"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {loading ? "กำลังโหลด..." : "ไม่พบผลลัพธ์ (ตรวจว่า API /lineid คืน users หรือไม่)"}
                      </CommandEmpty>
                      <CommandGroup heading={`รายชื่อทั้งหมด (${userOptions.length})`}>
                        {userOptions.map((u, idx) => (
                          <CommandItem
                            key={`user-${idx}`}
                            value={`${u.label} ${u.value}`}
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
                        <Badge key={`chip-${idx}`} title={`regLineID: ${id}`} variant="secondary" className="gap-1">
                          {user?.label || id}
                          <button
                            type="button"
                            className="inline-flex size-5 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
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
