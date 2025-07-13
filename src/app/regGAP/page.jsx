"use client";
import React, { useState, useEffect } from "react";
import ModernInput from "./components/ui/Input";
import ModernSelect from "./components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Leaf, MapPin, User, FileText, ListChecks } from "lucide-react";
import liff from "@line/liff";

function RegisterGAPpage() {
  // --- State dropdown ---
  const [provinceData, setProvinceData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");

  // --- LIFF state ---
  const [regLineID, setRegLineID] = useState("");     // userId from LINE
  const [regProfile, setRegProfile] = useState("");   // displayName from LINE

  // --- Form State ---
  const [form, setForm] = useState({
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
    regProfile: "",
    farmName: "",
    fruitType: "",
    addressDetail: "",
    urlMAP: "",
    document: [],
    documentOther: [],
    demandFarmer: [],
    province: "",
    district: "",
    sub_district: "",
  });

  // --- Preview State ---
  const [previewMode, setPreviewMode] = useState(false);
  const [pendingGapID, setPendingGapID] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // --- Init LIFF + Autofill from backend ---
  useEffect(() => {
    liff.init({ liffId: "2007697520-m4qMPp1k" }).then(() => {
      if (liff.isLoggedIn()) {
        liff.getProfile().then(profile => {
          setRegLineID(profile.userId);
          setRegProfile(profile.displayName);

          fetch(`/api/farmer/get/line-get/${profile.userId}`)
            .then(res => res.json())
            .then(result => {
              if (result.success && result.data) {
                setForm(prev => ({
                  ...prev,
                  regName: result.data.regName || "",
                  regSurname: result.data.regSurname || "",
                  regTel: result.data.regTel || "",
                  regLineID: result.data.regLineID || profile.userId,
                  regProfile: result.data.regProfile || profile.displayName,
                }));
              } else {
                setForm(prev => ({
                  ...prev,
                  regLineID: profile.userId,
                  regProfile: profile.displayName,
                }));
              }
            });
        });
      } else {
        liff.login();
      }
    });
  }, []);

  // --- Fetch provinceData ---
  useEffect(() => {
    fetch("/api/farmer/get/province")
      .then(res => res.json())
      .then(result => {
        if (result.success) setProvinceData(result.data);
      });
  }, []);

  // --- Prepare dropdown data ---
  const provinces = [...new Set(provinceData.map(item => item.province))];
  const districts = selectedProvince
    ? [...new Set(provinceData.filter(item => item.province === selectedProvince).map(item => item.district))]
    : [];
  const subDistricts = selectedDistrict
    ? [...new Set(
        provinceData.filter(
          item => item.province === selectedProvince && item.district === selectedDistrict
        ).map(item => item.sub_district)
      )]
    : [];

  // --- Handle form change ---
  const handleChange = (key, value) => {
    if (key === "document") {
      if (Array.isArray(value) && !value.includes("อื่น")) {
        setForm(prev => ({
          ...prev,
          document: value,
          documentOther: [],
        }));
        return;
      }
    }
    if (key === "documentOther" && typeof value === "string") {
      setForm(prev => ({
        ...prev,
        documentOther: value ? [value] : [],
      }));
      return;
    }
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // --- Google Map Search Handler ---
  const getFullAddress = () => {
    const addressArr = [
      form.addressDetail,
      selectedSubDistrict,
      selectedDistrict,
      selectedProvince
    ].filter(Boolean);
    return addressArr.join(" ");
  };

  const handleMapSearch = () => {
    const address = getFullAddress();
    if (!form.addressDetail || !selectedProvince || !selectedDistrict || !selectedSubDistrict) {
      alert("กรุณากรอกที่อยู่ และเลือกตำบล/อำเภอ/จังหวัดให้ครบก่อนค้นหาแผนที่");
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    handleChange("urlMAP", url);
  };

  // --- Submit จริง ---
  const handleSubmitDirect = async (gapID) => {
    const fullForm = {
      ...form,
      gapID,
      document: Array.isArray(form.document) ? form.document : [],
      documentOther: Array.isArray(form.documentOther) ? form.documentOther : [],
      demandFarmer: Array.isArray(form.demandFarmer) ? form.demandFarmer : [],
      province: selectedProvince,
      district: selectedDistrict,
      sub_district: selectedSubDistrict,
    };

    try {
      const res = await fetch("/api/farmer/submit/regGAP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullForm)
      });
      const result = await res.json();
      if (result.success) {
        alert("ลงทะเบียนสำเร็จ! รหัสของคุณ: " + gapID);
        setForm({
          regName: "",
          regSurname: "",
          regTel: "",
          regLineID: regLineID,
          regProfile: regProfile,
          farmName: "",
          fruitType: "",
          addressDetail: "",
          urlMAP: "",
          document: [],
          documentOther: [],
          demandFarmer: [],
          province: "",
          district: "",
          sub_district: "",
        });
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedSubDistrict("");
        return true;
      } else {
        alert("เกิดข้อผิดพลาด: " + (result.error || "ไม่สามารถลงทะเบียนได้"));
        return false;
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดขณะส่งข้อมูล: " + err.message);
      return false;
    }
  };

  // --- ตรวจสอบใบสมัคร (Preview) ---
  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/farmer/gen-id-reggap");
      const { success, gapID } = await res.json();
      setPendingGapID(success ? gapID : "");
      setPreviewMode(true);
    } catch {
      alert("เกิดปัญหาขณะสร้างรหัส GAP กรุณาลองใหม่");
    }
    setLoadingPreview(false);
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-amber-50 flex items-center justify-center py-6">
      <form onSubmit={e => e.preventDefault()} className="w-full max-w-2xl">
        <Card className="w-full rounded-2xl shadow-lg border-0 px-6 py-7 md:px-10 md:py-9">
          <CardHeader>
            <div className="flex gap-3 items-center">
              <Leaf className="text-green-600" size={32} />
              <CardTitle className="text-2xl font-bold text-green-700">
                ลงทะเบียนเกษตรกร GAP
              </CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              กรุณากรอกข้อมูลตามความเป็นจริง เพื่อประโยชน์ในการเข้าร่วมโครงการ
            </p>
          </CardHeader>
          <CardContent>
            {/* Personal Info */}
            <section className="mb-7">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3 text-green-800">
                <User size={18} /> ข้อมูลส่วนตัว
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <ModernInput
                  label="ชื่อ"
                  name="regName"
                  value={form.regName}
                  onChange={v => handleChange("regName", v)}
                  required
                />
                <ModernInput
                  label="นามสกุล"
                  name="regSurname"
                  value={form.regSurname}
                  onChange={v => handleChange("regSurname", v)}
                  required
                />
                <ModernInput
                  label="เบอร์โทรศัพท์"
                  name="regTel"
                  type="tel"
                  value={form.regTel}
                  onChange={v => handleChange("regTel", v)}
                />
                <ModernInput
                  label="Line User ID"
                  name="regProfile"
                  value={form.regProfile || regProfile}
                  onChange={v => handleChange("regLineID", v)}
                  disabled
                />
              </div>
            </section>

            {/* Farm Info */}
            <section className="mb-7">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3 text-lime-800">
                <MapPin size={18} /> ข้อมูลฟาร์ม
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <ModernInput
                  label="ชื่อฟาร์ม"
                  name="farmName"
                  value={form.farmName}
                  onChange={v => handleChange("farmName", v)}
                />
                <ModernInput
                  label="ชนิดพืชที่ปลูก"
                  name="fruitType"
                  value={form.fruitType}
                  onChange={v => handleChange("fruitType", v)}
                  placeholder="เช่น มะม่วง, ทุเรียน, ลำไย"
                  required
                />
              </div>
              <ModernInput
                label="รายละเอียดที่อยู่"
                name="addressDetail"
                value={form.addressDetail}
                onChange={v => handleChange("addressDetail", v)}
                className="mt-4"
              />
              {/* Address Dropdown Modern */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mt-4">
                <ModernSelect
                  label="จังหวัด"
                  name="province"
                  value={selectedProvince}
                  onChange={val => {
                    setSelectedProvince(val);
                    setSelectedDistrict("");
                    setSelectedSubDistrict("");
                    setForm(prev => ({
                      ...prev,
                      province: val,
                      district: "",
                      sub_district: "",
                    }));
                  }}
                  options={provinces}
                  required
                />
                <ModernSelect
                  label="อำเภอ"
                  name="district"
                  value={selectedDistrict}
                  onChange={val => {
                    setSelectedDistrict(val);
                    setSelectedSubDistrict("");
                    setForm(prev => ({
                      ...prev,
                      district: val,
                      sub_district: "",
                    }));
                  }}
                  options={districts}
                  required
                  disabled={!selectedProvince}
                />
                <ModernSelect
                  label="ตำบล"
                  name="sub_district"
                  value={selectedSubDistrict}
                  onChange={val => {
                    setSelectedSubDistrict(val);
                    setForm(prev => ({
                      ...prev,
                      sub_district: val,
                    }));
                  }}
                  options={subDistricts}
                  required
                  disabled={!selectedDistrict}
                />
              </div>
              {/* ลิงก์ Google Map + ปุ่มค้นหา */}
              <div className="flex items-end gap-2 mt-4">
                <div className="flex-1">
                  <ModernInput
                    label="ลิงก์แผนที่ (Google Map)"
                    name="urlMAP"
                    value={form.urlMAP}
                    onChange={v => handleChange("urlMAP", v)}
                    inputClassName="h-12"
                    placeholder="ระบบจะกรอกให้อัตโนมัติหลังค้นหา"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleMapSearch}
                  className="h-12 px-6 rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-semibold shadow-sm flex items-center"
                  style={{ minWidth: 140 }}
                >
                  <MapPin className="inline-block mr-1 -mt-1" size={20} /> ค้นหาแผนที่
                </Button>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                * กดปุ่มเพื่อสร้างลิงก์ Google Maps ให้อัตโนมัติ
              </span>
            </section>

            {/* Document */}
            <section className="mb-7">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3 text-amber-800">
                <FileText size={18} /> เอกสารประกอบ
              </h3>
              <ModernSelect
                label="ประเภทเอกสารสิทธิ์"
                name="document"
                value={form.document}
                onChange={arr => handleChange("document", arr)}
                options={["โฉนด", "เช่า", "น.ส.3ก.", "ภ.บ.ท.5", "สปก.", "อื่น"]}
                isMulti
                required
              />
              {Array.isArray(form.document) && form.document.includes("อื่น") && (
                <ModernInput
                  label="โปรดระบุเอกสารสิทธิ์อื่นๆ"
                  name="documentOther"
                  value={form.documentOther[0] || ""}
                  onChange={v => handleChange("documentOther", v)}
                  className="mt-2"
                />
              )}
            </section>

            {/* Demand */}
            <section className="mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-3 text-sky-800">
                <ListChecks size={18} /> ความต้องการของเกษตรกร
              </h3>
              <ModernSelect
                label="ระบุความต้องการของท่าน"
                name="demandFarmer"
                value={form.demandFarmer}
                onChange={arr => handleChange("demandFarmer", arr)}
                options={[
                  "ขอ GAP ใหม่",
                  "ขอขึ้นทะเบียน GAP",
                  "ขอคำแนะนำการจัดการสวน",
                  "ขอใบรับรองส่งออก",
                  "ขอรับการตรวจแปลง"
                ]}
                isMulti
                required
              />
            </section>
            {/* ปุ่มตรวจสอบใบสมัคร */}
            <Button
              type="button"
              className="w-full h-12 mt-6 bg-gradient-to-r from-green-500 via-lime-400 to-amber-300 text-white font-bold text-lg shadow-md rounded-xl hover:scale-105 transition"
              onClick={handlePreview}
              disabled={loadingPreview}
            >
              {loadingPreview ? "กำลังตรวจสอบ..." : "ตรวจสอบใบสมัคร"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full">
            <h2 className="text-2xl font-bold mb-3 text-green-700 flex items-center gap-2">
              <FileText size={24} /> ตรวจสอบใบสมัคร
            </h2>
            <div className="space-y-2 mb-6 text-base">
              <div><b>รหัส GAP:</b> {pendingGapID || "กำลังสร้าง..."}</div>
              <div><b>ชื่อ-นามสกุล:</b> {form.regName} {form.regSurname}</div>
              <div><b>เบอร์โทร:</b> {form.regTel || "-"}</div>
              <div><b>ชื่อโปรไฟล์:</b> {form.regProfile || regProfile || "-"}</div>
              <div><b>ชื่อฟาร์ม:</b> {form.farmName || "-"}</div>
              <div><b>ชนิดพืช:</b> {form.fruitType}</div>
              <div><b>ที่อยู่:</b> {[form.addressDetail, selectedSubDistrict, selectedDistrict, selectedProvince].filter(Boolean).join(" ")}</div>
              <div>
                <b>Google Map:</b>{" "}
                {form.urlMAP ? (
                  <a href={form.urlMAP} target="_blank" className="text-blue-600 underline">ดูแผนที่</a>
                ) : "-"}
              </div>
              <div>
                <b>เอกสารสิทธิ์:</b> {(form.document || []).join(", ")}{" "}
                {form.document.includes("อื่น") && form.documentOther.length ? `(${form.documentOther[0]})` : ""}
              </div>
              <div><b>ความต้องการ:</b> {(form.demandFarmer || []).join(", ")}</div>
            </div>
            {/* เอกสารประกอบฉบับจริง */}
            <div className="border-t border-gray-200 mt-7 pt-5">
              <h3 className="text-lg font-semibold text-amber-700 mb-2">
                เอกสารประกอบฉบับจริงที่ควรเตรียมไว้:
              </h3>
              <ul className="list-disc list-inside text-base text-gray-700 space-y-1 pl-2">
                <li>สำเนาบัตรประชาชน <span className="text-gray-500">1 ชุด</span></li>
                <li>สำเนาทะเบียนบ้าน <span className="text-gray-500">1 ชุด</span></li>
                <li>สำเนาโฉนด/สัญญาเช่าที่ดิน <span className="text-gray-500">1 ชุด</span></li>
                <li>แบบแผนที่แปลง <span className="text-gray-500">(KML หรือเขียนมือก็ได้) 1 ชุด</span></li>
                <li>สมุดบันทึกการดูแลสวน <span className="text-gray-500">1 เล่ม</span></li>
              </ul>
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>แก้ไข</Button>
              <Button
                className="bg-green-600 text-white"
                onClick={async () => {
                  setPreviewMode(false);
                  const success = await handleSubmitDirect(pendingGapID);
                  if (success && liff && typeof liff.closeWindow === "function") {
                    liff.closeWindow();
                  }
                }}
              >
                ยืนยันส่งข้อมูล
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterGAPpage;
