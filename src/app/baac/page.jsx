"use client";
import React, { useMemo, useState } from "react";

/* ===== Utils ===== */
function isValidThaiId(id) {
  const digits = String(id).replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(digits[12]);
}
function toNumber(val) {
  if (val === "" || val === null || val === undefined) return NaN;
  const num = Number(String(val).replace(/,/g, "").trim());
  return Number.isNaN(num) ? NaN : num;
}
function formatNumber(val) {
  const n = toNumber(val);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("en-US");
}

/* ===== Constants ===== */
const LOAN_PURPOSES = [
  "ต้นทุนการผลิต",
  "ซื้อปุ๋ย/สารปรับปรุงดิน",
  "ซื้อเมล็ดพันธุ์/พันธุ์พืช",
  "ระบบน้ำ/สปริงเคิล/น้ำหยด",
  "เครื่องมือ/เครื่องจักร",
  "ขยายพื้นที่เพาะปลูก",
  "หมุนเวียนชำระหนี้",
  "อื่นๆ",
];
const MAIN_CROPS = [
  "ข้าว",
  "ข้าวโพด",
  "มันสำปะหลัง",
  "อ้อย",
  "ยางพารา",
  "ปาล์มน้ำมัน",
  "ทุเรียน",
  "ลำไย",
  "ส้มเขียวหวาน",
  "ส้มโอ",
  "กล้วย",
  "พืชผัก",
  "ไม้ผลอื่นๆ",
];

