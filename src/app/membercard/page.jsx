"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import QRCode from "qrcode.react"; // หรือ qrcode-svg, ติดตั้งเพิ่มได้
import dayjs from "dayjs";

// Mock liff & AWS S3 (ปรับใช้จริงตาม infra)
const mockLiffGetLineID = () => "user-lineid-xxxx";
const uploadToS3 = async (file) => {
  // TODO: เปลี่ยนเป็น API อัพโหลด S3 จริง
  return "https://dummyimage.com/200x200/cccccc/ffffff";
};

function MemberCardPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState("");
  const [uploading, setUploading] = useState(false);

  // 1. Get LineID from LIFF
  useEffect(() => {
    const lineId = mockLiffGetLineID(); // เปลี่ยนเป็น liff.getProfile().userId
    fetch(`/api/farmer/get/register/line/${lineId}`) // ควรเขียน route ให้ query by LineID
      .then((res) => res.json())
      .then((data) => {
        setMember(data.data || null);
        setProfile(data.data?.regProfile || "");
        setLoading(false);
      });
  }, []);

  // 2. Handle Upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToS3(file); // อัพจริงเชื่อม S3
    setProfile(url);
    // TODO: Save URL to regProfile field in DB (API PATCH/PUT)
    setUploading(false);
  };

  if (loading) return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;
  if (!member)
    return <div className="text-center text-red-500 py-8">ไม่พบข้อมูลสมาชิก</div>;

  // วันที่สมัคร+หมดอายุ
  const createdAt = dayjs(member.createdAt).format("DD/MM/YYYY");
  const expiredAt = dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY");

  return (
    <div className="flex justify-center py-8">
      <Card className="w-[360px] bg-white/80 shadow-2xl rounded-2xl border-0 relative overflow-hidden">
        <CardContent className="flex gap-4 items-center p-6">
          {/* Profile Zone */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-primary mb-2">
              {profile ? (
                <Image src={profile} alt="profile" fill style={{ objectFit: "cover" }} />
              ) : (
                <span className="text-xs text-gray-500 flex items-center justify-center w-full h-full">
                  ไม่มีรูป
                </span>
              )}
            </div>
            {!profile && (
              <label>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                <Button variant="outline" size="sm" className="mt-1" disabled={uploading}>
                  {uploading ? "กำลังอัปโหลด..." : "ถ่าย/อัปโหลดรูป"}
                </Button>
              </label>
            )}
          </div>
          {/* Info + QR Zone */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="font-bold text-lg">
              {member.regName} {member.regSurname}
            </div>
            <div className="text-sm text-primary">{member.regType}</div>
            <div className="text-xs text-gray-500">
              สมัคร: {createdAt}
              <br />
              หมดอายุ: {expiredAt}
            </div>
            <div className="flex justify-end mt-2">
              <QRCode value={member.regID} size={60} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MemberCardPage;
