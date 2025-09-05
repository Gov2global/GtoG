"use client"; // [ADDED: เป็น client component ตามข้อกำหนด]

import React, { useMemo, useState } from "react"; // [CHANGED: คง useMemo/useState ใช้ภายในคอมโพเนนต์]
import dynamic from "next/dynamic";

// Dynamic import ของ react-select พร้อมปิด SSR เพื่อป้องกัน hydration errors
const CropSelect = dynamic(() =>
  import("react-select").then((mod) => {
    const Select = mod.default; // [ADDED: อ้างถึง default export ของ react-select]
    const reactSelectStyles = {
      control: (base, state) => ({
        ...base,
        borderRadius: 14,
        borderColor: state.isFocused ? "#6ee7b7" : "rgba(16,185,129,0.3)",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(110,231,183,0.5)" : "none",
        paddingLeft: 6,
        minHeight: 44,
        ":hover": { borderColor: "#6ee7b7" },
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: "#7dd3fc",
        color: "#083344",
        borderRadius: 9999,
        paddingLeft: 6,
        paddingRight: 2,
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "#083344",
        fontSize: 14,
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: "#0c4a6e",
        ":hover": { backgroundColor: "transparent", color: "#dc2626" },
      }),
      placeholder: (base) => ({ ...base, color: "#9ca3af" }),
      menu: (base) => ({ ...base, borderRadius: 12, overflow: "hidden" }),
    };

    return function CropSelectWrapper(props) {
      return (
        <Select
          {...props}
          isMulti
          styles={reactSelectStyles}
          classNamePrefix="react-select"
          placeholder="เลือกหรือพิมพ์ค้นหา..." // [CHANGED: ทำให้ generic ใช้ได้ทั้งพืช/เอกสาร]
          noOptionsMessage={() => "ไม่พบรายการ"}
        />
      );
    };
  }),
  { ssr: false }
);

function toNumber(val) {
  if (val === "" || val === null || val === undefined) return NaN; // [ADDED: รองรับค่าว่าง]
  const num = Number(String(val).replace(/,/g, "").trim());
  return Number.isNaN(num) ? NaN : num;
}

function calculateTotalAreaSqm(rai, ngan, wa) {
  const r = toNumber(rai);
  const n = toNumber(ngan);
  const w = toNumber(wa);
  const sqm =
    (Number.isNaN(r) ? 0 : r) * 1600 +
    (Number.isNaN(n) ? 0 : n) * 400 +
    (Number.isNaN(w) ? 0 : w) * 4; // [CHANGED: กัน NaN ด้วย fallback 0]
  return isNaN(sqm) ? 0 : sqm;
}

function convertSqmToRaiNganWa(sqm) {
  const safe = Math.max(0, Number(sqm) || 0); // [ADDED: กันค่าติดลบ/NaN]
  const rai = Math.floor(safe / 1600);
  const remainingAfterRai = safe % 1600;
  const ngan = Math.floor(remainingAfterRai / 400);
  const remainingAfterNgan = remainingAfterRai % 400;
  const wa = Math.floor(remainingAfterNgan / 4);
  return `${rai} ไร่ ${ngan} งาน ${wa} วา`;
}

function isValidThaiId(id) {
  const digits = String(id).replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
  const check = (11 - (sum % 11)) % 10;
  return check === Number(digits[12]);
}

function formatNumber(val) {
  const n = toNumber(val);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("en-US");
}

const LOAN_PURPOSES = [
  "ต้นทุนการผลิต",
  "ซื้อปุ๋ย/สารปรับปรุงดิน",
  "ซื้อเมล็ดพันธุ์/พันธุ์พืช",
  "ระบบน้ำ/สปริงเคิล/น้ำหยด",
  "เครื่องมือ/เครื่องจักร",
  "ขยายพื้นที่เพาะปลูก",
  "หมุนเวียนชำระหนี้",
  "ยากำจัด/ยาป้องกันศัตรูพืช",
  "อื่นๆ",
];

