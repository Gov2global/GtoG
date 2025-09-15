"use client";

import React, { useMemo, useState,useEffect } from "react";
import dynamic from "next/dynamic";

// ===== React Select (no SSR) =====
const CropSelect = dynamic(
  () =>
    import("react-select").then((mod) => {
      const Select = mod.default;
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
            placeholder="เลือกหรือพิมพ์ค้นหา..."
            noOptionsMessage={() => "ไม่พบรายการ"}
          />
        );
      };
    }),
  { ssr: false }
);

// ===== Helper Functions =====
function toNumber(val) {
  if (val === "" || val === null || val === undefined) return NaN;
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
    (Number.isNaN(w) ? 0 : w) * 4;
  return isNaN(sqm) ? 0 : sqm;
}
function convertSqmToRaiNganWa(sqm) {
  const safe = Math.max(0, Number(sqm) || 0);
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

// ===== Constants =====
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
const LAND_DOC_OPTIONS = [
  "โฉนด (น.ส.4 จ)",
  "น.ส.3ก",
  "ส.ป.ก.",
  "ภบท.5",
  "เช่าที่/สัญญาเช่า",
  "อื่นๆ",
];
const LAND_DOC_SELECT = LAND_DOC_OPTIONS.map((v) => ({ label: v, value: v }));

// ===== Field Component =====
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

// ===== Main Page =====
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
    landDocs: [],
    landDocOther: "",
    // landDocFiles: null,
    // otherDocs: null,
    yearsPlanting: "",
    incomePerYear: "",
    loanPurposes: [],
    loanPurposeOther: "",
    loanAmount: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [provinceData, setProvinceData] = useState([]); // [ADDED: เก็บข้อมูลทั้งหมด]
  const [filteredDistricts, setFilteredDistricts] = useState([]); // [ADDED: สำหรับอำเภอ]
  const [filteredSubDistricts, setFilteredSubDistricts] = useState([]); // [ADDED: สำหรับตำบล]

   // โหลด province data จาก API
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProvinceData(data.data);
        }
      })
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // เมื่อเปลี่ยนจังหวัด → filter อำเภอ
  useEffect(() => {
    if (form.province) {
      const districts = provinceData
        .filter((item) => item.province === form.province)
        .map((i) => i.district);
      setFilteredDistricts([...new Set(districts)]);
      setForm((s) => ({ ...s, amphur: "", tambon: "", postcode: "" })); // reset
      setFilteredSubDistricts([]);
    }
  }, [form.province]);

  // เมื่อเปลี่ยนอำเภอ → filter ตำบล
  useEffect(() => {
    if (form.amphur) {
      const subDistricts = provinceData
        .filter(
          (item) =>
            item.province === form.province && item.district === form.amphur
        )
        .map((i) => i.sub_district);
      setFilteredSubDistricts([...new Set(subDistricts)]);
      setForm((s) => ({ ...s, tambon: "", postcode: "" })); // reset
    }
  }, [form.amphur]);

  // เมื่อเปลี่ยนตำบล → auto fill postcode
  useEffect(() => {
    if (form.tambon) {
      const match = provinceData.find(
        (item) =>
          item.province === form.province &&
          item.district === form.amphur &&
          item.sub_district === form.tambon
      );
      if (match) {
        setForm((s) => ({ ...s, postcode: match.postcode.toString() }));
      }
    }
  }, [form.tambon]);

  // ===== Derived =====
  const totalAreaSqm = useMemo(
    () => calculateTotalAreaSqm(form.areaRai, form.areaNgan, form.areaWa),
    [form.areaRai, form.areaNgan, form.areaWa]
  );
  const areaText = useMemo(
    () => convertSqmToRaiNganWa(totalAreaSqm),
    [totalAreaSqm]
  );

  const inputBase =
    "w-full rounded-[14px] border border-emerald-200/80 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";
  const chipBox =
    "flex items-center gap-3 rounded-[14px] border border-emerald-200 bg-white px-3 py-3 shadow-sm active:scale-[0.99]";

  // ===== Handlers =====
  const handleChange = (key) => (e) => {
    const value = e?.target?.files ? e.target.files : e.target.value;
    setForm((s) => ({ ...s, [key]: value }));
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
  const hasOtherLandDoc = form.landDocs.some((o) => o.value === "อื่นๆ");

  // ===== Validate =====
  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "กรุณากรอกชื่อ";
    if (!form.lastName.trim()) err.lastName = "กรุณากรอกสกุล";
    const cid = form.citizenId.replace(/\D/g, "");
    if (!cid) err.citizenId = "กรุณากรอกเลขบัตรประชาชน";
    else if (!/^\d{13}$/.test(cid)) err.citizenId = "ต้องมี 13 หลัก";
    else if (!isValidThaiId(cid)) err.citizenId = "เลขบัตรประชาชนไม่ถูกต้อง";
    if (!form.dob) err.dob = "กรุณาเลือกวันเกิด";
    const phone = form.phone.replace(/\D/g, "");
    if (!phone) err.phone = "กรุณากรอกเบอร์โทรศัพท์";
    else if (!/^0(6|8|9)\d{8}$/.test(phone)) err.phone = "เบอร์ไม่ถูกต้อง";
    if (!form.address.trim()) err.address = "กรุณากรอกที่อยู่";
    if (!form.province.trim()) err.province = "กรุณาระบุจังหวัด";
    if (!form.amphur.trim()) err.amphur = "กรุณาระบุอำเภอ";
    if (!form.tambon.trim()) err.tambon = "กรุณาระบุตำบล";
    if (!/^\d{5}$/.test(form.postcode)) err.postcode = "รหัสไปรษณีย์ไม่ถูกต้อง";
    if (!form.mainCrops.length) err.mainCrop = "กรุณาเลือกพืชหลัก";
    if (hasOtherCrop && !form.otherCrops.trim())
      err.otherCrops = "กรุณาระบุพืชอื่นๆ";
    if (toNumber(form.areaRai) <= 0) err.areaRai = "กรอกตัวเลข > 0";
    if (!form.plotLocation.trim()) err.plotLocation = "กรุณากรอกสถานที่ตั้งแปลง";
    if (!form.landDocs.length) err.landDocs = "กรุณาเลือกเอกสารสิทธิ์";
    if (hasOtherLandDoc && !form.landDocOther.trim())
      err.landDocOther = "กรุณาระบุเอกสารอื่นๆ";
    if (toNumber(form.yearsPlanting) < 0) err.yearsPlanting = "ตัวเลข >= 0";
    if (toNumber(form.incomePerYear) < 0) err.incomePerYear = "ตัวเลข >= 0";
    if (!form.loanPurposes.length)
      err.loanPurposes = "เลือกวัตถุประสงค์กู้เงินอย่างน้อย 1";
    if (form.loanPurposes.includes("อื่นๆ") && !form.loanPurposeOther.trim())
      err.loanPurposeOther = "กรุณาระบุรายละเอียด";
    if (toNumber(form.loanAmount) <= 0)
      err.loanAmount = "กรอกวงเงินมากกว่า 0";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ===== Submit =====
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
      totalAreaSqm,
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

      const res = await fetch("/api/baac", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // [ADDED: ส่งเป็น JSON]
        body: JSON.stringify(payload), // [CHANGED: ใช้ JSON payload แทน FormData]
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSubmitted(true);
        setForm({
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
          landDocs: [],
          landDocOther: "",
          // landDocFiles: null,
          // otherDocs: null,
          yearsPlanting: "",
          incomePerYear: "",
          loanPurposes: [],
          loanPurposeOther: "",
          loanAmount: "",
        });
      } else {
        alert("❌ บันทึกไม่สำเร็จ: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการส่งคำขอ");
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Render =====
  return (
    <main className="min-h-screen bg-[#F7F5EE] flex items-start justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-xl rounded-[20px] border border-emerald-200/60 bg-white shadow px-5 sm:px-7 py-5 space-y-4 relative"
      >
        <h1 className="text-lg font-semibold text-emerald-700 text-center">
          แบบฟอร์มขอรับเงินสนับสนุนจาก ธ.ก.ส.
        </h1>

        {submitted && (
          <div className="rounded-[14px] border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-sm">
            ✅ ส่งคำขอสำเร็จแล้ว! เจ้าหน้าที่จะติดต่อกลับ
          </div>
        )}

        {/* ========== Fields ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ชื่อ" required error={errors.firstName}>
            <input
              className={inputBase}
              value={form.firstName}
              onChange={handleChange("firstName")}
            />
          </Field>
          <Field label="สกุล" required error={errors.lastName}>
            <input
              className={inputBase}
              value={form.lastName}
              onChange={handleChange("lastName")}
            />
          </Field>
        </div>

        <Field label="เบอร์โทรศัพท์" required hint="เช่น 0812345678" error={errors.phone}>
          <input
            className={inputBase}
            inputMode="tel"
            value={form.phone}
            onChange={handleChange("phone")}
          />
        </Field>

        <Field label="เลขบัตรประชาชน" required error={errors.citizenId}>
          <input
            className={inputBase}
            inputMode="numeric"
            maxLength={17}
            value={form.citizenId}
            onChange={onCitizenIdChange}
          />
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
          {/* จังหวัด */}
          <Field label="จังหวัด" required error={errors.province}>
            <select
              className={inputBase}
              value={form.province}
              onChange={(e) => setForm((s) => ({ ...s, province: e.target.value }))}
            >
              <option value="">-- เลือกจังหวัด --</option>
              {[...new Set(provinceData.map((i) => i.province))].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          {/* อำเภอ */}
          <Field label="อำเภอ" required error={errors.amphur}>
            <select
              className={inputBase}
              value={form.amphur}
              onChange={(e) => setForm((s) => ({ ...s, amphur: e.target.value }))}
              disabled={!form.province}
            >
              <option value="">-- เลือกอำเภอ --</option>
              {filteredDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          {/* ตำบล */}
          <Field label="ตำบล" required error={errors.tambon}>
            <select
              className={inputBase}
              value={form.tambon}
              onChange={(e) => setForm((s) => ({ ...s, tambon: e.target.value }))}
              disabled={!form.amphur}
            >
              <option value="">-- เลือกตำบล --</option>
              {filteredSubDistricts.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* แสดงรหัสไปรษณีย์อัตโนมัติ */}
        <Field label="รหัสไปรษณีย์" required error={errors.postcode}>
          <input className={inputBase} value={form.postcode} readOnly />
        </Field>

        <Field label="ชนิดพืชหลัก" required error={errors.mainCrop}>
          <CropSelect
            value={form.mainCrops}
            onChange={(selected) =>
              setForm((s) => ({ ...s, mainCrops: selected || [] }))
            }
            options={CROP_OPTIONS}
          />
        </Field>

        {hasOtherCrop && (
          <Field label="พืชอื่นๆ (ถ้ามี)" required error={errors.otherCrops}>
            <input
              className={inputBase}
              value={form.otherCrops}
              onChange={handleChange("otherCrops")}
            />
          </Field>
        )}

        <div>
          <h3 className="text-base font-semibold text-amber-700">พื้นที่ที่ปลูก</h3>
          <div className="grid grid-cols-3 gap-4">
            <Field label="ไร่">
              <input
                type="number"
                className={inputBase}
                value={form.areaRai}
                onChange={handleChange("areaRai")}
              />
            </Field>
            <Field label="งาน">
              <input
                type="number"
                className={inputBase}
                value={form.areaNgan}
                onChange={handleChange("areaNgan")}
              />
            </Field>
            <Field label="ตารางวา">
              <input
                type="number"
                className={inputBase}
                value={form.areaWa}
                onChange={handleChange("areaWa")}
              />
            </Field>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            🧮 รวม: <strong>{totalAreaSqm}</strong> ตร.ม. | <strong>{areaText}</strong>
          </p>
        </div>

        <Field label="สถานที่ตั้งแปลง" required error={errors.plotLocation}>
          <input
            className={inputBase}
            value={form.plotLocation}
            onChange={handleChange("plotLocation")}
          />
        </Field>

        <Field label="เอกสารสิทธิ์ในที่ดิน" required error={errors.landDocs}>
          <CropSelect
            value={form.landDocs}
            onChange={(selected) =>
              setForm((s) => ({ ...s, landDocs: selected || [] }))
            }
            options={LAND_DOC_SELECT}
          />
        </Field>

        {hasOtherLandDoc && (
          <Field label="เอกสารอื่นๆ (โปรดระบุ)" required error={errors.landDocOther}>
            <input
              className={inputBase}
              value={form.landDocOther}
              onChange={handleChange("landDocOther")}
            />
          </Field>
        )}

        {/* <Field label="แนบไฟล์เอกสารสิทธิ์ (ถ้ามี)">
          <input type="file" multiple onChange={handleChange("landDocFiles")} />
        </Field>

        <Field label="แนบไฟล์เอกสารเพิ่มเติม (ถ้ามี)">
          <input type="file" multiple onChange={handleChange("otherDocs")} />
        </Field> */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ปลูกมากี่ปี" required error={errors.yearsPlanting}>
            <input
              className={inputBase}
              value={form.yearsPlanting}
              onChange={handleChange("yearsPlanting")}
            />
          </Field>
          <Field label="รายได้เฉลี่ยต่อปี (บาท)" required error={errors.incomePerYear}>
            <input
              className={inputBase}
              value={form.incomePerYear}
              onChange={handleChange("incomePerYear")}
            />
          </Field>
        </div>

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
                <span>{p}</span>
              </label>
            ))}
          </div>
        </Field>

        {form.loanPurposes.includes("อื่นๆ") && (
          <Field label="รายละเอียดเพิ่มเติม" required error={errors.loanPurposeOther}>
            <input
              className={inputBase}
              value={form.loanPurposeOther}
              onChange={handleChange("loanPurposeOther")}
            />
          </Field>
        )}

        <Field label="วงเงินที่ต้องการกู้ (บาท)" required error={errors.loanAmount}>
          <input
            className={inputBase}
            value={form.loanAmount}
            onChange={handleAmountChange("loanAmount")}
          />
          <p className="text-sm text-gray-600">
            ตัวอย่าง: {formatNumber(form.loanAmount) || "-"} บาท
          </p>
        </Field>

        {/* Submit */}
        <div className="pt-2 flex justify-between items-center">
          <p className="text-xs text-neutral-500">
            เมื่อกด “ส่งคำขอ” ถือว่ายินยอมตามวัตถุประสงค์
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-[14px] bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "กำลังส่ง..." : "ส่งคำขอ"}
          </button>
        </div>
      </form>
    </main>
  );
}
