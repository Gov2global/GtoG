"use client";
import React, { useState, useEffect, useRef } from "react";
import ModernInput from "./ui/Input";
import { ModernSelect, ModernCreatableSelect } from "./ui/Select";
import { GiFarmTractor } from "react-icons/gi";
import { DiCoda } from "react-icons/di";
import LoadingOverlay from "./LoadingOverlat";
import liff from "@line/liff";

// พันธุ์พืช (Hardcode)
const plantVarieties = {
  durian: ["พันธุ์หมอนทอง", "พันธุ์ชะนี", "พันธุ์ก้านยาว", "พันธุ์กระดุมทอง", "พันธุ์หลงลับแล", "พันธุ์หลิงลับแล"],
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
  // Form State
  const [formData, setFormData] = useState({
    regName: "",
    regProfile: "",
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
    regType: "",
    regSubType: "",
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

  // Autofill ค่า regProfile, regType, regSubType
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regProfile: regProfile || prev.regProfile,
    }));
  }, [regProfile]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      regType: selectedType || "",
      regSubType: selectedSubType || "",
    }));
  }, [selectedType, selectedSubType]);

  // Load Province
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then((res) => res.json())
      .then((json) => json.success && setProvinces(json.data))
      .catch((err) => console.error("❌ โหลดจังหวัดล้มเหลว:", err));
  }, []);

  // Load Plant
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

  // Change Handlers
  const handleChange = (field) => (value) => {
    setFormData((prev) => {
      if (field === "regPlant") {
        return { ...prev, regPlant: value, regPlantSpecies: [], regPlantOther: "" };
      }
      if (field === "regPlantSpecies") {
        return {
          ...prev,
          [field]: Array.isArray(value)
            ? value.map((v) => (typeof v === "string" ? v : v.value))
            : [value],
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // จังหวัด/อำเภอ/ตำบล
  const handleProvinceChange = (value) => {
    handleChange("province")(value);
    const filteredDistricts = [
      ...new Set(provinces.filter((p) => p.province === value).map((p) => p.district)),
    ];
    setDistricts(filteredDistricts);
    setSubDistricts([]);
    setPostcode("");
    setFormData((prev) => ({ ...prev, district: "", sub_district: "" }));
  };
  const handleDistrictChange = (value) => {
    handleChange("district")(value);
    const filteredSubDistricts = provinces
      .filter((p) => p.province === formData.province && p.district === value)
      .map((p) => p.sub_district);
    setSubDistricts(filteredSubDistricts);
    setPostcode("");
    setFormData((prev) => ({ ...prev, sub_district: "" }));
  };
  const handleSubDistrictChange = (value) => {
    handleChange("sub_district")(value);
    const found = provinces.find(
      (p) =>
        p.province === formData.province &&
        p.district === formData.district &&
        p.sub_district === value
    );
    setPostcode(found?.postcode?.toString() || "");
  };

  // พื้นที่รวม
  const calculateTotalAreaSqm = () => {
    const rai = parseFloat(formData.areaRai) || 0;
    const ngan = parseFloat(formData.areaNgan) || 0;
    const wa = parseFloat(formData.areaWa) || 0;
    return rai * 1600 + ngan * 400 + wa * 4;
  };

  // Validation (เพิ่มได้อีก)
  const validate = () => {
    if (!formData.regName) return "กรุณากรอกชื่อ";
    if (!formData.regSurname) return "กรุณากรอกนามสกุล";
    if (!formData.regTel) return "กรุณากรอกเบอร์โทร";
    if (!formData.regPlant) return "กรุณาเลือกพืชที่ปลูก";
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
      if (!idJson.success) throw new Error("ไม่สามารถสร้างรหัสเกษตรกรได้");

      const payload = {
        ...formData,
        regID: idJson.regID,
        regPlantSpecies: formData.regPlantSpecies.filter(Boolean),
        postcode,
        totalAreaSqm: calculateTotalAreaSqm(),
        regLineID: regLineID,
      };

      const submitRes = await fetch("/api/farmer/submit/farmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const submitJson = await submitRes.json();
      if (!submitJson.success) throw new Error(submitJson.message || "บันทึกข้อมูลล้มเหลว");

      // >>>>>>> เพิ่มตรงนี้: เรียก API ไปเปลี่ยน RichMenu <<<<<<<
      try {
        await fetch("/api/farmer/line/set-richmenu", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: regLineID }),
        });

      } catch (err) {
        console.error("เปลี่ยน RichMenu ไม่สำเร็จ:", err);
      }
      // <<<<<<<< End

      setSuccessMsg("✅ ลงทะเบียนสำเร็จ!");
      setTimeout(() => {
        setShowLoading(false);
        // ปิด LIFF window
        if (window?.liff) window.liff.closeWindow();
        else if (liff?.closeWindow) liff.closeWindow();
      }, 800);
    } catch (err) {
      setErrorMsg("❌ " + (err.message || "เกิดข้อผิดพลาด"));
      setShowLoading(false);
      isSubmitting.current = false;
    }
  };

  // Helper Select
  const selectedLabel = plantOptions.find((opt) => opt.value === formData.regPlant)?.label || "";
  const mappedKey = plantLabelMap[selectedLabel];
  const cleanLabel =
    formData.regPlant === "other"
      ? formData.regPlantOther || "พืชอื่นๆ"
      : selectedLabel.replace(" (โปรดระบุ)", "");

  const safePlantSpecies =
    Array.isArray(formData.regPlantSpecies) && formData.regPlantSpecies.every((item) => typeof item === "string")
      ? formData.regPlantSpecies.map((v) => ({ value: v, label: v }))
      : [];
  const safeOptions = Array.isArray(plantVarieties?.[mappedKey])
    ? plantVarieties[mappedKey].filter(Boolean).map((v) => ({ value: v, label: v }))
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-100 via-white to-yellow-200 p-4">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl px-8 py-10" role="main">
        <h2 className="text-3xl font-extrabold text-center text-amber-800 mb-8 tracking-tight flex items-center justify-center gap-3 hover:text-amber-900 transition">
          <GiFarmTractor size={45} className="animate-bounce-slow" aria-hidden />
          ลงทะเบียนเกษตรกร
        </h2>
        {errorMsg && (
          <div className="mb-4 text-red-700 bg-red-100 rounded-lg px-4 py-2">{errorMsg}</div>
        )}
        {successMsg && (
          <div className="mb-4 text-green-700 bg-green-100 rounded-lg px-4 py-2">{successMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="ฟอร์มลงทะเบียนเกษตรกร">
          <ModernInput
            label="ชื่อ"
            value={formData.regName}
            onChange={handleChange("regName")}
            placeholder="กรอกชื่อ"
            ringColor="amber"
            autoFocus
          />
          <ModernInput
            label="นามสกุล"
            value={formData.regSurname}
            onChange={handleChange("regSurname")}
            placeholder="กรอกนามสกุล"
            ringColor="amber"
          />
          <ModernInput
            label="เบอร์โทร"
            value={formData.regTel}
            onChange={handleChange("regTel")}
            placeholder="08xxxxxxxx"
            type="tel"
            ringColor="amber"
          />
          <ModernInput
            label="ID LINE"
            value={formData.regProfile}
            onChange={handleChange("regProfile")}
            placeholder="กรุณากรอกชื่อ LINE"
            ringColor="amber"
          />
          <ModernSelect
            label="เลือกพืชที่ปลูก"
            value={formData.regPlant}
            onChange={handleChange("regPlant")}
            options={plantOptions}
            ringColor="amber"
          />

          {formData.regPlant === "other" && (
            <ModernInput
              label="ระบุพืชอื่นๆ"
              value={formData.regPlantOther}
              onChange={handleChange("regPlantOther")}
              placeholder="เช่น กล้วย มังคุด"
              ringColor="amber"
            />
          )}

          {formData.regPlant && (
            <>
              {mappedKey && plantVarieties[mappedKey] ? (
                <ModernCreatableSelect
                  label={`เลือกหรือพิมพ์พันธุ์ของ "${selectedLabel}"`}
                  value={safePlantSpecies}
                  onChange={handleChange("regPlantSpecies")}
                  options={safeOptions}
                  ringColor="amber"
                  isMulti
                />
              ) : (
                <ModernInput
                  label={`โปรดระบุพันธุ์ของ "${cleanLabel}" ที่ท่านปลูก`}
                  value={formData.regPlantSpecies?.[0] || ""}
                  onChange={(v) =>
                    setFormData((prev) => ({ ...prev, regPlantSpecies: [v] }))
                  }
                  placeholder="เช่น พันธุ์สุวรรณ 1 หรือ สายพันธุ์อื่นๆ"
                  ringColor="amber"
                />
              )}

              <ModernInput
                label="จำนวนที่ปลูก (ต้น)"
                value={formData.regPlantAmount}
                onChange={handleChange("regPlantAmount")}
                placeholder="เช่น 100 ต้น"
                ringColor="amber"
              />
              <ModernInput
                label="อายุของพืช"
                value={formData.regPlantAge}
                onChange={handleChange("regPlantAge")}
                placeholder="เช่น 2 เดือน หรือ 1 ปี"
                ringColor="amber"
              />

              <h3 className="text-xl font-semibold text-amber-700 mb-2 mt-4">
                พื้นที่ที่ปลูก
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <ModernInput
                  label="ไร่"
                  value={formData.areaRai}
                  onChange={handleChange("areaRai")}
                  placeholder="0"
                  type="number"
                  ringColor="amber"
                />
                <ModernInput
                  label="งาน"
                  value={formData.areaNgan}
                  onChange={handleChange("areaNgan")}
                  placeholder="0"
                  type="number"
                  ringColor="amber"
                />
                <ModernInput
                  label="ตารางวา"
                  value={formData.areaWa}
                  onChange={handleChange("areaWa")}
                  placeholder="0"
                  type="number"
                  ringColor="amber"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                🧮 รวมพื้นที่ทั้งหมด:{" "}
                <strong>{calculateTotalAreaSqm()}</strong> ตารางเมตร
              </p>

              <ModernSelect
                label="จังหวัด"
                value={formData.province}
                onChange={handleProvinceChange}
                options={[
                  ...new Set(provinces.map((p) => p.province)),
                ].map((p) => ({ value: p, label: p }))}
                ringColor="amber"
              />
              {formData.province && (
                <ModernSelect
                  label="อำเภอ"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  options={districts.map((d) => ({ value: d, label: d }))}
                  ringColor="amber"
                />
              )}
              {formData.district && (
                <ModernSelect
                  label="ตำบล"
                  value={formData.sub_district}
                  onChange={handleSubDistrictChange}
                  options={subDistricts.map((s) => ({ value: s, label: s }))}
                  ringColor="amber"
                />
              )}
              {formData.sub_district && (
                <>
                  <ModernInput
                    label="รหัสไปรษณีย์"
                    value={postcode}
                    onChange={(val) => setPostcode(val)}
                    placeholder="รหัสไปรษณีย์"
                    ringColor="amber"
                  />
                  <ModernInput
                    label="ที่อยู่เพิ่มเติม (เช่น บ้านเลขที่/หมู่)"
                    value={formData.addressDetail}
                    onChange={handleChange("addressDetail")}
                    placeholder="เช่น 123 หมู่ 4 บ้านโพน"
                    ringColor="amber"
                  />
                </>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={showLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-yellow-600 text-white py-3 rounded-full font-semibold hover:from-amber-800 hover:to-yellow-700 shadow-lg transition-all duration-300"
            aria-busy={showLoading}
          >
            <DiCoda size={22} className="opacity-90" />
            ลงทะเบียน
          </button>
        </form>
      </div>
      {showLoading && <LoadingOverlay />}
    </div>
  );
}

export default FarmerFormPage;
