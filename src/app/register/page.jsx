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
import liff from "@line/liff";

function FormRegisPage() { // [CHANGED: แก้ชื่อ function]
  const [step, setStep] = useState(1);
  const [typeFarmList, setTypeFarmList] = useState([]);
  const [isLoadingTypeFarm, setIsLoadingTypeFarm] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [regLineID, setRegLineID] = useState("");
  const [regProfile, setRegProfile] = useState(null); // [CHANGED: เก็บ object profile]

  // ✅ Init LIFF
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login({ redirectUri: window.location.href }); // [CHANGED: ให้ redirect กลับมา]
          return;
        }
        const profile = await liff.getProfile();
        setRegLineID(profile.userId);
        setRegProfile(profile);

        // ✅ call API richmenu
        await fetch("/api/farmer/line/line-rich-menu-farmer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: profile.userId }),
        });
      } catch (err) {
        console.error("❌ LIFF init error:", err);
      }
    };
    initLiff();
  }, []);

  // ✅ โหลด typeFarm
  useEffect(() => {
    const fetchTypeFarm = async () => {
      setIsLoadingTypeFarm(true);
      try {
        const res = await fetch("/api/farmer/get/typeFarm");
        const json = await res.json();
        console.log("📌 typeFarm data:", json); // [ADDED: debug log]

        if (json.success && Array.isArray(json.data)) {
          setTypeFarmList(json.data);
        } else {
          console.warn("⚠️ ไม่มีข้อมูล typeFarm หรือ format ไม่ถูกต้อง");
          setTypeFarmList([]);
        }
      } catch (err) {
        console.error("❌ โหลด typeFarm ล้มเหลว", err);
        setTypeFarmList([]);
      }
      setIsLoadingTypeFarm(false);
    };
    fetchTypeFarm();
  }, []);

  // ✅ options
  const getTypeOptions = () => {
    return [...new Set(typeFarmList.map((t) => t.typeDetailTH || t.typeDetaiTH))] // [CHANGED: รองรับ key ทั้ง 2 แบบ]
      .filter(Boolean)
      .map((t) => ({ value: t, label: t }));
  };

  const getSubTypeOptions = () => {
    return typeFarmList
      .filter((item) => (item.typeDetailTH || item.typeDetaiTH) === selectedType) // [CHANGED: รองรับ key ทั้ง 2 แบบ]
      .map((item) => item.subType)
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((s) => ({ value: s, label: s }));
  };

  const handleTypeChange = (val) => {
    setSelectedType(val);
    setSelectedSubType("");
  };

  const handleSubTypeChange = (val) => {
    setSelectedSubType(val);
  };

  const handleNext = () => {
    if (selectedType && selectedSubType && !isLoadingTypeFarm) {
      setStep(2);
    } else {
      alert("กรุณาเลือกประเภทและหมวดหมู่ให้ครบถ้วน");
    }
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
              <p className="text-sm text-gray-500 mt-1">
                กรุณาเลือกประเภทหน่วยงานและหมวดหมู่ที่คุณต้องการลงทะเบียน
              </p>
            </div>
            <div className="space-y-5">
              {isLoadingTypeFarm ? (
                <div className="flex items-center justify-center py-8 text-amber-600">
                  <span className="animate-spin mr-2">⏳</span>
                  กำลังโหลดข้อมูลประเภทหน่วยงาน...
                </div>
              ) : typeFarmList.length === 0 ? (
                <div className="text-red-600 text-center py-6">
                  ❌ ไม่พบข้อมูลประเภทหน่วยงาน
                </div>
              ) : (
                <ModernSelect
                  label="ประเภทหน่วยงาน"
                  value={selectedType}
                  onChange={handleTypeChange}
                  options={getTypeOptions()}
                  placeholder="-- กรุณาเลือก --"
                  ringColor="amber"
                  disabled={isLoadingTypeFarm}
                />
              )}
              {selectedType && (
                <ModernSelect
                  label="หมวดหมู่"
                  value={selectedSubType}
                  onChange={handleSubTypeChange}
                  options={getSubTypeOptions()}
                  placeholder="-- กรุณาเลือก --"
                  ringColor="amber"
                  disabled={isLoadingTypeFarm}
                />
              )}
              <button
                onClick={handleNext}
                disabled={isLoadingTypeFarm}
                aria-label="ไปขั้นตอนถัดไป"
                className={`mt-6 w-full bg-gradient-to-r from-[#D97706] to-[#9C4400] text-white text-lg py-3 rounded-full font-bold flex justify-center items-center gap-2 hover:from-[#B45309] hover:to-[#7C3A00] transition-all
                  ${isLoadingTypeFarm ? "opacity-50 pointer-events-none" : ""}`}
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
          {selectedType === "เกษตรกร" && (
            <FarmerFormPage
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              regLineID={regLineID}
              regProfile={regProfile}
            />
          )}
          {selectedType === "หน่วยงานเอกชน" && (
            <PrivateAgency
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              regLineID={regLineID}
              regProfile={regProfile}
            />
          )}
          {selectedType === "หน่วยงานราชการ" && (
            <GovernmentAgencies
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              regLineID={regLineID}
              regProfile={regProfile}
            />
          )}
          {selectedType === "หน่วยงานท้องถิ่น" && (
            <LocalAuthority
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              regLineID={regLineID}
              regProfile={regProfile}
            />
          )}
          {selectedType === "สถาบันการศึกษา" && (
            <EducationalInstitution
              selectedType={selectedType}
              selectedSubType={selectedSubType}
              regLineID={regLineID}
              regProfile={regProfile}
            />
          )}
        </>
      )}
    </Container>
  );
}

export default FormRegisPage; // [CHANGED: export ตามชื่อใหม่]
