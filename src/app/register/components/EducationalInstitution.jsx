"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { DiCoda } from "react-icons/di";
import { MdOutlineLocalLibrary } from "react-icons/md";
import LoadingOverlay from "./LoadingOverlatSchool";
import liff from "@line/liff";

function EducationalInstitutionPage({
  selectedType = "",
  selectedSubType = "",
  regLineID = "",
  regProfile = "",
}) {
  const [formData, setFormData] = useState({
    regSchoolName: "",
    regProfile: regProfile || "",
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: regLineID || "",
    province: "",
    district: "",
    sub_district: "",
    regType: selectedType,
    regSubType: selectedSubType,
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
      regType: selectedType,
      regSubType: selectedSubType,
      regLineID: regLineID || prev.regLineID,
      regProfile: regProfile || prev.regProfile,
    }));
  }, [selectedType, selectedSubType, regLineID, regProfile]);

  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((json) => json.success && setProvinceList(json.data))
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
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

  // Validation
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regSurname) return "กรุณากรอกนามสกุล";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regSchoolName) return "กรุณากรอกชื่อโรงเรียน";
    if (!formData.province) return "กรุณาเลือกจังหวัด";
    if (!formData.regLineID) return "ไม่พบ LINE ID กรุณาเปิดผ่านแอป LINE";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    setErrorMsg("");
    setSuccessMsg("");
    const validateMsg = validate();
    if (validateMsg) {
      setErrorMsg(validateMsg);
      setShowLoading(false);
      return;
    }

    setShowLoading(true);
    isSubmitting.current = true;

    try {
      const idRes = await fetch(`/api/farmer/gen-id?regType=${formData.regType}`);
      const idJson = await idRes.json();
      if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสลงทะเบียนได้");

      const payload = {
        ...formData,
        regID: idJson.regID,
        postcode,
        regLineID: formData.regLineID || regLineID,
      };

      const submitRes = await fetch("/api/farmer/submit/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error(submitJson.message || "บันทึกข้อมูลล้มเหลว");

      // ✅ ไม่ต้องเรียก API RichMenu แยกอีกแล้ว
      setSuccessMsg("✅ ลงทะเบียนสำเร็จ!");

      // ✅ Reset form
      setFormData({
        regSchoolName: "",
        regProfile: "",
        regName: "",
        regSurname: "",
        regTel: "",
        regLineID: regLineID || "",
        province: "",
        district: "",
        sub_district: "",
        regType: selectedType,
        regSubType: selectedSubType,
      });

      setTimeout(() => {
        setShowLoading(false);
        if (window?.liff) window.liff.closeWindow();
        else if (liff?.closeWindow) liff.closeWindow();
      }, 1000);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e6f0ff] via-white to-[#c9e3ff] p-4">
      {showLoading && <LoadingOverlay />}
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl px-8 py-10 border border-[#A7C7E7]">
        <h2 className="text-3xl font-extrabold text-center text-[#1E3A8A] mb-8 tracking-tight flex items-center justify-center gap-3">
          <MdOutlineLocalLibrary size={42} className="text-[#2563EB]" />
          ลงทะเบียนสถาบันการศึกษา
        </h2>
        {errorMsg && (
          <div className="mb-4 text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-100 rounded-lg px-4 py-2">{successMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="blue" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="blue" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="blue" />
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} placeholder="กรุณากรอกชื่อ LINE" ringColor="amber" />
          <ModernInput label="ชื่อโรงเรียน" value={formData.regSchoolName} onChange={handleChange("regSchoolName")} placeholder="กรอกชื่อโรงเรียน" ringColor="blue" />
          <ModernSelect label="จังหวัด" value={formData.province} onChange={handleProvinceChange} options={[...new Set(provinceList.map((p) => p.province))].map((p) => ({ value: p, label: p }))} ringColor="blue" />
          {formData.province && (
            <ModernSelect label="อำเภอ" value={formData.district} onChange={handleDistrictChange} options={districtList.map((d) => ({ value: d, label: d }))} ringColor="blue" />
          )}
          {formData.district && (
            <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleSubDistrictChange} options={subDistrictList.map((s) => ({ value: s, label: s }))} ringColor="blue" />
          )}
          {formData.sub_district && (
            <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="blue" />
          )}
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] text-white py-3 rounded-full font-semibold hover:from-[#1E3A8A] hover:to-[#172554] shadow-lg transition-all duration-300">
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default EducationalInstitutionPage;
