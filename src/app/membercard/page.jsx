"use client";
import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import dayjs from "dayjs";
import liff from "@line/liff";
import QRCode from "react-qr-code";

const LIFF_ID = "2007697520-6KRLnXVP";
const LOGO = "/logo.jpg";
const FARMER_ICON = "/farmer-icon.svg";

// เปลี่ยนเป็น pattern จริงได้ภายหลัง (SVG/PNG)
const CARD_BG_PATTERN =
  "url('data:image/svg+xml;utf8,<svg width=\"400\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"60\" cy=\"50\" r=\"30\" fill=\"%23e0ffcb\" fill-opacity=\"0.25\"/><circle cx=\"300\" cy=\"150\" r=\"80\" fill=\"%23c0eec8\" fill-opacity=\"0.13\"/></svg>')";

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
        try { data = await res.json(); }
        catch { throw new Error("API response format ผิด"); }
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
    } catch {
      alert("Upload รูปไม่สำเร็จ");
    }
    setUploading(false);
  };

  // Format & Fallback
  const createdAt = member?.createdAt ? dayjs(member.createdAt).format("DD/MM/YYYY") : "-";
  const expiredAt = member?.createdAt ? dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY") : "-";
  const regName = member?.regName ?? "-";
  const regSurname = member?.regSurname ?? "";
  const regType = member?.regType ?? "-";
  const regID = member?.regID ? String(member.regID).trim() : "";

  if (loading)
    return <div className="text-center py-12 text-lime-700">🌱 กำลังโหลดข้อมูลสมาชิก...</div>;
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
    <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-lime-50 via-white to-yellow-50">
      <Card
        className="relative w-full max-w-[400px] rounded-3xl border-0 shadow-xl px-0 py-0 overflow-hidden"
        style={{
          background: `
            linear-gradient(120deg, #f9faed 75%, #f4f2e2 100%),
            ${CARD_BG_PATTERN}
          `,
          boxShadow: "0 12px 32px 0 rgba(108,157,80,0.10)",
          border: "1.5px solid #e5e6dc",
        }}
      >
        {/* Header - Center */}
        <div className="flex flex-col items-center justify-center pt-5 pb-1">
          <Image
            src={LOGO}
            width={44}
            height={44}
            alt="Logo"
            className="rounded-full border border-green-300 bg-white shadow"
          />
          <div className="mt-1 text-xl sm:text-2xl font-bold text-green-800 tracking-tight drop-shadow text-center">
            บัตรสมาชิกสหกรณ์ผลไม้คุณภาพ
          </div>
        </div>
        {/* Main Card Content */}
        <div className="flex flex-row items-stretch px-6 pb-7 pt-3 gap-4 w-full">
          {/* Profile ซ้าย */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-[72px] h-[72px] rounded-xl bg-green-100 border-2 border-green-400 overflow-hidden shadow-lg">
              {profile ? (
                <Image src={profile} alt="profile" fill style={{ objectFit: "cover" }} />
              ) : (
                <Image src={FARMER_ICON} alt="Farmer Icon" fill style={{ objectFit: "contain", opacity: 0.7 }} />
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
                  className="p-1 bg-white shadow rounded-lg border border-green-400 hover:bg-lime-100"
                  disabled={uploading}
                  aria-label="เปลี่ยนรูป"
                >
                  <span className="text-lg">📷</span>
                </Button>
              </label>
            </div>
            <div className="text-xs text-gray-400 mt-1">Profile</div>
          </div>
          {/* Main info center */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-base sm:text-md text-green-900 whitespace-normal break-words">
                {regName} {regSurname}
              </span>
            </div>
            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-xl border border-green-300 mb-1">
              {regType}
            </span>
            <div className="text-xs text-gray-600 mt-1">
              <div>สมัคร: <span className="font-medium">{createdAt}</span></div>
              <div>หมดอายุ: <span className="font-medium">{expiredAt}</span></div>
            </div>
          </div>
          {/* QR code ขวาสุด */}
          <div className="flex flex-col items-center justify-end ml-2">
            <div className="bg-white p-1.5 rounded-xl shadow border border-lime-200">
              {regID ? (
                <QRCode value={regID} size={50} />
              ) : (
                <span className="text-xs text-red-400">No QR</span>
              )}
            </div>
            <span className="mt-1 text-xs text-green-800 bg-lime-100 border border-lime-300 px-2 py-0.5 rounded font-bold tracking-widest select-all">
              {regID || "-"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
