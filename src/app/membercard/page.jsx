"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import dayjs from "dayjs";
import liff from "@line/liff";

const LIFF_ID = "2007697520-6KRLnXVP";
const LOGO = "/logo.jpg";
const FARMER_ICON = "/farmer-icon.svg"; // default icon

const uploadToS3 = async (file) => {
  // TODO: เปลี่ยนเป็น API จริง
  return "https://dummyimage.com/200x200/cccccc/ffffff";
};

export default function MemberCardPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMember = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        const profile = await liff.getProfile();
        if (!profile || !profile.userId) {
          setError("ไม่สามารถดึง Line ID ได้ กรุณาเปิดผ่านแอป LINE และให้สิทธิ์แอปนี้เข้าถึงข้อมูลบัญชี LINE ของคุณ");
          setLoading(false);
          return;
        }
        const lineId = profile.userId;

        const res = await fetch(`/api/farmer/get/line-get/${lineId}`);
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("API response format ผิด");
        }
        if (res.ok && data.success && data.data) {
          setMember(data.data);
          setProfile(data.data.regProfile || "");
        } else {
          setMember(null);
          setError(data?.message || "ไม่พบข้อมูลสมาชิกของคุณในระบบ");
        }
      } catch (err) {
        setMember(null);
        setError(err?.message || "เกิดข้อผิดพลาดขณะดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToS3(file);
      setProfile(url);
    } catch (err) {
      alert("Upload รูปไม่สำเร็จ");
    }
    setUploading(false);
  };

  // ข้อมูลสมาชิก
  const createdAt = member?.createdAt ? dayjs(member.createdAt).format("DD/MM/YYYY") : "-";
  const expiredAt = member?.createdAt ? dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY") : "-";
  const regName = typeof member?.regName === "string" ? member.regName : "-";
  const regSurname = typeof member?.regSurname === "string" ? member.regSurname : "";
  const regType = typeof member?.regType === "string" ? member.regType : "-";
  const regID = typeof member?.regID === "string" ? member.regID : "-"; // <-- เพิ่ม regID

  if (loading) return <div className="text-center py-12 text-lime-700">🌱 กำลังโหลดข้อมูลสมาชิก...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 py-12">
        {error}
        <Button className="mt-4" onClick={() => window.location.reload()}>ลองใหม่</Button>
      </div>
    );
  if (!member)
    return (
      <div className="text-center text-red-500 py-12">
        ไม่พบข้อมูลสมาชิก <br /> กรุณาตรวจสอบการสมัครหรือลองใหม่
        <Button className="mt-4" onClick={() => window.location.reload()}>ลองใหม่</Button>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-b from-lime-50 via-white to-stone-100">
      <Card className="relative max-w-md w-full bg-white/90 shadow-xl rounded-3xl border-0 px-6 py-7 flex gap-5 items-center"
        style={{
          background: "linear-gradient(120deg, #f6fde9 70%, #e6e5d8 100%)",
          boxShadow: "0 6px 40px 0 rgba(108,157,80,0.07)"
        }}
      >
        {/* LOGO */}
        <div className="absolute top-3 left-4">
          <Image src={LOGO} alt="logo" width={44} height={44} className="rounded-full shadow border border-green-200 bg-white" />
        </div>
        {/* Profile */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 rounded-full bg-lime-100 border-4 border-green-400 overflow-hidden shadow-inner">
            {profile ? (
              <Image
                src={profile}
                alt="profile"
                fill
                style={{ objectFit: "cover" }}
                sizes="96px"
              />
            ) : (
              <Image
                src={FARMER_ICON}
                alt="Farmer Icon"
                fill
                style={{ objectFit: "contain", opacity: 0.7 }}
                sizes="96px"
              />
            )}
            <label className="absolute bottom-1 right-1">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button
                variant="ghost"
                size="icon"
                className="p-1 bg-white shadow rounded-full border border-green-400 hover:bg-lime-100"
                disabled={uploading}
                aria-label="เปลี่ยนรูป"
              >
                <span className="text-lg">📷</span>
              </Button>
            </label>
          </div>
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 pl-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧑‍🌾</span>
            <span className="font-bold text-xl sm:text-2xl text-green-900 truncate">{regName} {regSurname}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-xl font-bold tracking-wide border border-green-300">{regType}</span>
            {regID && (
              <span className="text-xs bg-lime-200 text-lime-800 px-2 py-1 rounded font-semibold ml-2 tracking-wide border border-lime-300">
                รหัส: {regID}
              </span>
            )}
          </div>
          <div className="text-[13px] text-stone-600 mt-2 space-y-1">
            <span className="block">สมัคร: {createdAt}</span>
            <span className="block">หมดอายุ: {expiredAt}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
