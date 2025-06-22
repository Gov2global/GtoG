"use client";
import React, { useState, useEffect } from "react";
import ModernInput from "./ui/Input";
import ModernSelect from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";

function FarmerFormPage() {
  const [formData, setFormData] = useState({
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
    regPlant: "",
    regPlantOther: "",
    regPlantSpecies: "",
    regPlantAmount: "",
    regPlantAge: "",
    province: "",
    district: "",
    sub_district: "",
    addressDetail: "",
  });

  const [plantOptions, setPlantOptions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [postcode, setPostcode] = useState("");

  // ดึงข้อมูลจังหวัด
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

  // ดึงข้อมูลพืช
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const res = await fetch("/api/farmer/get/plant");
        const json = await res.json();
        if (json.success) {
          const formatted = json.data.map((item) => ({
            value: item.plantID,
            label: item.plantNameTH,
          }));
          formatted.push({ value: "other", label: "อื่นๆ (โปรดระบุ)" });
          setPlantOptions(formatted);
        }
      } catch (error) {
        console.error("❌ โหลดพืชล้มเหลว:", error);
      }
    };
    fetchPlants();
  }, []);

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
    setFormData((prev) => ({
      ...prev,
      district: "",
      sub_district: "",
    }));
  };

  const handleDistrictChange = (value) => {
    handleChange("district")(value);
    const filteredSub = provinces
      .filter(
        (item) =>
          item.province === formData.province && item.district === value
      )
      .map((item) => item.sub_district);
    setSubDistricts(filteredSub);
    setPostcode("");
    setFormData((prev) => ({
      ...prev,
      sub_district: "",
    }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📦 ข้อมูลที่บันทึก:", {
      ...formData,
      postcode,
    });
  };

  const selectedLabel =
    plantOptions.find((opt) => opt.value === formData.regPlant)?.label || "";

  const cleanLabel =
    formData.regPlant === "other"
      ? formData.regPlantOther || "พืชอื่นๆ"
      : selectedLabel.replace(" (โปรดระบุ)", "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-white to-yellow-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10">
        <h2 className="text-3xl font-extrabold text-center text-amber-800 mb-8 tracking-tight flex items-center justify-center gap-3 hover:text-amber-900 transition">
          <GiFarmTractor size={45} className="animate-bounce-slow" />
          ลงทะเบียนเกษตรกร
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ชื่อ นามสกุล */}
          <ModernInput label="ชื่อ" value={formData.regName} onChange={handleChange("regName")} placeholder="กรอกชื่อ" ringColor="amber" />
          <ModernInput label="นามสกุล" value={formData.regSurname} onChange={handleChange("regSurname")} placeholder="กรอกนามสกุล" ringColor="amber" />
          <ModernInput label="เบอร์โทร" value={formData.regTel} onChange={handleChange("regTel")} placeholder="08xxxxxxxx" type="tel" ringColor="amber" />
          <ModernInput label="LINE ID" value={formData.regLineID} onChange={handleChange("regLineID")} placeholder="LINE ID ของคุณ" ringColor="amber" />

          {/* พืช */}
          <ModernSelect label="เลือกพืชที่ปลูก" value={formData.regPlant} onChange={handleChange("regPlant")} options={plantOptions} ringColor="amber" />
          {formData.regPlant === "other" && (
            <ModernInput label="ระบุพืชอื่นๆ" value={formData.regPlantOther} onChange={handleChange("regPlantOther")} placeholder="เช่น กล้วย มังคุด" ringColor="amber" />
          )}
          {formData.regPlant && (
            <>
              <ModernInput label={`โปรดระบุพันธุ์ของ "${cleanLabel}" ที่ท่านปลูก`} value={formData.regPlantSpecies} onChange={handleChange("regPlantSpecies")} placeholder="เช่น พันธุ์สุวรรณ 1 หรือ สายพันธุ์อื่นๆ" ringColor="amber" />
              <ModernInput label="จำนวนที่ปลูก" value={formData.regPlantAmount} onChange={handleChange("regPlantAmount")} placeholder="เช่น 100 ต้น หรือ 3 ไร่" ringColor="amber" />
              <ModernInput label="อายุของพืช" value={formData.regPlantAge} onChange={handleChange("regPlantAge")} placeholder="เช่น 2 เดือน หรือ 1 ปี" ringColor="amber" />
              {/* จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ + ที่อยู่ */}
          <ModernSelect label="จังหวัด" value={formData.province} onChange={handleProvinceChange} options={[...new Set(provinces.map((p) => p.province))].map((p) => ({ value: p, label: p }))} ringColor="amber" />
          
          {formData.province && (
            <ModernSelect label="อำเภอ" value={formData.district} onChange={handleDistrictChange} options={districts.map((d) => ({ value: d, label: d }))} ringColor="amber" />
          )}
          
          {formData.district && (
            <ModernSelect label="ตำบล" value={formData.sub_district} onChange={handleSubDistrictChange} options={subDistricts.map((s) => ({ value: s, label: s }))} ringColor="amber" />
          )}

          {formData.sub_district && (
            <>
              <ModernInput label="รหัสไปรษณีย์" value={postcode} onChange={(val) => setPostcode(val)} placeholder="รหัสไปรษณีย์" ringColor="amber" />
              <ModernInput label="ที่อยู่เพิ่มเติม (เช่น บ้านเลขที่/หมู่)" value={formData.addressDetail} onChange={handleChange("addressDetail")} placeholder="เช่น 123 หมู่ 4 บ้านโพน" ringColor="amber" />
            </>
          )}
            </>
          )}

          

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-600 text-white py-3 rounded-full font-semibold hover:from-amber-800 hover:to-yellow-700 shadow-lg transition-all duration-300">
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
    </div>
  );
}

export default FarmerFormPage;
