"use client";
import React, { useState, useEffect, useCallback } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { DiCoda } from "react-icons/di";
import { MdOutlineLocalLibrary } from "react-icons/md";
import LoadingOverlay from "./LoadingOverlatSchool";

function EducationalInstitutionPage({ selectedType = "", selectedSubType = "" }) {
  const [formData, setFormData] = useState({
    regSchoolName: "",
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
    province: "",
    district: "",
    sub_district: "",
    regType: selectedType || "",
    regSubType: selectedSubType || "",
  });

  const [regFruits, setRegFruits] = useState([""]);
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subDistrictList, setSubDistrictList] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/farmer/get/province");
        const json = await res.json();
        if (json.success) setProvinceList(json.data);
      } catch (err) {
        console.error("\u274C \u0e42\u0e2b\u0e25\u0e14\u0e08\u0e31\u0e07\u0e2b\u0e27\u0e31\u0e14\u0e25\u0e49\u0e21\u0e40\u0e2b\u0e25\u0e27:", err);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regType: selectedType || "",
      regSubType: selectedSubType || "",
    }));
  }, [selectedType, selectedSubType]);

  const handleChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
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
  setShowLoading(true);

  if (!formData.regName || !formData.regSurname || !formData.regTel) {
    alert("กรุณากรอกชื่อ นามสกุล และเบอร์โทร");
    setShowLoading(false);
    return;
  }

  try {
    // ⏳ หน่วงเวลา 5 วินาที
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const idRes = await fetch(`/api/farmer/gen-id?regType=${formData.regType}`);
    const idJson = await idRes.json();
    if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสลงทะเบียนได้");

    const payload = {
      ...formData,
      regID: idJson.regID,
      postcode,
    };

    const submitRes = await fetch("/api/farmer/submit/farmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const submitJson = await submitRes.json();
    if (!submitJson.success) throw new Error("บันทึกข้อมูลล้มเหลว");

    // alert("✅ ลงทะเบียนสำเร็จ: " + submitJson.data.regID);
    window.location.reload();
  } catch (err) {
    console.error("❌", err.message);
    alert("❌ เกิดข้อผิดพลาด: " + err.message);
  } finally {
    setShowLoading(false);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="blue" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="blue" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="blue" />
          <ModernInput label="LINE ID" value={formData.regLineID} onChange={handleChange("regLineID")} placeholder="LINE ID ของคุณ" ringColor="blue" />
          <ModernInput label="ชื่อโรงเรียน" value={formData.regSchoolName} onChange={handleChange("regSchoolName")} placeholder="กรอกชื่อโรงเรียน" ringColor="blue" />

          <ModernSelect
            label="จังหวัด"
            value={formData.province}
            onChange={handleProvinceChange}
            options={[...new Set(provinceList.map((p) => p.province))].map((p) => ({ value: p, label: p }))}
            ringColor="blue"
          />

          {formData.province && (
            <ModernSelect
              label="อำเภอ"
              value={formData.district}
              onChange={handleDistrictChange}
              options={districtList.map((d) => ({ value: d, label: d }))}
              ringColor="blue"
            />
          )}

          {formData.district && (
            <ModernSelect
              label="ตำบล"
              value={formData.sub_district}
              onChange={handleSubDistrictChange}
              options={subDistrictList.map((s) => ({ value: s, label: s }))}
              ringColor="blue"
            />
          )}

          {formData.sub_district && (
            <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="blue" />
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] text-white py-3 rounded-full font-semibold hover:from-[#1E3A8A] hover:to-[#172554] shadow-lg transition-all duration-300"
          >
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default EducationalInstitutionPage;