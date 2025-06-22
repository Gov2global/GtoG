"use client";
import React, { useEffect, useState } from "react";
import FarmerFormPage from "./components/FarmerForm";
import PrivateAgency from "./components/PrivateAgency";
import GovernmentAgencies from "./components/GovernmentAgencies";
import LocalAuthority from "./components/LocalAuthority";
import EducationalInstitution from "./components/EducationalInstitution";
import Container from "./components/Container";
import { ModernSelect } from "./components/ui/Select";
import { MdOutlineLibraryBooks } from "react-icons/md";


function FormResgiPage() {
  const [step, setStep] = useState(1);
  const [typeFarmList, setTypeFarmList] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");

  useEffect(() => {
    const fetchTypeFarm = async () => {
      try {
        const res = await fetch("/api/farmer/get/typeFarm");
        const json = await res.json();
        if (json.success) {
          setTypeFarmList(json.data);
        }
      } catch (err) {
        console.error("❌ โหลด typeFarm ล้มเหลว", err);
      }
    };
    fetchTypeFarm();
  }, []);

  const handleTypeChange = (val) => {
    setSelectedType(val);
    setSelectedSubType("");
  };

  const handleSubTypeChange = (val) => {
    setSelectedSubType(val);
  };

  const handleNext = () => {
    if (selectedType && selectedSubType) {
      setStep(2);
    } else {
      alert("กรุณาเลือกประเภทและหมวดหมู่ให้ครบถ้วน");
    }
  };

  const getSubTypeOptions = () => {
    return typeFarmList
      .filter((item) => item.typeDetaiTH === selectedType)
      .map((item) => item.subType)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((s) => ({ value: s, label: s }));
  };

  return (
    <Container>
      {step === 1 && (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-yellow-50 to-yellow-100 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10 border border-yellow-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#9C4400] flex items-center justify-center gap-2">
              <MdOutlineLibraryBooks size={28} className="text-[#D97706]" />
              เลือกประเภทหน่วยงาน
            </h2>
            <p className="text-sm text-gray-500 mt-1">กรุณาเลือกประเภทหน่วยงานและหมวดหมู่ที่คุณต้องการลงทะเบียน</p>
          </div>

          <div className="space-y-5">
            <ModernSelect
              label="ประเภทหน่วยงาน"
              value={selectedType}
              onChange={handleTypeChange}
              options={[...new Set(typeFarmList.map((t) => t.typeDetaiTH))].map((t) => ({
                value: t,
                label: t,
              }))}
              placeholder="-- กรุณาเลือก --"
              ringColor="amber"
            />

            {selectedType && (
              <ModernSelect
                label="หมวดหมู่"
                value={selectedSubType}
                onChange={handleSubTypeChange}
                options={getSubTypeOptions()}
                placeholder="-- กรุณาเลือก --"
                ringColor="amber"
              />
            )}

            <button
              onClick={handleNext}
              className="mt-6 w-full bg-gradient-to-r from-[#D97706] to-[#9C4400] text-white text-lg py-3 rounded-full font-bold flex justify-center items-center gap-2 hover:from-[#B45309] hover:to-[#7C3A00] transition-all"
            >
              ถัดไป
              <span className="text-xl">➡️</span>
            </button>
          </div>
        </div>
      </div>
    )}
      {step === 2 && (
        <>
          {selectedType === "เกษตรกร" && <FarmerFormPage />}
          {selectedType === "หน่วยงานเอกชน" && <PrivateAgency />}
          {selectedType === "หน่วยงานราชการ" && <GovernmentAgencies />}
          {selectedType === "หน่วยงานท้องถิ่น" && <LocalAuthority />}
          {selectedType === "สถาบันการศึกษา" && <EducationalInstitution />}
        </>
      )}
    </Container>
  );
}

export default FormResgiPage;
