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
    setFormData((prev) => ({ ...prev, regProfile: regProfile || prev.regProfile }));
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

  // ✅ handleChange generic function
  const handleChange = (field) => (valueOrEvent) => {
    const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Province/District/Sub-district
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

  const handleDistrictChange = (val) => {
    setFormData((prev) => ({ ...prev, district: val, sub_district: "" }));
    setSubDistricts([]);
    setPostcode("");
    fetch(`/api/farmer/get/subdistrict?district=${val}`)
      .then((res) => res.json())
      .then((json) => json.success && setSubDistricts(json.data))
      .catch((err) => console.error("❌ โหลดตำบลล้มเหลว:", err));
  };

  const handleSubDistrictChange = (val) => {
    setFormData((prev) => ({ ...prev, sub_district: val }));
    fetch(`/api/farmer/get/postcode?sub_district=${val}`)
      .then((res) => res.json())
      .then((json) => json.success && setPostcode(json.data))
      .catch((err) => console.error("❌ โหลดรหัสไปรษณีย์ล้มเหลว:", err));
  };

  // ✅ คำนวณพื้นที่ทั้งหมด (sqm)
  const calculateTotalAreaSqm = () => {
    const rai = parseFloat(formData.areaRai || 0) * 1600;
    const ngan = parseFloat(formData.areaNgan || 0) * 400;
    const wa = parseFloat(formData.areaWa || 0) * 4;
    return rai + ngan + wa;
  };

  // ✅ validate ฟอร์ม (ใส่ตามเงื่อนไขของคุณ)
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regPlant) return "กรุณาเลือกพืชที่ปลูก";
    return null;
  };

  // ✅ handleSubmit (เหมือนที่คุณเขียน)
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
        regLineID: regLineID,
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
      setFormData((prev) => ({ ...prev, regName: "", regSurname: "", regTel: "" }));
      setTimeout(() => {
        setShowLoading(false);
        if (window?.liff) window.liff.closeWindow();
      }, 800);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
    } finally {
      isSubmitting.current = false;
    }
  };

  // 📝 คุณยังต้องใส่ logic mapping regPlant → plantVarieties ที่ตัดออกไป (mappedKey, safeOptions ฯลฯ)
  // แต่ตรงนี้ handleChange พร้อมใช้แล้ว ✅

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-white to-yellow-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10">
        <h2 className="text-3xl font-extrabold text-center text-amber-800 mb-8 flex items-center justify-center gap-3">
          <GiFarmTractor size={45} className="animate-bounce-slow" /> ลงทะเบียนเกษตรกร
        </h2>

        {errorMsg && <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded-lg">{errorMsg}</div>}
        {successMsg && <div className="mb-4 text-green-700 bg-green-100 px-4 py-2 rounded-lg">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} />
          <ModernSelect label="เลือกพืชที่ปลูก" value={formData.regPlant} onChange={handleChange("regPlant")} options={plantOptions} />
          {/* ... ที่เหลือเหมือนโค้ดคุณ */}
          <button type="submit" disabled={showLoading} className="w-full bg-amber-700 text-white py-3 rounded-full">
            <DiCoda size={22} /> ลงทะเบียน
          </button>
        </form>
      </div>
      {showLoading && <LoadingOverlay />}
    </div>
  );
}

export default FarmerFormPage;
