"use client";
import React, { useState, useEffect } from "react";
import ModernInput from "./components/ui/Input";
import ModernSelect from "./components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Leaf, MapPin, User, FileText, ListChecks } from "lucide-react";

function RegisterGAPpage() {
  // --- State dropdown ---
  const [provinceData, setProvinceData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubDistrict, setSelectedSubDistrict] = useState("");

  // --- Form State ---
  const [form, setForm] = useState({
    regName: "",
    regSurname: "",
    regTel: "",
    regLineID: "",
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
    // document logic
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
    if ((key === "fruitType" || key === "demandFarmer") && typeof value === "string") {
      setForm(prev => ({
        ...prev,
        [key]: value ? value.split(",").map(i => i.trim()).filter(Boolean) : [],
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
    // window.open(url, "_blank");
  };

  // --- Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    // fullForm พร้อมส่งตรง schema MongoDB
    const fullForm = {
      ...form,
      fruitType: Array.isArray(form.fruitType) ? form.fruitType : (form.fruitType ? [form.fruitType] : []),
      document: Array.isArray(form.document) ? form.document : [],
      documentOther: Array.isArray(form.documentOther) ? form.documentOther : (form.documentOther ? [form.documentOther] : []),
      demandFarmer: Array.isArray(form.demandFarmer) ? form.demandFarmer : [],
    };
    alert(JSON.stringify(fullForm, null, 2));
    // TODO: ส่งไป backend หรือ validate เพิ่มเติม
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-amber-50 flex items-center justify-center py-6">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
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
                  label="Line ID"
                  name="regLineID"
                  value={form.regLineID}
                  onChange={v => handleChange("regLineID", v)}
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
                value={form.fruitType} // string ธรรมดา
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
            <Button
              type="submit"
              className="w-full h-12 mt-6 bg-gradient-to-r from-green-500 via-lime-400 to-amber-300 text-white font-bold text-lg shadow-md rounded-xl hover:scale-105 transition"
            >
              ลงทะเบียน
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default RegisterGAPpage;
