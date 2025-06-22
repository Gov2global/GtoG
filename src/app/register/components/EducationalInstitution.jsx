"use client";
import React, { useState, useEffect, useCallback } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { DiCoda } from "react-icons/di";
import { MdOutlineLocalLibrary } from "react-icons/md"; 

function EducationalInstitutionPage() {
  const [formData, setFormData] = useState({
    regSchoolName: "",
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
    province: "",
    district: "",
    sub_district: "",
  });

  const [regFruits, setRegFruits] = useState([""]);
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [subDistrictList, setSubDistrictList] = useState([]);
  const [postcode, setPostcode] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📦 ข้อมูลที่บันทึก:", {
      ...formData,
      postcode,
      regFruits,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e6f0ff] via-white to-[#c9e3ff] p-4">
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
