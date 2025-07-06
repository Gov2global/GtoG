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

function FormResgiPage() {
  const [step, setStep] = useState(1);
  const [typeFarmList, setTypeFarmList] = useState([]);
  const [isLoadingTypeFarm, setIsLoadingTypeFarm] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [regLineID, setRegLineID] = useState("");
  const [regProfile, setRegProfile] = useState("");

  // ✅ Init LIFF + set regLineID/regProfile + set RichMenu ทันทีที่ user login
  useEffect(() => {
    liff
      .init({ liffId: "2007697520-g59jM8X3" })
      .then(() => {
        if (liff.isLoggedIn()) {
          liff.getProfile().then((profile) => {
            setRegLineID(profile.userId);
            setRegProfile(profile.displayName);

            // 🟢 Set RichMenu ทันทีเมื่อได้ userId
            fetch("/api/farmer/line/line-rich-menu-check-register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ regLineID: profile.userId }),
            })
              .then((res) => res.json())
              .then((data) => {
                console.log("RichMenu set result:", data);
              })
              .catch((err) => {
                console.error("RichMenu set error:", err);
              });
          });
        } else {
          liff.login();
        }
      })
      .catch((err) => {
        console.error("LIFF init error", err);
      });
  }, []);

  // ✅ โหลด typeFarm จาก backend
  useEffect(() => {
    const fetchTypeFarm = async () => {
      setIsLoadingTypeFarm(true);
      try {
        const res = await fetch("/api/farmer/get/typeFarm");
        const json = await res.json();
        if (json.success) {
          setTypeFarmList(json.data);
        }
      } catch (err) {
        console.error("❌ โหลด typeFarm ล้มเหลว", err);
      }
      setIsLoadingTypeFarm(false);
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
    if (selectedType && selectedSubType && !isLoadingTypeFarm) {
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
              ) : (
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

export default FormResgiPage;
