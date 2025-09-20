"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { DiCoda } from "react-icons/di";
import { BsShop } from "react-icons/bs";
import LoadingOverlay from "./LoadingOverlatCAR";
import liff from "@line/liff";

function GovernmentAgenciesPage({ selectedType, selectedSubType, regLineID, regProfile }) {
  const [formData, setFormData] = useState({
    regPosition: "",
    regAreaOfResponsibility: "",
    regProfile: regProfile || "",
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: regLineID || "",
    province: "",
    district: "",
    sub_district: "",
    regType: selectedType || "",
    regSubType: selectedSubType || "",
  });

  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subDistrictList, setSubDistrictList] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const isSubmitting = useRef(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regType: selectedType || "",
      regSubType: selectedSubType || "",
      regProfile: regProfile || prev.regProfile,
      regLineID: regLineID || prev.regLineID,
    }));
  }, [selectedType, selectedSubType, regProfile, regLineID]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/farmer/get/province");
        const json = await res.json();
        if (json.success) setProvinceList(json.data);
      } catch (err) {
        console.error("❌ โหลดจังหวัดล้มเหลว:", err);
      }
    };
    fetchProvinces();
  }, []);

  const handleChange = useCallback(
    (field) => (value) => setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  const handleProvinceChange = (province) => {
    handleChange("province")(province);
    const filteredDistricts = provinceList
      .filter((item) => item.province === province)
      .map((item) => item.district)
      .filter((v, i, a) => a.indexOf(v) === i);
    setDistrictList(filteredDistricts);
    setSubDistrictList([]);
    setPostcode("");
    setFormData((prev) => ({ ...prev, district: "", sub_district: "" }));
  };

  const handleDistrictChange = (district) => {
    handleChange("district")(district);
    const filteredSub = provinceList
      .filter((item) => item.province === formData.province && item.district === district)
      .map((item) => item.sub_district);
    setSubDistrictList(filteredSub);
    setPostcode("");
    setFormData((prev) => ({ ...prev, sub_district: "" }));
  };

  const handleSubDistrictChange = (sub_district) => {
    handleChange("sub_district")(sub_district);
    const found = provinceList.find(
      (item) =>
        item.province === formData.province &&
        item.district === formData.district &&
        item.sub_district === sub_district
    );
    setPostcode(found?.postcode?.toString() || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg("");
    setSuccessMsg("");
    isSubmitting.current = true;
    setShowLoading(true);

    // ✅ Validation
    if (!formData.regName || !formData.regSurname || !formData.regTel) {
      setErrorMsg("กรุณากรอกชื่อ นามสกุล และเบอร์โทร");
      setShowLoading(false);
      isSubmitting.current = false;
      return;
    }

    try {
      // Gen ID
      const idRes = await fetch(`/api/farmer/gen-id?regType=${formData.regType}`);
      const idJson = await idRes.json();
      if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสลงทะเบียนได้");

      const payload = {
        ...formData,
        regID: idJson.regID,
        postcode,
        regLineID: regLineID, // force ใช้ prop
      };

      // ✅ Submit → backend จะ set RichMenu ให้อัตโนมัติ
      const submitRes = await fetch("/api/farmer/submit/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error("บันทึกข้อมูลล้มเหลว");

      setSuccessMsg("✅ ลงทะเบียนสำเร็จ!");
      setTimeout(() => {
        setShowLoading(false);
        if (window?.liff) window.liff.closeWindow();
        else if (liff?.closeWindow) liff.closeWindow();
      }, 800);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-gray-200 p-4">
      {showLoading && <LoadingOverlay />}
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl px-8 py-10 border border-gray-300">
        <h2 className="text-3xl font-extrabold text-center text-[#374151] mb-8 tracking-tight flex items-center justify-center gap-3">
          <BsShop size={42} className="text-[#6B7280]" />
          ลงทะเบียนหน่วยงานราชการ
        </h2>
        {errorMsg && (
          <div className="mb-4 text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-100 rounded-lg px-4 py-2">{successMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="gray" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="gray" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="gray" />
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} placeholder="กรุณากรอกชื่อ LINE" ringColor="amber" />
          <ModernInput label="ตำแหน่ง" value={formData.regPosition} onChange={handleChange("regPosition")} placeholder="กรอกตำแหน่ง" ringColor="gray" />
          <ModernInput label="เขตพื้นที่รับผิดชอบ" value={formData.regAreaOfResponsibility} onChange={handleChange("regAreaOfResponsibility")} placeholder="กรอกเขตพื้นที่รับผิดชอบ" ringColor="gray" />
          <ModernSelect label="จังหวัด" value={formData.province} onChange={handleProvinceChange} options={[...new Set(provinceList.map((p) => p.province))].map((p) => ({ value: p, label: p }))} ringColor="gray" />
          {formData.province && (
            <ModernSelect label="อำเภอ" value={formData.district} onChange={handleDistrictChange} options={districtList.map((d) => ({ value: d, label: d }))} ringColor="gray" />
          )}
          {formData.district && (
            <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleSubDistrictChange} options={subDistrictList.map((s) => ({ value: s, label: s }))} ringColor="gray" />
          )}
          {formData.sub_district && (
            <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="gray" />
          )}

          <button type="submit" disabled={showLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#374151] to-[#1F2937] text-white py-3 rounded-full font-semibold hover:from-[#1F2937] hover:to-[#111827] shadow-md transition-all duration-300">
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default GovernmentAgenciesPage;
