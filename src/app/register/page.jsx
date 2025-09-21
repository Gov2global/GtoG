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
    regProfile: regProfile || "",
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
    regType: selectedType || "",
    regSubType: selectedSubType || "",
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

  // ✅ โหลดจังหวัด อำเภอ ตำบลทั้งหมด
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

  // ✅ handleChange
  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ province → filter district
  const handleProvinceChange = (value) => {
    setFormData((prev) => ({ ...prev, province: value, district: "", sub_district: "" }));
    setDistricts(
      [...new Set(provinces.filter((p) => p.province === value).map((p) => p.district))]
    );
    setSubDistricts([]);
    setPostcode("");
  };

  // ✅ district → filter subDistrict
  const handleDistrictChange = (value) => {
    setFormData((prev) => ({ ...prev, district: value, sub_district: "" }));
    setSubDistricts(
      [...new Set(
        provinces
          .filter((p) => p.province === formData.province && p.district === value)
          .map((p) => p.sub_district)
      )]
    );
    setPostcode("");
  };

  // ✅ subDistrict → find postcode
  const handleSubDistrictChange = (value) => {
    setFormData((prev) => ({ ...prev, sub_district: value }));
    const found = provinces.find(
      (p) => p.province === formData.province && p.district === formData.district && p.sub_district === value
    );
    setPostcode(found?.postcode?.toString() || "");
  };

  // ✅ รวมพื้นที่
  const calculateTotalAreaSqm = () => {
    const rai = parseInt(formData.areaRai || 0) * 1600;
    const ngan = parseInt(formData.areaNgan || 0) * 400;
    const wa = parseInt(formData.areaWa || 0) * 4;
    return rai + ngan + wa;
  };

  // ✅ Validate
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regSurname) return "กรุณากรอกนามสกุล";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regPlant) return "กรุณาเลือกพืช";
    if (!formData.province) return "กรุณาเลือกจังหวัด";
    return null;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg("");
    setSuccessMsg("");

    const msg = validate();
    if (msg) {
      setErrorMsg(msg);
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
      setFormData({ ...formData, province: "", district: "", sub_district: "" });
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

  // ✅ Map พันธุ์พืช
  const mappedKey = plantLabelMap[plantOptions.find((o) => o.value === formData.regPlant)?.label];
  const selectedLabel = plantOptions.find((o) => o.value === formData.regPlant)?.label || "";
  const cleanLabel = formData.regPlantOther || selectedLabel;
  const safePlantSpecies = formData.regPlantSpecies || [];
  const safeOptions = mappedKey ? plantVarieties[mappedKey].map((v) => ({ value: v, label: v })) : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-white to-yellow-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10">
        <h2 className="text-3xl font-extrabold text-center text-amber-800 mb-8 flex items-center justify-center gap-3">
          <GiFarmTractor size={45} className="animate-bounce-slow" />
          ลงทะเบียนเกษตรกร
        </h2>

        {errorMsg && <div className="mb-4 text-red-700 bg-red-100 px-4 py-2 rounded">{errorMsg}</div>}
        {successMsg && <div className="mb-4 text-green-700 bg-green-100 px-4 py-2 rounded">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} type="tel" />
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} />

          <ModernSelect label="เลือกพืชที่ปลูก" value={formData.regPlant} onChange={handleChange("regPlant")} options={plantOptions} />

          {formData.regPlant === "other" && (
            <ModernInput label="ระบุพืชอื่นๆ" value={formData.regPlantOther} onChange={handleChange("regPlantOther")} />
          )}

          {/* จังหวัด / อำเภอ / ตำบล */}
          <ModernSelect
            label="จังหวัด"
            value={formData.province}
            onChange={handleProvinceChange}
            options={[...new Set(provinces.map((p) => p.province))].map((prov) => ({ value: prov, label: prov }))}
          />

          {formData.province && (
            <ModernSelect
              label="อำเภอ"
              value={formData.district}
              onChange={handleDistrictChange}
              options={districts.map((d) => ({ value: d, label: d }))}
            />
          )}

          {formData.district && (
            <ModernSelect
              label="ตำบล"
              value={formData.sub_district}
              onChange={handleSubDistrictChange}
              options={subDistricts.map((s) => ({ value: s, label: s }))}
            />
          )}

          {formData.sub_district && (
            <>
              <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={setPostcode} />
              <ModernInput label="ที่อยู่เพิ่มเติม" value={formData.addressDetail} onChange={handleChange("addressDetail")} />
            </>
          )}

          <button type="submit" className="w-full bg-amber-700 text-white py-3 rounded">ลงทะเบียน</button>
        </form>
      </div>
      {showLoading && <LoadingOverlay />}
    </div>
  );
}

export default FarmerFormPage;
