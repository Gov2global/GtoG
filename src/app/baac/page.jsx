"use client";

import React, { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import liff from "@line/liff";

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
  return (r || 0) * 1600 + (n || 0) * 400 + (w || 0) * 4;
}
function convertSqmToRaiNganWa(sqm) {
  const safe = Math.max(0, Number(sqm) || 0);
  const rai = Math.floor(safe / 1600);
  const ngan = Math.floor((safe % 1600) / 400);
  const wa = Math.floor((safe % 400) / 4);
  return `${rai} ไร่ ${ngan} งาน ${wa} วา`;
}
function isValidThaiId(id) {
  const digits = String(id).replace(/\D/g, "");
  if (digits.length !== 13) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (13 - i);
  return (11 - (sum % 11)) % 10 === Number(digits[12]);
}
function formatNumber(val) {
  const n = toNumber(val);
  return Number.isNaN(n) ? "" : n.toLocaleString("en-US");
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
  const [regLineID, setRegLineID] = useState(""); // ✅ state เก็บค่า Line ID

  const [form, setForm] = useState({
    regLineID: "", // เริ่มต้นว่างไว้ก่อน
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
    yearsPlanting: "",
    incomePerYear: "",
    loanPurposes: [],
    loanPurposeOther: "",
    loanAmount: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [provinceData, setProvinceData] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState([]);

  // --- Init LIFF ---
  useEffect(() => {
    liff.init({ liffId: "2007697520-ReVxGaBb" }).then(() => {
      if (liff.isLoggedIn()) {
        liff.getProfile().then((profile) => {
          setRegLineID(profile.userId);

          fetch(`/api/farmer/get/line-get/${profile.userId}`)
            .then((res) => res.json())
            .then((result) => {
              if (result.success && result.data) {
                const user = result.data;
                setForm((prev) => ({
                  ...prev,
                  firstName: user.regName || prev.firstName,
                  lastName: user.regSurname || prev.lastName,
                  phone: user.regTel || prev.phone,
                  regLineID: user.regLineID || profile.userId,
                }));
              } else {
                setForm((prev) => ({
                  ...prev,
                  regLineID: profile.userId,
                }));
              }
            })
            .catch((err) => console.error("❌ โหลดข้อมูลเกษตรกรล้มเหลว:", err));
        });
      } else {
        liff.login();
      }
    });
  }, []);

  // --- โหลดจังหวัด ---
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProvinceData(data.data);
      })
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // ===== Derived =====
  const totalAreaSqm = useMemo(
    () => calculateTotalAreaSqm(form.areaRai, form.areaNgan, form.areaWa),
    [form.areaRai, form.areaNgan, form.areaWa]
  );
  const areaText = useMemo(
    () => convertSqmToRaiNganWa(totalAreaSqm),
    [totalAreaSqm]
  );

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
      landDocOther: form.landDocs.some((o) => o.value === "อื่นๆ")
        ? form.landDocOther.trim()
        : "",
    }),
    [form, totalAreaSqm]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/baac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSubmitted(true);
        setForm({
          regLineID, // ✅ เก็บค่าเดิมไว้
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
        <Field label="Line ID" required error={errors.regLineID}>
            <input
              className={inputBase}
              value={form.regLineID}
              onChange={handleChange("regLineID")}
            />
          </Field>

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
