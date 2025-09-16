"use client";
import React, { useState, useEffect } from "react";
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
          boxShadow: state.isFocused
            ? "0 0 0 2px rgba(110,231,183,0.5)"
            : "none",
          paddingLeft: 6,
          minHeight: 44,
          ":hover": { borderColor: "#6ee7b7" },
        }),
      };
      return (props) => (
        <Select
          {...props}
          isMulti
          styles={reactSelectStyles}
          classNamePrefix="react-select"
          placeholder="เลือกหรือพิมพ์ค้นหา..."
          noOptionsMessage={() => "ไม่พบรายการ"}
        />
      );
    }),
  { ssr: false }
);

// ===== Helper Functions =====
function toNumber(val) {
  if (!val) return NaN;
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
  const [loading, setLoading] = useState(true);
  const [regLineID, setRegLineID] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ✅ เพิ่ม State เก็บจังหวัด/อำเภอ/ตำบล
  const [provinceData, setProvinceData] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState([]);

  const [form, setForm] = useState({
    regLineID: "",
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

  const inputBase =
    "w-full rounded-[14px] border border-emerald-200/80 bg-white px-4 py-3 text-[15px] leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400";
  const chipBox =
    "flex items-center gap-3 rounded-[14px] border border-emerald-200 bg-white px-3 py-3 shadow-sm active:scale-[0.99]";

  // --- Init LIFF ---
  useEffect(() => {
  liff.init({ liffId: "2007697520-JzdQxW3y" })
    .then(() => {
      if (liff.isLoggedIn()) {
        liff.getProfile().then((profile) => {
          const userId = profile.userId;
          setRegLineID(userId);

          fetch(`/api/farmer/get/line-get/${userId}`)
            .then((res) => res.json())
            .then((result) => {
              if (result.success && result.data) {
                const user = result.data;
                setForm((prev) => ({
                  ...prev,
                  regLineID: userId, // ✅ บังคับ set
                  firstName: user.regName || prev.firstName,
                  lastName: user.regSurname || prev.lastName,
                  phone: user.regTel || prev.phone,
                }));
              } else {
                setForm((prev) => ({
                  ...prev,
                  regLineID: userId, // ✅ fallback
                }));
              }
            })
            .finally(() => setLoading(false));
        });
      } else {
        liff.login();
        setLoading(false);
      }
    })
    .catch((err) => {
      console.error("❌ LIFF init error:", err);
      setLoading(false);
    });
}, []);


  // --- โหลดข้อมูลจังหวัด/อำเภอ/ตำบล ---
useEffect(() => {
  fetch("/api/farmer/get/province")
    .then((res) => res.json())
    .then((data) => {
      console.log("📍 provinceData:", data);
      if (data.success) {
        setProvinceData(data.data);
      }
    })
    .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
}, []);

// เมื่อเลือกจังหวัด → filter อำเภอ
useEffect(() => {
  if (form.province) {
    const districts = provinceData
      .filter((item) => item.province === form.province)
      .map((i) => i.district);   // ✅ ใช้ district
    setFilteredDistricts([...new Set(districts)]);
    setForm((s) => ({ ...s, amphur: "", tambon: "", postcode: "" }));
    setFilteredSubDistricts([]);
  }
}, [form.province, provinceData]);

// เมื่อเลือกอำเภอ → filter ตำบล
useEffect(() => {
  if (form.amphur) {
    const subDistricts = provinceData
      .filter(
        (item) =>
          item.province === form.province &&
          item.district === form.amphur    // ✅ ใช้ district
      )
      .map((i) => i.sub_district);         // ✅ ใช้ sub_district
    setFilteredSubDistricts([...new Set(subDistricts)]);
    setForm((s) => ({ ...s, tambon: "", postcode: "" }));
  }
}, [form.amphur, form.province, provinceData]);

// เมื่อเลือกตำบล → auto fill postcode
useEffect(() => {
  if (form.tambon) {
    const match = provinceData.find(
      (item) =>
        item.province === form.province &&
        item.district === form.amphur &&      // ✅ district
        item.sub_district === form.tambon     // ✅ sub_district
    );
    if (match) {
      setForm((s) => ({ ...s, postcode: match.postcode.toString() }));
    }
  }
}, [form.tambon, form.amphur, form.province, provinceData]);



  // ===== Derived values =====
  const totalAreaSqm = calculateTotalAreaSqm(
    form.areaRai,
    form.areaNgan,
    form.areaWa
  );
  const areaText = convertSqmToRaiNganWa(totalAreaSqm);
  const hasOtherCrop = Array.isArray(form.mainCrops)
    ? form.mainCrops.some((o) => o.value === "อื่นๆ")
    : false;
  const hasOtherLandDoc = Array.isArray(form.landDocs)
    ? form.landDocs.some((o) => o.value === "อื่นๆ")
    : false;

  // ===== Handlers =====
  const handleChange = (key) => (e) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleCheckbox = (purpose) => (e) => {
    setForm((s) => {
      const setPur = new Set(s.loanPurposes);
      if (e.target.checked) setPur.add(purpose);
      else setPur.delete(purpose);
      return { ...s, loanPurposes: Array.from(setPur) };
    });
  };

  const handleAmountChange = (key) => (e) => {
    const raw = e.target.value.replace(/[^\d,]/g, "");
    setForm((s) => ({ ...s, [key]: raw }));
  };

  const onCitizenIdChange = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 13);
    setForm((s) => ({ ...s, citizenId: v }));
  };

  // ===== Submit =====
const onSubmit = async (e) => {
  e.preventDefault();
  try {
    setSubmitting(true);

    const payload = {
      ...form,
      regLineID, // ใช้จาก LIFF profile โดยตรง
      citizenId: form.citizenId.replace(/\D/g, ""),
      phone: form.phone.replace(/\D/g, ""),
      mainCrops: (form.mainCrops || []).map((o) => o.value),
      landDocs: (form.landDocs || []).map((o) => o.value),
      loanAmount: toNumber(form.loanAmount),
      totalAreaSqm,
    };

    console.log("📦 Payload:", payload);

    const res = await fetch("/api/baac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("📨 API result:", result);

    if (res.ok && result.success) {
      setSubmitted(true);

      if (result.line?.status === 200) {
        // ✅ LINE push สำเร็จ → ปิด LIFF
        if (liff.isInClient()) {
          setTimeout(() => liff.closeWindow(), 1500);
        } else {
          alert("✅ ส่งคำขอสำเร็จแล้ว! เจ้าหน้าที่จะติดต่อกลับ");
        }
      } else {
        // ⚠️ LINE push fail แต่ DB save สำเร็จ
        alert("⚠️ บันทึกข้อมูลแล้ว แต่ส่ง LINE ไม่สำเร็จ: " + JSON.stringify(result.line));
      }
    } else {
      alert("❌ บันทึกไม่สำเร็จ: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Submit Error:", err);
    alert("เกิดข้อผิดพลาดในการส่งคำขอ");
  } finally {
    setSubmitting(false);
  }
};



  // ===== Render =====
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F7F5EE]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-emerald-700 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </main>
    );
  }

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
        <Field label="ชื่อ" required>
          <input
            className={inputBase}
            value={form.firstName}
            onChange={handleChange("firstName")}
          />
        </Field>

        <Field label="สกุล" required>
          <input
            className={inputBase}
            value={form.lastName}
            onChange={handleChange("lastName")}
          />
        </Field>
</div>

        <Field label="เบอร์โทรศัพท์" required>
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
          <Field label="จังหวัด" required>
            <select
              className={inputBase}
              value={form.province}
              onChange={(e) => setForm((s) => ({ ...s, province: e.target.value }))}
            >
              <option value="">-- เลือกจังหวัด --</option>
              {[...new Set(provinceData.map((i) => i.province))].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>

          {/* อำเภอ */}
          <Field label="อำเภอ" required>
            <select
              className={inputBase}
              value={form.amphur}
              onChange={(e) => setForm((s) => ({ ...s, amphur: e.target.value }))}
              disabled={!form.province}
            >
              <option value="">-- เลือกอำเภอ --</option>
              {filteredDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          {/* ตำบล */}
          <Field label="ตำบล" required>
            <select
              className={inputBase}
              value={form.tambon}
              onChange={(e) => setForm((s) => ({ ...s, tambon: e.target.value }))}
              disabled={!form.amphur}
            >
              <option value="">-- เลือกตำบล --</option>
              {filteredSubDistricts.map((t) => (
                <option key={t} value={t}>{t}</option>
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