/* ===== Field wrapper (โทน/สไตล์ตามตัวอย่าง) ===== */
function Field({ label, required, children, hint, error }) {
  return (
    <div className="space-y-1">
      <label className="block text-[15px] text-neutral-800">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ===== Main Page ===== */
export default function BaacPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    citizenId: "",
    dob: "",
    phone: "",
    address: "",
    province: "",
    amphur: "",
    tambon: "",
    postcode: "",
    mainCrop: "",
    otherCrops: "",
    areaRai: "",
    plotLocation: "",
    landDoc: "",
    landDocFiles: null,
    otherDocs: null,
    yearsPlanting: "",
    incomePerYear: "",
    loanPurposes: [],
    loanPurposeOther: "",
    loanAmount: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ===== Styles ให้เหมือนตัวอย่างด้านบน ===== */
  const inputBase =
    "w-full rounded-[14px] border border-emerald-200/80 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";
  const selectBase =
    "appearance-none w-full rounded-[14px] border border-emerald-300 bg-white px-4 py-3 text-[15px] leading-6 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300";
  const chipBox =
    "flex items-center gap-3 rounded-[14px] border border-emerald-200 bg-white px-3 py-3 shadow-sm active:scale-[0.99]";

  const handleChange = (key) => (e) => {
    const value = e?.target?.files ? e.target.files : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
  };
  const handleCheckbox = (purpose) => (e) => {
    setForm((s) => {
      const set = new Set(s.loanPurposes);
      if (e.target.checked) set.add(purpose);
      else set.delete(purpose);
      return { ...s, loanPurposes: Array.from(set) };
    });
  };
  const handleAmountChange = (key) => (e) => {
    const raw = e.target.value.replace(/[^\d,]/g, "").replace(/,+/g, (m) => (m.length > 1 ? "," : m));
    setForm((s) => ({ ...s, [key]: raw }));
  };
  const onCitizenIdChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 13);
    const parts = [v.slice(0, 1), v.slice(1, 5), v.slice(5, 10), v.slice(10, 12), v.slice(12, 13)].filter(Boolean);
    setForm((s) => ({ ...s, citizenId: parts.join("-") }));
  };

  /* ===== Validate ===== */
  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "กรุณากรอกชื่อ";
    if (!form.lastName.trim()) err.lastName = "กรุณากรอกสกุล";
    const cid = form.citizenId.replace(/\D/g, "");
    if (!cid) err.citizenId = "กรุณากรอกเลขบัตรประชาชน";
    else if (!/^\d{13}$/.test(cid)) err.citizenId = "เลขบัตรประชาชนต้องมี 13 หลัก";
    else if (!isValidThaiId(cid)) err.citizenId = "เลขบัตรประชาชนไม่ถูกต้อง";

    if (!form.dob) err.dob = "กรุณาเลือกวันเกิด";

    const phone = form.phone.replace(/\D/g, "");
    if (!phone) err.phone = "กรุณากรอกเบอร์โทรศัพท์";
    else if (!/^0(6|8|9)\d{8}$/.test(phone)) err.phone = "เช่น 0812345678";

    if (!form.address.trim()) err.address = "กรุณากรอกที่อยู่";
    if (!form.province.trim()) err.province = "กรุณาระบุจังหวัด";
    if (!form.amphur.trim()) err.amphur = "กรุณาระบุอำเภอ";
    if (!form.tambon.trim()) err.tambon = "กรุณาระบุตำบล";

    const post = form.postcode.trim();
    if (!post) err.postcode = "กรุณากรอกรหัสไปรษณีย์";
    else if (!/^\d{5}$/.test(post)) err.postcode = "ต้องเป็น 5 หลัก";

    if (!form.mainCrop) err.mainCrop = "กรุณาเลือกพืชหลัก";
    const rai = toNumber(form.areaRai);
    if (Number.isNaN(rai) || rai <= 0) err.areaRai = "ใส่ตัวเลขมากกว่า 0";

    if (!form.plotLocation.trim()) err.plotLocation = "กรุณากรอกสถานที่ตั้งแปลง";
    if (!form.landDoc) err.landDoc = "กรุณาเลือกเอกสารสิทธิ์";

    const years = toNumber(form.yearsPlanting);
    if (Number.isNaN(years) || years < 0) err.yearsPlanting = "ตัวเลข >= 0";

    const income = toNumber(form.incomePerYear);
    if (Number.isNaN(income) || income < 0) err.incomePerYear = "ตัวเลข >= 0";

    if (!form.loanPurposes.length) err.loanPurposes = "เลือกอย่างน้อย 1 รายการ";
    if (form.loanPurposes.includes("อื่นๆ") && !form.loanPurposeOther.trim())
      err.loanPurposeOther = "ระบุรายละเอียด";

    const amount = toNumber(form.loanAmount);
    if (Number.isNaN(amount) || amount <= 0) err.loanAmount = "ตัวเลขมากกว่า 0";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===== Payload ===== */
  const payload = useMemo(
    () => ({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      citizenId: form.citizenId.replace(/\D/g, ""),
      dob: form.dob,
      phone: form.phone.replace(/\D/g, ""),
      address: form.address.trim(),
      province: form.province.trim(),
      amphur: form.amphur.trim(),
      tambon: form.tambon.trim(),
      postcode: form.postcode.trim(),
      mainCrop: form.mainCrop,
      otherCrops: form.otherCrops.trim(),
      areaRai: toNumber(form.areaRai),
      plotLocation: form.plotLocation.trim(),
      landDoc: form.landDoc,
      yearsPlanting: toNumber(form.yearsPlanting),
      incomePerYear: toNumber(form.incomePerYear),
      loanPurposes: form.loanPurposes,
      loanPurposeOther: form.loanPurposes.includes("อื่นๆ") ? form.loanPurposeOther.trim() : "",
      loanAmount: toNumber(form.loanAmount),
      landDocFilesCount: form.landDocFiles?.length || 0,
      otherDocsCount: form.otherDocs?.length || 0,
    }),
    [form]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, typeof v === "number" ? String(v) : v));
      if (form.landDocFiles?.length) Array.from(form.landDocFiles).forEach((f) => fd.append("landDocFiles", f, f.name));
      if (form.otherDocs?.length) Array.from(form.otherDocs).forEach((f) => fd.append("otherDocs", f, f.name));

      // const res = await fetch("/api/baac/register", { method: "POST", body: fd });
      // if (!res.ok) throw new Error("ส่งคำขอล้มเหลว");
      // await res.json();

      console.log("[BAAC] payload", payload);
      setSubmitted(true);
    } catch {
      alert("เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5EE] flex items-start justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="
          w-full max-w-xl 
          rounded-[20px] border border-emerald-200/60 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]
          px-5 sm:px-7 py-5 space-y-4 relative
        "
      >
        {/* Header แบบการ์ด: ไอคอนต้นกล้า + ชื่อฟอร์ม */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            {/* sprout icon */}
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600">
              <path
                fill="currentColor"
                d="M12 21a1 1 0 0 1-1-1v-5.28A7.5 7.5 0 0 1 3 7a1 1 0 0 1 1-1a7.5 7.5 0 0 1 7 4.27V5a1 1 0 1 1 2 0v5.27A7.5 7.5 0 0 1 20 6a1 1 0 0 1 1 1a7.5 7.5 0 0 1-8 7.72V20a1 1 0 0 1-1 1Z"
              />
            </svg>
          </span>
          <h1 className="text-[18px] font-semibold text-emerald-700">แบบฟอร์มขอรับเงินสนับสนุนจาก ธ.ก.ส.</h1>
        </div>

        {submitted && (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-sm">
            ✅ ส่งคำขอสำเร็จแล้ว! เจ้าหน้าที่จะติดต่อกลับภายในไม่ช้า
          </div>
        )}

        {/* ชื่อ-สกุล */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ชื่อ" required error={errors.firstName}>
            <input className={inputBase} value={form.firstName} onChange={handleChange("firstName")} autoComplete="given-name" />
          </Field>
          <Field label="สกุล" required error={errors.lastName}>
            <input className={inputBase} value={form.lastName} onChange={handleChange("lastName")} autoComplete="family-name" />
          </Field>
        </div>

        {/* เบอร์ / บัตร / วันเกิด */}
        <Field label="เบอร์โทรศัพท์" required hint="เช่น 0812345678" error={errors.phone}>
          <input className={inputBase} inputMode="tel" autoComplete="tel-national" value={form.phone} onChange={handleChange("phone")} placeholder="0812345678" />
        </Field>

        <Field label="เลขบัตรประชาชน" required hint="13 หลัก" error={errors.citizenId}>
          <div className="relative">
            <input className={inputBase + " pr-10"} inputMode="numeric" maxLength={17} placeholder="x-xxxx-xxxxx-xx-x" value={form.citizenId} onChange={onCitizenIdChange} />
            {/* ไอคอนการ์ด */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1H3V7Zm19 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7h19ZM7 16h5v-2H7v2Z"/></svg>
            </span>
          </div>
        </Field>

        <Field label="วันเดือนปีเกิด" required error={errors.dob}>
          <input type="date" className={inputBase} value={form.dob} onChange={handleChange("dob")} />
        </Field>

        {/* ที่อยู่ */}
        <Field label="ที่อยู่ตามบัตรประชาชน" required error={errors.address}>
          <textarea rows={3} className={inputBase} value={form.address} onChange={handleChange("address")} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="จังหวัด" required error={errors.province}>
            <input className={inputBase} value={form.province} onChange={handleChange("province")} />
          </Field>
          <Field label="อำเภอ" required error={errors.amphur}>
            <input className={inputBase} value={form.amphur} onChange={handleChange("amphur")} />
          </Field>
          <Field label="ตำบล" required error={errors.tambon}>
            <input className={inputBase} value={form.tambon} onChange={handleChange("tambon")} />
          </Field>
        </div>

        <Field label="รหัสไปรษณีย์" required error={errors.postcode}>
          <input className={inputBase} inputMode="numeric" maxLength={5} value={form.postcode} onChange={handleChange("postcode")} />
        </Field>

        {/* เพาะปลูก */}
        <Field label="ชนิดพืชหลัก" required error={errors.mainCrop}>
          <div className="relative">
            <select className={selectBase} value={form.mainCrop} onChange={handleChange("mainCrop")}>
              <option value="">เลือกหรือพิมพ์เพิ่มได้</option>
              {MAIN_CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {/* chevron */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M7 10l5 5l5-5z"/></svg>
            </span>
          </div>
        </Field>

        <Field label="พืชอื่นๆ (ถ้ามี)">
          <input className={inputBase} value={form.otherCrops} onChange={handleChange("otherCrops")} placeholder="ระบุพืชเพิ่มเติม" />
        </Field>

        <Field label="พื้นที่เพาะปลูก (ไร่)" required hint="กรอกเป็นตัวเลข เช่น 12 หรือ 12.5" error={errors.areaRai}>
          <input className={inputBase} inputMode="decimal" value={form.areaRai} onChange={handleChange("areaRai")} />
        </Field>

        <Field label="สถานที่ตั้งแปลง" required hint="ระบุคำอธิบาย/ลิงก์ Google Maps" error={errors.plotLocation}>
          <input className={inputBase} value={form.plotLocation} onChange={handleChange("plotLocation")} placeholder="เช่น https://maps.app.goo.gl/..." />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="เอกสารสิทธิ์ในที่ดิน" required error={errors.landDoc}>
            <div className="relative">
              <select className={selectBase} value={form.landDoc} onChange={handleChange("landDoc")}>
                <option value="">-- เลือกประเภทเอกสาร --</option>
                <option value="โฉนด (น.ส.4 จ)">โฉนด (น.ส.4 จ)</option>
                <option value="น.ส.3ก">น.ส.3ก</option>
                <option value="ส.ป.ก.">ส.ป.ก.</option>
                <option value="ภบท.5">ภบท.5</option>
                <option value="เช่าที่/สัญญาเช่า">เช่าที่/สัญญาเช่า</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M7 10l5 5l5-5z"/></svg>
              </span>
            </div>
          </Field>
          <Field label="แนบเอกสารสิทธิ์ (รูป/PDF)">
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className={inputBase + " bg-white"} onChange={handleChange("landDocFiles")} />
          </Field>
          <Field label="เอกสารสิทธิ์อื่นๆ (ถ้ามี)">
            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className={inputBase + " bg-white"} onChange={handleChange("otherDocs")} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ท่านปลูกมากี่ปี" required error={errors.yearsPlanting}>
            <input className={inputBase} inputMode="numeric" value={form.yearsPlanting} onChange={handleChange("yearsPlanting")} placeholder="เช่น 5" />
          </Field>
          <Field label="รายได้เฉลี่ยต่อปี (บาท)" required error={errors.incomePerYear}>
            <input className={inputBase} inputMode="decimal" value={form.incomePerYear} onChange={handleChange("incomePerYear")} placeholder="เช่น 150000" />
          </Field>
        </div>

        {/* ความต้องการกู้ */}
        <Field label="รายการที่ต้องการกู้" required error={errors.loanPurposes}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LOAN_PURPOSES.map((p) => (
              <label key={p} className={chipBox}>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-emerald-600"
                  checked={form.loanPurposes.includes(p)}
                  onChange={handleCheckbox(p)}
                />
                <span className="text-[15px]">{p}</span>
              </label>
            ))}
          </div>
        </Field>

        {form.loanPurposes.includes("อื่นๆ") && (
          <Field label="รายการกู้อื่นๆ (ถ้ามี)" required error={errors.loanPurposeOther}>
            <input className={inputBase} value={form.loanPurposeOther} onChange={handleChange("loanPurposeOther")} placeholder="อธิบายเพิ่มเติม" />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="วงเงินที่ต้องการกู้ (บาท)"
            required
            error={errors.loanAmount}
            hint="ระบบจะแสดงคอมมาอัตโนมัติ"
          >
            <input className={inputBase} inputMode="numeric" value={form.loanAmount} onChange={handleAmountChange("loanAmount")} placeholder="เช่น 300,000" />
          </Field>
          <div className="self-end text-sm text-neutral-600">
            ตัวอย่างส่งค่า: {formatNumber(form.loanAmount) || "-"} บาท
          </div>
        </div>

        {/* Consent + Submit */}
        <div className="pt-2 flex items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            เมื่อกด “ส่งคำขอ” ถือว่ายินยอมให้ใช้ข้อมูลตามวัตถุประสงค์ของแบบฟอร์มนี้
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="min-w-[120px] h-11 rounded-[14px] bg-emerald-600 px-4 text-white text-[15px] font-medium shadow-md hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำขอ"}
          </button>
        </div>
      </form>
    </main>
  );
}
