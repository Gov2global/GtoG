"use client";
import React, { useState, useEffect, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect, ModernCreatableSelect } from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";
import LoadingOverlay from "./LoadingOverlat";
import liff from "@line/liff";

// ✅ พันธุ์พืช hardcode
const plantVarieties = {
  durian: ["พันธุ์หมอนทอง", "พันธุ์ชะนี", "พันธุ์ก้านยาว", "พันธุ์กระดุมทอง", "พันธุ์หลงลับแล", "พันธุ์หลินลับแล"],
  longan: ["พันธุ์อีดอ", "พันธุ์สีชมพู", "พันธุ์เบี้ยวเขียว", "พันธุ์พวงทอง"],
  tangerine: ["พันธุ์สีทอง", "พันธุ์เวียดนาม", "พันธุ์พื้นเมือง", "พันธุ์เชียงใหม่"],
  pomelo: ["พันธุ์ขาวน้ำผึ้ง", "พันธุ์ทองดี", "พันธุ์ขาวแตงกวา", "พันธุ์ทับทิมสยาม"],
};
const plantLabelMap = {
  "ทุเรียน": "durian",
  "ลำไย": "longan",
  "ส้มเขียวหวาน": "tangerine",
  "ส้มโอ": "pomelo",
};

function FarmerFormPage({ selectedType, selectedSubType, regLineID, regProfile }) {
  const [formData, setFormData] = useState({
    regName: "",
    regProfile: "",
    regSurname: "",
    regTel: "",
    regPlant: "",
    regPlantOther: "",
    regPlantSpecies: [],
    regPlantAmount: "",
    regPlantAge: "",
    areaRai: "",
    areaNgan: "",
    areaWa: "",
    province: "",
    district: "",
    sub_district: "",
    addressDetail: "",
    regType: "",
    regSubType: "",
  });

  const [plantOptions, setPlantOptions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const isSubmitting = useRef(false);

  // ✅ autofill regProfile / regType / regSubType
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regProfile: regProfile || prev.regProfile,
    }));
  }, [regProfile]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regType: selectedType || "",
      regSubType: selectedSubType || "",
    }));
  }, [selectedType, selectedSubType]);

  // ✅ โหลดจังหวัด
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((json) => json.success && setProvinces(json.data))
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // ✅ โหลดพืช
  useEffect(() => {
    fetch("/api/farmer/get/plant")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const formatted = json.data.map((item) => ({
            value: item.plantID,
            label: item.plantNameTH,
          }));
          formatted.push({ value: "other", label: "อื่นๆ (โปรดระบุ)" });
          setPlantOptions(formatted);
        }
      })
      .catch((err) => console.error("❌ โหลดพืชล้มเหลว:", err));
  }, []);

  // ✅ generic handleChange
  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ handle จังหวัด → โหลดอำเภอ
  const handleProvinceChange = (val) => {
    setFormData((prev) => ({ ...prev, province: val, district: "", sub_district: "" }));
    setDistricts([]);
    setSubDistricts([]);
    setPostcode("");
    fetch(`/api/farmer/get/district?province=${val}`)
      .then((res) => res.json())
      .then((json) => json.success && setDistricts(json.data))
      .catch((err) => console.error("❌ โหลดอำเภอล้มเหลว:", err));
  };

  // ✅ handle อำเภอ → โหลดตำบล
  const handleDistrictChange = (val) => {
    setFormData((prev) => ({ ...prev, district: val, sub_district: "" }));
    setSubDistricts([]);
    setPostcode("");
    fetch(`/api/farmer/get/subdistrict?district=${val}`)
      .then((res) => res.json())
      .then((json) => json.success && setSubDistricts(json.data))
      .catch((err) => console.error("❌ โหลดตำบลล้มเหลว:", err));
  };

  // ✅ handle ตำบล → โหลดรหัสไปรษณีย์
  const handleSubDistrictChange = (val) => {
    setFormData((prev) => ({ ...prev, sub_district: val }));
    fetch(`/api/farmer/get/postcode?sub_district=${val}`)
      .then((res) => res.json())
      .then((json) => json.success && setPostcode(json.data))
      .catch((err) => console.error("❌ โหลดรหัสไปรษณีย์ล้มเหลว:", err));
  };

  // ✅ คำนวณพื้นที่
  const calculateTotalAreaSqm = () => {
    const rai = parseInt(formData.areaRai || 0) * 1600;
    const ngan = parseInt(formData.areaNgan || 0) * 400;
    const wa = parseInt(formData.areaWa || 0) * 4;
    return rai + ngan + wa;
  };

  // ✅ validate ฟอร์ม
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regSurname) return "กรุณากรอกนามสกุล";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regPlant) return "กรุณาเลือกพืช";
    if (!formData.province) return "กรุณาเลือกจังหวัด";
    return null;
  };

  // ✅ submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg("");
    setSuccessMsg("");

    const validateMsg = validate();
    if (validateMsg) {
      setErrorMsg(validateMsg);
      return;
    }

    setShowLoading(true);
    isSubmitting.current = true;

    try {
      const idRes = await fetch(`/api/farmer/gen-id?regType=${formData.regType}`);
      const idJson = await idRes.json();
      if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสเกษตรกรได้");

      const payload = {
        ...formData,
        regID: idJson.regID,
        regPlantSpecies: formData.regPlantSpecies.filter(Boolean),
        postcode,
        totalAreaSqm: calculateTotalAreaSqm(),
        regLineID,
      };

      const submitRes = await fetch("/api/farmer/submit/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error(submitJson.message || "บันทึกข้อมูลล้มเหลว");

      await fetch("/api/farmer/line/set-richmenu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regLineID }),
      });

      setSuccessMsg("✅ ลงทะเบียนสำเร็จ!");
      setFormData({
        regName: "",
        regProfile: "",
        regSurname: "",
        regTel: "",
        regPlant: "",
        regPlantOther: "",
        regPlantSpecies: [],
        regPlantAmount: "",
        regPlantAge: "",
        areaRai: "",
        areaNgan: "",
        areaWa: "",
        province: "",
        district: "",
        sub_district: "",
        addressDetail: "",
        regType: "",
        regSubType: "",
      });

      setTimeout(() => {
        setShowLoading(false);
        if (window?.liff) window.liff.closeWindow();
        else if (liff?.closeWindow) liff.closeWindow();
      }, 800);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
    } finally {
      isSubmitting.current = false;
    }
  };

  // ✅ แปลง label → key เพื่อเลือกพันธุ์พืช
  const mappedKey = plantLabelMap[plantOptions.find((o) => o.value === formData.regPlant)?.label];
  const selectedLabel = plantOptions.find((o) => o.value === formData.regPlant)?.label || "";
  const cleanLabel = formData.regPlantOther || selectedLabel;
  const safePlantSpecies = formData.regPlantSpecies || [];
  const safeOptions = mappedKey
    ? plantVarieties[mappedKey].map((v) => ({ value: v, label: v }))
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-white to-yellow-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10" role="main">
        <h2 className="text-3xl font-extrabold text-center text-amber-800 mb-8 tracking-tight flex items-center justify-center gap-3">
          <GiFarmTractor size={45} className="animate-bounce-slow" />
          ลงทะเบียนเกษตรกร
        </h2>

        {errorMsg && <div className="mb-4 text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</div>}
        {successMsg && <div className="mb-4 text-green-700 bg-green-100 rounded-lg px-4 py-2">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="amber" autoFocus />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="amber" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="amber" />
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} placeholder="ชื่อ LINE" ringColor="amber" />

          <ModernSelect label="เลือกพืชที่ปลูก" value={formData.regPlant} onChange={handleChange("regPlant")} options={plantOptions} ringColor="amber" />

          {formData.regPlant === "other" && (
            <ModernInput label="ระบุพืชอื่นๆ" value={formData.regPlantOther} onChange={handleChange("regPlantOther")} placeholder="เช่น กล้วย มังคุด" ringColor="amber" />
          )}

          {formData.regPlant && (
            <>
              {mappedKey && plantVarieties[mappedKey] ? (
                <ModernCreatableSelect
                  label={`เลือกหรือพิมพ์พันธุ์ของ "${selectedLabel}"`}
                  value={safePlantSpecies}
                  onChange={handleChange("regPlantSpecies")}
                  options={safeOptions}
                  isMulti
                  ringColor="amber"
                />
              ) : (
                <ModernInput label={`โปรดระบุพันธุ์ของ "${cleanLabel}"`} value={formData.regPlantSpecies?.[0] || ""} onChange={(v) => setFormData((prev) => ({ ...prev, regPlantSpecies: [v] }))} placeholder="เช่น พันธุ์สุวรรณ 1" ringColor="amber" />
              )}

              <ModernInput label="จำนวนที่ปลูก (ต้น)" value={formData.regPlantAmount} onChange={handleChange("regPlantAmount")} placeholder="เช่น 100 ต้น" ringColor="amber" />
              <ModernInput label="อายุของพืช" value={formData.regPlantAge} onChange={handleChange("regPlantAge")} placeholder="เช่น 2 เดือน หรือ 1 ปี" ringColor="amber" />

              <h3 className="text-xl font-semibold text-amber-700 mb-2 mt-4">พื้นที่ที่ปลูก</h3>
              <div className="grid grid-cols-3 gap-4">
                <ModernInput label="ไร่" value={formData.areaRai} onChange={handleChange("areaRai")} type="number" placeholder="0" ringColor="amber" />
                <ModernInput label="งาน" value={formData.areaNgan} onChange={handleChange("areaNgan")} type="number" placeholder="0" ringColor="amber" />
                <ModernInput label="ตารางวา" value={formData.areaWa} onChange={handleChange("areaWa")} type="number" placeholder="0" ringColor="amber" />
              </div>
              <p className="text-sm text-gray-600 mt-2">🧮 รวมพื้นที่ทั้งหมด: <strong>{calculateTotalAreaSqm()}</strong> ตารางเมตร</p>

              {/* ✅ จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ */}
              <ModernSelect label="จังหวัด" value={formData.province} onChange={handleProvinceChange} options={provinces.map((p) => ({ value: p.province, label: p.province }))} ringColor="amber" />
              {formData.province && <ModernSelect label="อำเภอ" value={formData.district} onChange={handleDistrictChange} options={districts.map((d) => ({ value: d, label: d }))} ringColor="amber" />}
              {formData.district && <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleSubDistrictChange} options={subDistricts.map((s) => ({ value: s, label: s }))} ringColor="amber" />}
              {formData.sub_district && (
                <>
                  <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="amber" />
                  <ModernInput label="ที่อยู่เพิ่มเติม (เช่น บ้านเลขที่/หมู่)" value={formData.addressDetail} onChange={handleChange("addressDetail")} placeholder="เช่น 123 หมู่ 4 บ้านโพน" ringColor="amber" />
                </>
              )}
            </>
          )}

          <button type="submit" disabled={showLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-600 text-white py-3 rounded-full font-semibold hover:from-amber-800 hover:to-yellow-700 shadow-lg transition-all duration-300">
            <DiCoda size={22} /> ลงทะเบียน
          </button>
        </form>
      </div>
      {showLoading && <LoadingOverlay />}
    </div>
  );
}

export default FarmerFormPage;
