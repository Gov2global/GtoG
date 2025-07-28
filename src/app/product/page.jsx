"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FaSeedling } from "react-icons/fa";
import liff from "@line/liff";

const CreatableSelect = dynamic(() => import("react-select/creatable"), {
  ssr: false,
});

const PLANT_OPTIONS = [
  { value: "ทุเรียน", label: "ทุเรียน" },
  { value: "ลำไย", label: "ลำไย" },
  { value: "ส้มเขียวหวาน", label: "ส้มเขียวหวาน" },
  { value: "ส้มโอ", label: "ส้มโอ" },
  { value: "อื่นๆ", label: "อื่นๆ" },
];

const colors = {
  bg: "#F7F7F3",
  card: "#FFFFFF",
  main: "#6FA471",
  accent: "#C7B198",
  text: "#355030",
  btn: "#FFD46B",
};

function ModernInput({ label, value, onChange, placeholder, type = "text", ringColor = "amber", ...rest }) {
  return (
    <div>
      <label className="block mb-1 text-[#355030] font-medium">{label}</label>
      <input
        className={`w-full rounded-xl border px-3 py-2 text-[#355030] shadow-sm focus:outline-none focus:ring-2 focus:ring-${ringColor}-200`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        {...rest}
      />
    </div>
  );
}

export default function ProductPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    farmName: "",
    plantTypes: [],
    areaRai: "",
    areaNgan: "",
    areaWa: "",
    estimate: "",
    period: "",
    note: "",
    regLineID: "",
  });
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function init() {
      await liff.init({ liffId: "2007697520-eb5NJ0jD" });

      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      const profile = await liff.getProfile();
      const lineID = profile.userId;

      setFormData((f) => ({ ...f, regLineID: lineID }));

      try {
        const res = await fetch("/api/farmer/get/register");
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          const found = result.data.find((item) => item.regLineID === lineID);

          if (found) {
            setFormData((f) => ({
              ...f,
              fullName: `${found.regName} ${found.regSurname}`,
              phone: found.regTel,
            }));
          } else {
            setFormData((f) => ({
              ...f,
              fullName: profile.displayName,
            }));
          }
        }
      } catch (err) {
        console.error("❌ Error fetching register:", err);
      } finally {
        setIsFetching(false);
      }
    }

    init();
  }, []);

  const handleChange = (field) => (e) => {
    setFormData((f) => ({
      ...f,
      [field]: e.target.value,
    }));
  };

  const handlePlantTypesChange = (selected) => {
    setFormData((f) => ({
      ...f,
      plantTypes: selected || [],
    }));
  };

  function calculateTotalAreaSqm() {
    const rai = parseInt(formData.areaRai) || 0;
    const ngan = parseInt(formData.areaNgan) || 0;
    const wa = parseInt(formData.areaWa) || 0;
    return rai * 1600 + ngan * 400 + wa * 4;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        plantTypes: formData.plantTypes.map((p) => p.value),
      };

      const res = await fetch("/api/farmer/gen-id-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("บันทึกสำเร็จ! รหัสแจ้งผลผลิต: " + data.proID);

        if (liff.isApiAvailable("sendMessages")) {
          await liff.sendMessages([
            {
              type: "flex",
              altText: "แจ้งผลผลิตสำเร็จ",
              contents: {
                type: "bubble",
                body: {
                  type: "box",
                  layout: "vertical",
                  spacing: "sm",
                  contents: [
                    { type: "text", text: "📦 แจ้งผลผลิตสำเร็จ", weight: "bold", size: "lg", color: "#6FA471" },
                    { type: "separator", margin: "md" },
                    { type: "text", text: `👤 ${formData.fullName}`, size: "md" },
                    { type: "text", text: `📞 ${formData.phone}`, size: "md" },
                    { type: "text", text: `🌿 ${formData.farmName}`, size: "md" },
                    { type: "text", text: `🪴 ${formData.plantTypes.map(p => p.label).join(", ")}`, size: "md" },
                    { type: "text", text: `📐 พื้นที่ ${calculateTotalAreaSqm()} ตร.ม.`, size: "md" },
                    { type: "text", text: `🆔 ${data.proID}`, size: "md", color: "#555" },
                  ],
                },
              },
            },
          ]);
        }

        liff.closeWindow();
      } else {
        alert("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
    }
    setLoading(false);
  };

  const cardStyle = {
    background: colors.card,
    borderRadius: "1.2rem",
    boxShadow: "0 4px 20px 0 rgba(107, 142, 35, 0.08)",
    maxWidth: 480,
    margin: "auto",
    marginTop: 36,
    padding: 28,
    border: `2px solid ${colors.accent}`,
  };

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 14,
      minHeight: 50,
      borderColor: "#6FA471",
      boxShadow: state.isFocused ? "0 0 0 2px #FFD46B" : "",
      "&:hover": { borderColor: "#5A9352" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#6FA471",
      borderRadius: 10,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#FFD46B",
      ":hover": { backgroundColor: "#4B8648", color: "#fff" },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

   return (
    <div style={{ background: colors.bg, minHeight: "100vh", padding: 24 }}>
      <form style={cardStyle} onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-5 text-center flex items-center justify-center gap-2" style={{ color: colors.main }}>
          <FaSeedling className="text-[#5A9352] text-3xl drop-shadow-sm" />
          แจ้งผลผลิต
        </h1>
        <div className="grid grid-cols-1 gap-3 mb-4">
          <ModernInput label="ชื่อ-สกุล" value={formData.fullName} onChange={handleChange("fullName")} placeholder="ระบุชื่อ-สกุล" />
          <ModernInput label="เบอร์โทรศัพท์" value={formData.phone} onChange={handleChange("phone")} placeholder="08xxxxxxxx" type="tel" maxLength={10} />
        </div>
        <ModernInput label="ชื่อสวน" value={formData.farmName} onChange={handleChange("farmName")} placeholder="ระบุชื่อสวน" />
        <div className="mt-4 mb-1">
          <div className="block mb-1 text-[#355030] font-medium">พืชที่แจ้งผลผลิต</div>
          <CreatableSelect
            isMulti
            options={PLANT_OPTIONS}
            value={formData.plantTypes}
            onChange={handlePlantTypesChange}
            placeholder="เลือกหรือพิมพ์เพิ่มได้"
            classNamePrefix="react-select"
            styles={customSelectStyles}
            noOptionsMessage={() => "ไม่พบข้อมูล"}
            formatCreateLabel={(inputValue) => `➕ เพิ่ม "${inputValue}"`}
          />
        </div>
        <div className="mt-4">
          <div className="block mb-1 text-[#355030] font-medium">พื้นที่ปลูก</div>
          <div className="grid grid-cols-3 gap-4">
            <ModernInput label="ไร่" value={formData.areaRai} onChange={handleChange("areaRai")} placeholder="0" type="number" />
            <ModernInput label="งาน" value={formData.areaNgan} onChange={handleChange("areaNgan")} placeholder="0" type="number" />
            <ModernInput label="ตารางวา" value={formData.areaWa} onChange={handleChange("areaWa")} placeholder="0" type="number" />
          </div>
          <p className="text-sm text-[#355030] mt-2">
            🧮 รวมพื้นที่ทั้งหมด: <strong>{calculateTotalAreaSqm()}</strong> ตารางเมตร
          </p>
        </div>
        <div className="mt-4">
          <ModernInput label="ประมาณผลผลิต (กก. หรือ ต้น)" value={formData.estimate} onChange={handleChange("estimate")} placeholder="เช่น 1000 กก. หรือ 50 ต้น" type="text" />
        </div>
        <div className="mt-4">
          <ModernInput label="ช่วงเวลาที่เก็บเกี่ยว" value={formData.period} onChange={handleChange("period")} placeholder="เช่น สิงหาคม - กันยายน" type="text" />
        </div>
        <div className="mt-4 mb-2">
          <label className="block mb-1 text-[#355030] font-medium">หมายเหตุ</label>
          <textarea
            className="w-full rounded-xl border px-3 py-2 text-[#355030] shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            value={formData.note}
            onChange={handleChange("note")}
            placeholder="เพิ่มเติม (ถ้ามี)"
            rows={3}
          />
        </div>
        <input type="hidden" value={formData.regLineID} name="regLineID" />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: colors.btn,
            color: "#66501A",
            borderRadius: 12,
            fontWeight: 600,
            width: "100%",
            padding: "0.75rem",
            marginTop: 8,
            fontSize: 18,
            boxShadow: "0 2px 10px 0 rgba(180,160,40,0.08)",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "กำลังส่งข้อมูล..." : "ส่งข้อมูล"}
        </button>
      </form>
    </div>
  );
}