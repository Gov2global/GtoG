"use client";
import React, { useState, useEffect, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect, ModernCreatableSelect } from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";
import LoadingOverlay from "./LoadingOverlat";
import liff from "@line/liff";

// [UNCHANGED] พันธุ์พืช hardcode
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
  // [UNCHANGED] form state
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

  // ✅ handleChange (เพิ่มเข้ามา)
  const handleChange = (field) => (valueOrEvent) => {
    const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // [UNCHANGED] autofill regProfile / regType / regSubType
  useEffect(() => {
    setFormData((prev) => ({ ...prev, regProfile: regProfile || prev.regProfile }));
  }, [regProfile]);
  useEffect(() => {
    setFormData((prev) => ({ ...prev, regType: selectedType || "", regSubType: selectedSubType || "" }));
  }, [selectedType, selectedSubType]);

  // [UNCHANGED] โหลดจังหวัด
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((json) => json.success && setProvinces(json.data))
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // [UNCHANGED] โหลดพืช
  useEffect(() => {
    fetch("/api/farmer/get/plant")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const formatted = json.data.map((item) => ({ value: item.plantID, label: item.plantNameTH }));
          formatted.push({ value: "other", label: "อื่นๆ (โปรดระบุ)" });
          setPlantOptions(formatted);
        }
      })
      .catch((err) => console.error("❌ โหลดพืชล้มเหลว:", err));
  }, []);

  // ✅ mapping plant → variety
  const selectedPlantOption = plantOptions.find((opt) => opt.value === formData.regPlant);
  const selectedLabel = selectedPlantOption?.label || "";
  const mappedKey = plantLabelMap[selectedLabel] || "";
  const safeOptions = mappedKey ? plantVarieties[mappedKey].map((v) => ({ value: v, label: v })) : [];
  const safePlantSpecies = (formData.regPlantSpecies || []).map((sp) => ({ value: sp, label: sp }));
  const cleanLabel = selectedLabel || "พืชที่เลือก";

  // [UNCHANGED] calculateTotalAreaSqm
  const calculateTotalAreaSqm = () => {
    const rai = parseFloat(formData.areaRai || 0) * 1600;
    const ngan = parseFloat(formData.areaNgan || 0) * 400;
    const wa = parseFloat(formData.areaWa || 0) * 4;
    return rai + ngan + wa;
  };

  // [UNCHANGED] validate
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regPlant) return "กรุณาเลือกพืชที่ปลูก";
    return null;
  };

  // [CHANGED] handleSubmit เพิ่ม reset form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg(""); setSuccessMsg("");
    const validateMsg = validate();
    if (validateMsg) { setErrorMsg(validateMsg); return; }

    setShowLoading(true); isSubmitting.current = true;
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
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error(submitJson.message || "บันทึกข้อมูลล้มเหลว");

      await fetch("/api/farmer/line/set-richmenu", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ regLineID }),
      });

      setSuccessMsg("✅ ลงทะเบียนสำเร็จ!");
      setFormData({
        regName: "", regProfile: "", regSurname: "", regTel: "", regPlant: "", regPlantOther: "", regPlantSpecies: [],
        regPlantAmount: "", regPlantAge: "", areaRai: "", areaNgan: "", areaWa: "", province: "", district: "", sub_district: "",
        addressDetail: "", regType: "", regSubType: "",
      });

      setTimeout(() => {
        setShowLoading(false);
        if (window?.liff) window.liff.closeWindow();
        else if (liff?.closeWindow) liff.closeWindow();
      }, 800);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
    } finally { isSubmitting.current = false; }
  };

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
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} />

          <ModernSelect label="เลือกพืชที่ปลูก" value={formData.regPlant} onChange={handleChange("regPlant")} options={plantOptions} />

          {formData.regPlant === "other" && (
            <ModernInput label="ระบุพืชอื่นๆ" value={formData.regPlantOther} onChange={handleChange("regPlantOther")} />
          )}

          {formData.regPlant && (
            <>
              {mappedKey && plantVarieties[mappedKey] ? (
                <ModernCreatableSelect
                  label={`เลือกหรือพิมพ์พันธุ์ของ "${selectedLabel}"`}
                  value={safePlantSpecies}
                  onChange={(val) => setFormData((prev) => ({ ...prev, regPlantSpecies: val.map((v) => v.value) }))}
                  options={safeOptions}
                  isMulti
                />
              ) : (
                <ModernInput label={`โปรดระบุพันธุ์ของ "${cleanLabel}"`} value={formData.regPlantSpecies?.[0] || ""} onChange={(v) => setFormData((prev) => ({ ...prev, regPlantSpecies: [v] }))} />
              )}

              <ModernInput label="จำนวนที่ปลูก (ต้น)" value={formData.regPlantAmount} onChange={handleChange("regPlantAmount")} />
              <ModernInput label="อายุของพืช" value={formData.regPlantAge} onChange={handleChange("regPlantAge")} />

              <h3 className="text-xl font-semibold text-amber-700 mb-2 mt-4">พื้นที่ที่ปลูก</h3>
              <div className="grid grid-cols-3 gap-4">
                <ModernInput label="ไร่" value={formData.areaRai} onChange={handleChange("areaRai")} type="number" />
                <ModernInput label="งาน" value={formData.areaNgan} onChange={handleChange("areaNgan")} type="number" />
                <ModernInput label="ตารางวา" value={formData.areaWa} onChange={handleChange("areaWa")} type="number" />
              </div>
              <p className="text-sm">🧮 รวมพื้นที่ทั้งหมด: <strong>{calculateTotalAreaSqm()}</strong> ตารางเมตร</p>

              {/* ✅ mock options จังหวัด-อำเภอ-ตำบล */}
              <ModernSelect label="จังหวัด" value={formData.province} onChange={handleChange("province")} options={provinces.map((p) => ({ value: p.province, label: p.province }))} />
              {formData.province && <ModernSelect label="อำเภอ" value={formData.district} onChange={handleChange("district")} options={districts.map((d) => ({ value: d, label: d }))} />}
              {formData.district && <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleChange("sub_district")} options={subDistricts.map((s) => ({ value: s, label: s }))} />}
              {formData.sub_district && (
                <>
                  <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} />
                  <ModernInput label="ที่อยู่เพิ่มเติม" value={formData.addressDetail} onChange={handleChange("addressDetail")} />
                </>
              )}
            </>
          )}

          <button type="submit" disabled={showLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-600 text-white py-3 rounded-full">
            <DiCoda size={22} /> ลงทะเบียน
          </button>
        </form>
      </div>
      {showLoading && <LoadingOverlay />}
    </div>
  );
}

export default FarmerFormPage;
