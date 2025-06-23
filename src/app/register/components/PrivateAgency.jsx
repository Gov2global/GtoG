"use client";
import React, { useState, useEffect } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { BsShop } from "react-icons/bs";
import { DiCoda } from "react-icons/di";
import LoadingOverlay from "./LoadingOverlatCAR";

function PrivateAgencyPage({ selectedType = "", selectedSubType = "" }) {
  const [formData, setFormData] = useState({
    regCompany: "",
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
    province: "",
    district: "",
    sub_district: "",
    addressDetail: "",
    regType: selectedType,
    regSubType: selectedSubType,
  });

  const [regFruits, setRegFruits] = useState([""]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/farmer/get/province");
        const json = await res.json();
        if (json.success) setProvinces(json.data);
      } catch (err) {
        console.error("❌ โหลดจังหวัดล้มเหลว:", err);
      }
    };
    fetchProvinces();
  }, []);

useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    regType: selectedType || "", // ← อาจจะว่าง!
    regSubType: selectedSubType || "",
  }));
}, [selectedType, selectedSubType]);
console.log("🧾 selectedType จาก props:", selectedType);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (value) => {
    handleChange("province")(value);
    const filteredDistricts = provinces
      .filter((item) => item.province === value)
      .map((item) => item.district)
      .filter((v, i, a) => a.indexOf(v) === i);
    setDistricts(filteredDistricts);
    setSubDistricts([]);
    setPostcode("");
    setFormData((prev) => ({ ...prev, district: "", sub_district: "" }));
  };

  const handleDistrictChange = (value) => {
    handleChange("district")(value);
    const filteredSub = provinces
      .filter((item) => item.province === formData.province && item.district === value)
      .map((item) => item.sub_district);
    setSubDistricts(filteredSub);
    setPostcode("");
    setFormData((prev) => ({ ...prev, sub_district: "" }));
  };

  const handleSubDistrictChange = (value) => {
    handleChange("sub_district")(value);
    const found = provinces.find(
      (item) =>
        item.province === formData.province &&
        item.district === formData.district &&
        item.sub_district === value
    );
    setPostcode(found?.postcode?.toString() || "");
  };

  const handleFruitChange = (index, value) => {
    const updated = [...regFruits];
    updated[index] = value;
    setRegFruits(updated);
  };

  const addFruit = () => {
    setRegFruits([...regFruits, ""]);
  };

  const removeFruit = (index) => {
    const updated = [...regFruits];
    updated.splice(index, 1);
    setRegFruits(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowLoading(true);

    setTimeout(async () => {
      try {
        const idRes = await fetch(`/api/farmer/gen-id?regType=${formData.regType}`);
        const idJson = await idRes.json();
        if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสลงทะเบียนได้");

        const payload = {
          ...formData,
          regID: idJson.regID,
          postcode,
          regFruits: regFruits.filter((f) => f.trim() !== ""),
        };

        console.log("📦 ส่งข้อมูล:", payload);

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
    }, 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-blue-100 p-4 relative">
      {showLoading && <LoadingOverlay />}
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10 border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-8 flex items-center justify-center gap-3">
          <BsShop size={45} className="animate-bounce-slow" />
          ลงทะเบียนหน่วยงานเอกชน
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อบริษัทฯ" value={formData.regCompany} onChange={handleChange("regCompany")} ringColor="blue" />
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} ringColor="blue" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} ringColor="blue" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} type="tel" ringColor="blue" />
          <ModernInput label="LINE ID" value={formData.regLineID} onChange={handleChange("regLineID")} ringColor="blue" />
          <ModernSelect label="จังหวัด" value={formData.province} onChange={handleProvinceChange}
            options={[...new Set(provinces.map((p) => p.province))].map((p) => ({ value: p, label: p }))} ringColor="blue" />

          {formData.province && (
            <ModernSelect label="อำเภอ" value={formData.district} onChange={handleDistrictChange}
              options={districts.map((d) => ({ value: d, label: d }))} ringColor="blue" />
          )}

          {formData.district && (
            <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleSubDistrictChange}
              options={subDistricts.map((s) => ({ value: s, label: s }))} ringColor="blue" />
          )}

          {formData.sub_district && (
            <>
              <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={setPostcode} ringColor="blue" />
              <ModernInput label="ที่อยู่เพิ่มเติม" value={formData.addressDetail} onChange={handleChange("addressDetail")} ringColor="blue" />
            </>
          )}

          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">ผลไม้ที่ต้องการซื้อ</h3>
            {regFruits.map((fruit, index) => (
              <div key={index} className="flex gap-2 items-end mb-3">
                <ModernInput label={`ผลไม้ #${index + 1}`} value={fruit} onChange={(val) => handleFruitChange(index, val)} placeholder="เช่น มะม่วง" ringColor="blue" />
                {regFruits.length > 1 && (
                  <button type="button" onClick={() => removeFruit(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">
                    ลบ
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addFruit} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              ➕ เพิ่มรายการผลไม้
            </button>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white py-3 rounded-full font-semibold hover:from-blue-900 hover:to-blue-700 shadow-lg transition-all duration-300">
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default PrivateAgencyPage;
