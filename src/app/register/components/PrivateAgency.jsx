"use client";
import React, { useState, useEffect, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect } from "./ui/Select";
import { BsShop } from "react-icons/bs";
import { DiCoda } from "react-icons/di";
import LoadingOverlay from "./LoadingOverlatCAR";
import liff from "@line/liff";

function PrivateAgencyPage({ selectedType, selectedSubType, regLineID, regProfile }) {
  const [formData, setFormData] = useState({
    regCompany: "",
    regName: "",
    regSurname: "",
    regTel: "",
    regProfile: regProfile || "",
    province: "",
    district: "",
    sub_district: "",
    addressDetail: "",
    regType: selectedType || "",
    regSubType: selectedSubType || "",
  });

  const [regFruits, setRegFruits] = useState([""]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [postcode, setPostcode] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const isSubmitting = useRef(false);

  // Fetch Province
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((json) => json.success && setProvinces(json.data))
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // Sync prop to state
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regType: selectedType || "",
      regSubType: selectedSubType || "",
      regProfile: regProfile || prev.regProfile,
    }));
  }, [selectedType, selectedSubType, regProfile]);

  // Form handlers
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

  // ผลไม้
  const handleFruitChange = (index, value) => {
    const updated = [...regFruits];
    updated[index] = value;
    setRegFruits(updated);
  };
  const addFruit = () => setRegFruits([...regFruits, ""]);
  const removeFruit = (index) => {
    const updated = [...regFruits];
    updated.splice(index, 1);
    setRegFruits(updated);
  };

  // Validate
  const validate = () => {
    if (!formData.regCompany) return "กรุณากรอกชื่อบริษัท";
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regSurname) return "กรุณากรอกนามสกุล";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!regLineID) return "ไม่พบ Line ID กรุณาเปิดผ่านแอป LINE";
    return "";
  };

  // Submit
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
      if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสลงทะเบียนได้");

      const payload = {
        ...formData,
        regID: idJson.regID,
        postcode,
        regFruits: regFruits.filter((f) => f.trim() !== ""),
        regLineID: regLineID,
      };

      const submitRes = await fetch("/api/farmer/submit/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error("บันทึกข้อมูลล้มเหลว");

      // เปลี่ยน RichMenu (สำหรับหน่วยงานเอกชน)
      try {
        await fetch("/api/farmer/line/set-richmenu-PrivateAgency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regLineID }), // ส่ง regLineID ตรงๆ
        });
      } catch (err) {
        console.error("เปลี่ยน RichMenu ไม่สำเร็จ:", err);
      }

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-100 via-white to-blue-100 p-4 relative">
      {showLoading && <LoadingOverlay />}
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10 border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-8 flex items-center justify-center gap-3">
          <BsShop size={45} className="animate-bounce-slow" />
          ลงทะเบียนหน่วยงานเอกชน
        </h2>
        {errorMsg && (
          <div className="mb-4 text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-100 rounded-lg px-4 py-2">{successMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ModernInput label="ชื่อบริษัทฯ" value={formData.regCompany} onChange={handleChange("regCompany")} ringColor="blue" />
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} ringColor="blue" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} ringColor="blue" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} type="tel" ringColor="blue" />
          <ModernInput label="ID LINE" value={formData.regProfile} onChange={handleChange("regProfile")} placeholder="กรุณากรอกชื่อ LINE" ringColor="blue" />

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
