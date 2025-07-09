"use client";
import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import dayjs from "dayjs";
import liff from "@line/liff";
import dynamic from "next/dynamic";

// Import QRCode as client component only
const QRCode = dynamic(() => import("qrcode.react"), { ssr: false });

const LIFF_ID = "2007697520-6KRLnXVP";
const LOGO = "/logo.jpg";
const FARMER_ICON = "/farmer-icon.svg";

const uploadToS3 = async (file) => "https://dummyimage.com/200x200/cccccc/ffffff";

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

  // ดึงข้อมูล
  const createdAt = member?.createdAt ? dayjs(member.createdAt).format("DD/MM/YYYY") : "-";
  const expiredAt = member?.createdAt ? dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY") : "-";
  const regName = member?.regName ?? "-";
  const regSurname = member?.regSurname ?? "";
  const regType = member?.regType ?? "-";
  const regID = typeof member?.regID === "string" && member.regID.trim() ? member.regID : "NO-ID";

  // Debug log
  // console.log({ member, regID });

  if (loading)
    return (
      <div className="text-center py-12 text-lime-700">
        🌱 กำลังโหลดข้อมูลสมาชิก...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 py-12">
        {error}
        <Button className="mt-4" onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );
  if (!member)
    return (
      <div className="text-center text-red-500 py-12">
        ไม่พบข้อมูลสมาชิก <br /> กรุณาตรวจสอบการสมัครหรือลองใหม่
        <Button className="mt-4" onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gradient-to-br from-lime-100 via-white to-yellow-50">
      <Card
        className="relative max-w-sm w-full rounded-2xl border-0 shadow-2xl p-0 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8faf5 85%, #e3e6cc 100%)",
        }}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-2">
          <Image
            src={LOGO}
            width={38}
            height={38}
            alt="Logo"
            className="rounded-full border border-amber-200 bg-white shadow"
          />
          <div className="ml-2 text-lg font-bold text-green-800">
            บัตรสมาชิกเกษตรกร
          </div>
        </div>
        {/* Content */}
        <div className="relative px-6 pb-7 pt-1">
          {/* Profile + Info */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-[92px] h-[92px] rounded-xl bg-green-100 border-4 border-green-300 overflow-hidden shadow-lg mb-1">
              {profile ? (
                <Image
                  src={profile}
                  alt="profile"
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Image
                  src={FARMER_ICON}
                  alt="Farmer Icon"
                  fill
                  style={{ objectFit: "contain", opacity: 0.7 }}
                />
              )}
              <label className="absolute bottom-1 right-1 z-10">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                  aria-label="อัพโหลดรูปโปรไฟล์"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 bg-white/90 shadow rounded-lg border border-green-300 hover:bg-lime-100"
                  disabled={uploading}
                  aria-label="เปลี่ยนรูป"
                >
                  <span className="text-lg">📷</span>
                </Button>
              </label>
            </div>
            <div className="text-xs text-stone-400 mt-1">Profile</div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xl">🧑‍🌾</span>
              <span className="font-bold text-lg text-green-900">
                {regName} {regSurname}
              </span>
            </div>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-xl border border-green-300 mt-1">
              {regType}
            </span>
            <div className="flex flex-col items-center text-[13px] text-stone-600 mt-2">
              <span className="block">สมัคร: {createdAt}</span>
              <span className="block">หมดอายุ: {expiredAt}</span>
            </div>
          </div>
          {/* QR CODE มุมขวาล่าง */}
          <div className="absolute bottom-4 right-5 flex flex-col items-center">
            <div className="bg-white p-2 rounded-xl shadow border border-lime-200">
              {/* QRCode รับ regID */}
              {regID && (
                <QRCode
                  value={regID}
                  size={72}
                  includeMargin={false}
                  renderAs="svg"
                  aria-label={`QR code for ${regID}`}
                />
              )}
            </div>
            <span className="mt-2 text-xs text-green-800 bg-lime-100 border border-lime-300 px-2 py-1 rounded font-bold tracking-widest">
              {regID}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
