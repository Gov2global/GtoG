"use client";
import React, { useState, useEffect, useCallback } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";
import { MdOutlineLocalLibrary } from "react-icons/md";

function LocalAuthorityPage() {
  const [formData, setFormData] = useState({
    regPosition: "",
    regAreaOfResponsibility: "",
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e8f0ef] via-white to-[#cce3dc] p-4">
      <div className="w-full max-w-lg bg-white shadow-md rounded-xl px-8 py-10 border border-[#B6D2C1]">
        <h2 className="text-3xl font-extrabold text-center text-[#2C3E50] mb-8 tracking-tight flex items-center justify-center gap-3">
          <MdOutlineLocalLibrary size={42} className="text-[#3E5C49]" />
          ลงทะเบียนหน่วยงานท้องถิ่น
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="gray" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="gray" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="gray" />
          <ModernInput label="LINE ID" value={formData.regLineID} onChange={handleChange("regLineID")} placeholder="LINE ID ของคุณ" ringColor="gray" />
          <ModernInput label="ตำแหน่ง" value={formData.regPosition} onChange={handleChange("regPosition")} placeholder="กรอกตำแหน่ง" ringColor="gray" />
          <ModernInput label="เขตพื้นที่รับผิดชอบ" value={formData.regAreaOfResponsibility} onChange={handleChange("regAreaOfResponsibility")} placeholder="กรอกเขตพื้นที่รับผิดชอบ" ringColor="gray" />

          <ModernSelect
            label="จังหวัด"
            value={formData.province}
            onChange={handleProvinceChange}
            options={[...new Set(provinceList.map((p) => p.province))].map((p) => ({ value: p, label: p }))}
            ringColor="gray"
          />

          {formData.province && (
            <ModernSelect
              label="อำเภอ"
              value={formData.district}
              onChange={handleDistrictChange}
              options={districtList.map((d) => ({ value: d, label: d }))}
              ringColor="gray"
            />
          )}

          {formData.district && (
            <ModernSelect
              label="ตำบล"
              value={formData.sub_district}
              onChange={handleSubDistrictChange}
              options={subDistrictList.map((s) => ({ value: s, label: s }))}
              ringColor="gray"
            />
          )}

          {formData.sub_district && (
            <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="gray" />
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3E5C49] to-[#2C3E50] text-white py-3 rounded-full font-semibold hover:from-[#2C3E50] hover:to-[#1C2D3C] shadow-lg transition-all duration-300"
          >
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default LocalAuthorityPage;
