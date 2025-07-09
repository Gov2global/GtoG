"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Image from "next/image";
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

        // FETCH API ด้วย lineId
        const res = await fetch(`/api/farmer/get/line-get/${lineId}`);
        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("API response format ผิด");
        }

        // **** ต้อง setMember(data.data) เท่านั้น ****
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

  // --- UI Section --- //

  if (loading)
    return (
      <div className="text-center py-8 text-gray-500">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-8">
        {error}
        <br />
        <Button className="mt-4" onClick={() => window.location.reload()}>
          ลองใหม่
        </Button>
      </div>
    );

  if (!member)
    return (
      <div className="text-center text-red-500 py-8">
        ไม่พบข้อมูลสมาชิก <br />
        กรุณาตรวจสอบการสมัครหรือลองใหม่
      </div>
    );

  // DEBUG (dev): โชว์ JSON member ทุกครั้ง
  if (process.env.NODE_ENV !== "production") {
    return (
      <div className="p-4">
        <div className="mb-2 text-lg text-red-700 font-bold">DEBUG: member structure</div>
        <pre className="bg-gray-100 text-xs p-2 rounded border border-gray-300">
          {JSON.stringify(member, null, 2)}
        </pre>
        <div className="mt-3 text-gray-500">
          ดูว่าค่า member ถูกหรือไม่?<br />ถ้าเป็น <b>null</b> หรือไม่มี field ที่ต้องการ &rarr; ห้าม render JSX ที่ใช้ field เหล่านั้น
        </div>
      </div>
    );
  }

  // Extract ข้อมูล (กัน undefined ทุกจุด)
  const createdAt = member?.createdAt
    ? dayjs(member.createdAt).format("DD/MM/YYYY")
    : "-";
  const expiredAt = member?.createdAt
    ? dayjs(member.createdAt).add(1, "year").format("DD/MM/YYYY")
    : "-";
  const regName = typeof member?.regName === "string" ? member.regName : "-";
  const regSurname = typeof member?.regSurname === "string" ? member.regSurname : "";
  const regType = typeof member?.regType === "string" ? member.regType : "-";

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
          {/* Info Zone */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="font-bold text-lg">
              {regName} {regSurname}
            </div>
            <div className="text-sm text-primary">{regType}</div>
            <div className="text-xs text-gray-500">
              สมัคร: {createdAt}
              <br />
              หมดอายุ: {expiredAt}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MemberCardPage;