const MAIN_CROPS = ["ทุเรียน", "ลำไย", "ส้มโอ", "ส้มเขียวหวาน", "อื่นๆ"];
const CROP_OPTIONS = MAIN_CROPS.map((c) => ({ label: c, value: c }));

// [ADDED: ตัวเลือกเอกสารสิทธิ์สำหรับ multi-select]
const LAND_DOC_OPTIONS = [
  "โฉนด (น.ส.4 จ)", // [ADDED]
  "น.ส.3ก",          // [ADDED]
  "ส.ป.ก.",          // [ADDED]
  "ภบท.5",           // [ADDED]
  "เช่าที่/สัญญาเช่า", // [ADDED]
  "อื่นๆ",            // [ADDED]
];
const LAND_DOC_SELECT = LAND_DOC_OPTIONS.map((v) => ({ label: v, value: v })); // [ADDED]

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
    mainCrops: [],
    otherCrops: "",
    areaRai: "",
    areaNgan: "",
    areaWa: "",
    plotLocation: "",
    // landDoc: "", // [REMOVED: เปลี่ยนจากค่าเดี่ยวเป็นหลายค่า landDocs]
    landDocs: [], // [ADDED: เก็บรายการเอกสารหลายค่าเป็น array ของ {label,value}]
    landDocOther: "", // [ADDED: เก็บรายละเอียดเมื่อเลือก “อื่นๆ”]
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

  // ====== คำนวณพื้นที่แบบ reactive ======
  const totalAreaSqm = useMemo(() => {
    return calculateTotalAreaSqm(form.areaRai, form.areaNgan, form.areaWa); // [ADDED: คำนวณในคอมโพเนนต์เพื่ออ้าง form ได้]
  }, [form.areaRai, form.areaNgan, form.areaWa]);

  const areaText = useMemo(
    () => convertSqmToRaiNganWa(totalAreaSqm),
    [totalAreaSqm]
  ); // [ADDED: แสดงข้อความ ไร่-งาน-วา]

  const inputBase =
    "w-full rounded-[14px] border border-emerald-200/80 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";
  const selectBase =
    "appearance-none w-full rounded-[14px] border border-emerald-300 bg-white px-4 py-3 text-[15px] leading-6 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300";
  const chipBox =
    "flex items-center gap-3 rounded-[14px] border border-emerald-200 bg-white px-3 py-3 shadow-sm active:scale-[0.99]";

  const handleChange = (key) => (e) => {
    const value = e?.target?.files ? e.target.files : e.target.value;
    setForm((s) => ({ ...s, [key]: value })); // [CHANGED: อัพเดต state ทันที]
  };

  const handleCheckbox = (purpose) => (e) => {
    setForm((s) => {
      const setPur = new Set(s.loanPurposes);
      if (e.target.checked) setPur.add(purpose);
      else setPur.delete(purpose);
      return { ...s, loanPurposes: Array.from(setPur) };
    });
  };

  const handleAmountChange = (key) => (e) => {
    const raw = e.target.value
      .replace(/[^\d,]/g, "")
      .replace(/,+/g, (m) => (m.length > 1 ? "," : m));
    setForm((s) => ({ ...s, [key]: raw }));
  };

  const onCitizenIdChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 13);
    const parts = [
      v.slice(0, 1),
      v.slice(1, 5),
      v.slice(5, 10),
      v.slice(10, 12),
      v.slice(12, 13),
    ].filter(Boolean);
    setForm((s) => ({ ...s, citizenId: parts.join("-") }));
  };

  const hasOtherCrop = form.mainCrops.some((o) => o.value === "อื่นๆ");
  const hasOtherLandDoc = form.landDocs.some((o) => o.value === "อื่นๆ"); // [ADDED: เช็ค “อื่นๆ” สำหรับเอกสาร]

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

    if (!form.mainCrops.length)
      err.mainCrop = "กรุณาเลือกพืชหลักอย่างน้อย 1 ชนิด";

    const rai = toNumber(form.areaRai);
    if (Number.isNaN(rai) || rai <= 0) err.areaRai = "ใส่ตัวเลขมากกว่า 0";

    if (!form.plotLocation.trim())
      err.plotLocation = "กรุณากรอกสถานที่ตั้งแปลง";

    // if (!form.landDoc) err.landDoc = "กรุณาเลือกเอกสารสิทธิ์"; // [REMOVED: ใช้ landDocs แทน]
    if (!form.landDocs.length)
      err.landDocs = "กรุณาเลือกเอกสารสิทธิ์"; // [ADDED: validate array]
    if (hasOtherLandDoc && !form.landDocOther.trim())
      err.landDocOther = "กรุณาระบุเอกสารอื่นๆ"; // [ADDED: validate other text]

    const years = toNumber(form.yearsPlanting);
    if (Number.isNaN(years) || years < 0) err.yearsPlanting = "ตัวเลข >= 0";

    const income = toNumber(form.incomePerYear);
    if (Number.isNaN(income) || income < 0) err.incomePerYear = "ตัวเลข >= 0";

    if (!form.loanPurposes.length)
      err.loanPurposes = "เลือกอย่างน้อย 1 รายการ";
    if (form.loanPurposes.includes("อื่นๆ") && !form.loanPurposeOther.trim())
      err.loanPurposeOther = "ระบุรายละเอียด";

    const amount = toNumber(form.loanAmount);
    if (Number.isNaN(amount) || amount <= 0)
      err.loanAmount = "ตัวเลขมากกว่า 0";

    if (hasOtherCrop && !form.otherCrops.trim())
      err.otherCrops = "กรุณาระบุชื่อพืชอื่นๆ";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const payload = useMemo(
    () => ({
      ...form,
      citizenId: form.citizenId.replace(/\D/g, ""),
      phone: form.phone.replace(/\D/g, ""),
      mainCrops: form.mainCrops.map((o) => o.value),
      otherCrops: form.otherCrops.trim(),
      areaRai: toNumber(form.areaRai),
      yearsPlanting: toNumber(form.yearsPlanting),
      incomePerYear: toNumber(form.incomePerYear),
      loanPurposeOther: form.loanPurposes.includes("อื่นๆ")
        ? form.loanPurposeOther.trim()
        : "",
      loanAmount: toNumber(form.loanAmount),
      landDocFilesCount: form.landDocFiles?.length || 0,
      otherDocsCount: form.otherDocs?.length || 0,
      totalAreaSqm, // [ADDED: แนบผลรวมพื้นที่เพื่อส่งไป backend ได้]

      // [ADDED: แปลง landDocs -> array ของ value + include other text]
      landDocs: form.landDocs.map((o) => o.value),
      landDocOther: hasOtherLandDoc ? form.landDocOther.trim() : "",
    }),
    [form, totalAreaSqm, hasOtherLandDoc]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else fd.append(k, typeof v === "number" ? String(v) : v);
      });
      if (form.landDocFiles?.length)
        Array.from(form.landDocFiles).forEach((f) =>
          fd.append("landDocFiles", f, f.name)
        );
      if (form.otherDocs?.length)
        Array.from(form.otherDocs).forEach((f) =>
          fd.append("otherDocs", f, f.name)
        );
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
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-emerald-600"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 21a1 1 0 0 1-1-1v-5.28A7.5 7.5 0 0 1 3 7a1 1 0 0 1 1-1a7.5 7.5 0 0 1 7 4.27V5a1 1 0 1 1 2 0v5.27A7.5 7.5 0 0 1 20 6a1 1 0 0 1 1 1a7.5 7.5 0 0 1-8 7.72V20a1 1 0 0 1-1 1Z"
              />
            </svg>
          </span>
          <h1 className="text-[18px] font-semibold text-emerald-700">
            แบบฟอร์มขอรับเงินสนับสนุนจาก ธ.ก.ส.
          </h1>
        </div>

        {submitted && (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-sm">
            ✅ ส่งคำขอสำเร็จแล้ว! เจ้าหน้าที่จะติดต่อกลับภายในไม่ช้า
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ชื่อ" required error={errors.firstName}>
            <input
              className={inputBase}
              value={form.firstName}
              onChange={handleChange("firstName")}
              autoComplete="given-name"
            />
          </Field>
          <Field label="สกุล" required error={errors.lastName}>
            <input
              className={inputBase}
              value={form.lastName}
              onChange={handleChange("lastName")}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field
          label="เบอร์โทรศัพท์"
          required
          hint="เช่น 0812345678"
          error={errors.phone}
        >
          <input
            className={inputBase}
            inputMode="tel"
            autoComplete="tel-national"
            value={form.phone}
            onChange={handleChange("phone")}
            placeholder="0812345678"
          />
        </Field>

        <Field
          label="เลขบัตรประชาชน"
          required
          hint="13 หลัก"
          error={errors.citizenId}
        >
          <div className="relative">
            <input
              className={inputBase + " pr-10"}
              inputMode="numeric"
              maxLength={17}
              placeholder="x-xxxx-xxxxx-xx-x"
              value={form.citizenId}
              onChange={onCitizenIdChange}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1H3V7Zm19 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7h19ZM7 16h5v-2H7v2Z"
                />
              </svg>
            </span>
          </div>
        </Field>

        <Field label="วันเดือนปีเกิด" required error={errors.dob}>
          <input
            type="date"
            className={inputBase}
            value={form.dob}
            onChange={handleChange("dob")}
          />
        </Field>

        <Field label="ที่อยู่ตามบัตรประชาชน" required error={errors.address}>
          <textarea
            rows={3}
            className={inputBase}
            value={form.address}
            onChange={handleChange("address")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="จังหวัด" required error={errors.province}>
            <input
              className={inputBase}
              value={form.province}
              onChange={handleChange("province")}
            />
          </Field>
          <Field label="อำเภอ" required error={errors.amphur}>
            <input
              className={inputBase}
              value={form.amphur}
              onChange={handleChange("amphur")}
            />
          </Field>
          <Field label="ตำบล" required error={errors.tambon}>
            <input
              className={inputBase}
              value={form.tambon}
              onChange={handleChange("tambon")}
            />
          </Field>
        </div>

        <Field label="รหัสไปรษณีย์" required error={errors.postcode}>
          <input
            className={inputBase}
            inputMode="numeric"
            maxLength={5}
            value={form.postcode}
            onChange={handleChange("postcode")}
          />
        </Field>

        <Field label="ชนิดพืชหลัก" required error={errors.mainCrop}>
          <CropSelect
            value={form.mainCrops}
            onChange={(selected) => {
              const next = selected || [];
              const includeOther = next.some((o) => o.value === "อื่นๆ");
              setForm((s) => ({
                ...s,
                mainCrops: next,
                otherCrops: includeOther ? s.otherCrops : "",
              }));
            }}
            options={CROP_OPTIONS}
          />
        </Field>

        {hasOtherCrop && (
          <Field label="พืชอื่นๆ (ถ้ามี)" required error={errors.otherCrops}>
            <input
              className={inputBase}
              value={form.otherCrops}
              onChange={handleChange("otherCrops")}
              placeholder="ระบุพืชเพิ่มเติม"
              aria-required="true"
            />
          </Field>
        )}

        <div>
          <h3 className="text-xl font-semibold text-amber-700 mb-2 mt-4">
            พื้นที่ที่ปลูก
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="ไร่">
              <input
                type="number"
                className="w-full rounded-[14px] border border-amber-300 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={form.areaRai}
                onChange={handleChange("areaRai")}
                placeholder="0"
              />
            </Field>
            <Field label="งาน">
              <input
                type="number"
                className="w-full rounded-[14px] border border-amber-300 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={form.areaNgan}
                onChange={handleChange("areaNgan")}
                placeholder="0"
              />
            </Field>
            <Field label="ตารางวา">
              <input
                type="number"
                className="w-full rounded-[14px] border border-amber-300 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                value={form.areaWa}
                onChange={handleChange("areaWa")}
                placeholder="0"
              />
            </Field>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            🧮 รวมพื้นที่ทั้งหมด: <strong>{totalAreaSqm}</strong> ตารางเมตร
            <br /> {/* [CHANGED: แสดงผลรวมแบบ realtime] */}
            🧾 เทียบเท่า: <strong>{areaText}</strong>{" "}
            {/* [ADDED: แสดงข้อความไทย ไร่-งาน-วา] */}
          </p>
        </div>

        <Field
          label="สถานที่ตั้งแปลง"
          required
          hint="ระบุคำอธิบาย/ลิงก์ Google Maps"
          error={errors.plotLocation}
        >
          <input
            className={inputBase}
            value={form.plotLocation}
            onChange={handleChange("plotLocation")}
            placeholder="เช่น https://maps.app.goo.gl/..."
          />
        </Field>

        {/* [CHANGED: เอกสารสิทธิ์ในที่ดิน → multi-select + ช่อง 'อื่นๆ'] */}

          <Field label="เอกสารสิทธิ์ในที่ดิน" required error={errors.landDocs}>
            <CropSelect
              value={form.landDocs}
              onChange={(selected) => {
                const next = selected || [];
                const includeOther = next.some((o) => o.value === "อื่นๆ");
                setForm((s) => ({
                  ...s,
                  landDocs: next, // [CHANGED: เก็บ array ของ options]
                  landDocOther: includeOther ? s.landDocOther : "", // [ADDED: reset เมื่อเอา “อื่นๆ” ออก]
                }));
              }}
              options={LAND_DOC_SELECT}
            />
          </Field>

          {hasOtherLandDoc && (
            <Field
              label="เอกสารอื่นๆ (โปรดระบุ)"
              required
              error={errors.landDocOther}
            >
              <input
                className={inputBase}
                value={form.landDocOther}
                onChange={handleChange("landDocOther")}
                placeholder="กรุณาระบุเอกสารอื่นๆ"
              />
            </Field>
          )}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ท่านปลูกมากี่ปี" required error={errors.yearsPlanting}>
            <input
              className={inputBase}
              inputMode="numeric"
              value={form.yearsPlanting}
              onChange={handleChange("yearsPlanting")}
              placeholder="เช่น 5"
            />
          </Field>

          <Field
            label="รายได้เฉลี่ยต่อปี (บาท)"
            required
            error={errors.incomePerYear}
          >
            <input
              className={inputBase}
              inputMode="decimal"
              value={form.incomePerYear}
              onChange={handleChange("incomePerYear")}
              placeholder="เช่น 150000"
            />
          </Field>
        </div>

        <Field
          label="รายการที่ต้องการกู้"
          required
          error={errors.loanPurposes}
        >
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
          <Field
            label="รายการกู้อื่นๆ (ถ้ามี)"
            required
            error={errors.loanPurposeOther}
          >
            <input
              className={inputBase}
              value={form.loanPurposeOther}
              onChange={handleChange("loanPurposeOther")}
              placeholder="อธิบายเพิ่มเติม"
            />
          </Field>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field
            label="วงเงินที่ต้องการกู้ (บาท)"
            required
            error={errors.loanAmount}
            hint="ระบบจะแสดงคอมมาอัตโนมัติ"
          >
            <input
              className={inputBase}
              inputMode="numeric"
              value={form.loanAmount}
              onChange={handleAmountChange("loanAmount")}
              placeholder="เช่น 300,000"
            />
          </Field>

          <div className="self-end text-sm text-neutral-600">
            ตัวอย่างส่งค่า: {formatNumber(form.loanAmount) || "-"} บาท
          </div>
        </div>

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
