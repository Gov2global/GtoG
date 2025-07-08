"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
import QRCode from "qrcode.react";
import dayjs from "dayjs";
import liff from "@line/liff";

const LIFF_ID = "2007697520-6KRLnXVP";

const uploadToS3 = async (file) => {
  // TODO: เปลี่ยนเป็น API จริง
  return "https://dummyimage.com/200x200/cccccc/ffffff";
};

function MemberCardPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        const profile = await liff.getProfile();
        const lineId = profile.userId;

        // ดึงข้อมูล member ด้วย lineId
        const res = await fetch(`/api/farmer/get/line-get/${lineId}`);
        const data = await res.json();

        if (data.success && data.data) {
          setMember(data.data);
          setProfile(data.data.regProfile || "");
        } else {
          setMember(null);
        }

        // ถ้าต้องการ call richmenu API สามารถเพิ่มฟังก์ชันนี้ทีหลัง (optional)
        // await fetch("/api/richmenu/set", { method: "POST", ... })

      } catch (err) {
        setMember(null);
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

      // TODO: PATCH/PUT ไป DB เพื่อบันทึก regProfile จริง
      // await fetch(`/api/farmer/update/profile`, {
      //   method: "PATCH",
      //   body: JSON.stringify({ regLineID: member.regLineID, regProfile: url }),
      //   headers: { "Content-Type": "application/json" },
      // });
    } catch (err) {
      alert("Upload รูปไม่สำเร็จ");
    }
    setUploading(false);
  };

  if (loading)
    return <div className="text-center py-8">กำลังโหลดข้อมูล...</div>;

  if (!member)
    return (
      <div className="text-center text-red-500 py-8">
        ไม่พบข้อมูลสมาชิก <br />
        กรุณาตรวจสอบการสมัครหรือลองใหม่
      </div>
    );

  const createdAt = member.createdAt
    ? dayjs(member.createdAt).format("DD/MM/YYYY")
    : "-";
  const expiredAt = member.createdAt
    ? dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY")
    : "-";

  return (
    <div className="flex justify-center py-8">
      <Card className="w-[360px] bg-stone-50/90 shadow-2xl rounded-2xl border-0 relative overflow-hidden">
        <CardContent className="flex gap-4 items-center p-6">
          {/* Profile Zone */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative w-20 h-20 rounded-full bg-stone-200 overflow-hidden border-2 border-primary mb-2">
              {profile ? (
                <Image
                  src={profile}
                  alt="profile"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="80px"
                />
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
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  disabled={uploading}
                >
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
