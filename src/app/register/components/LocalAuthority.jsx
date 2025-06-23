"use client";
import React, { useState, useEffect, useCallback } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";
import { MdOutlineLocalLibrary } from "react-icons/md";
import LoadingOverlay from "./LoadingOverlatSent";

function LocalAuthorityPage({ selectedType = "", selectedSubType = "" }) {
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
        console.error("❌ โหลดจังหวัดล้มเหลว:", err);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#e8f0ef] via-white to-[#cce3dc] p-4">
      {showLoading && <LoadingOverlay />}
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
