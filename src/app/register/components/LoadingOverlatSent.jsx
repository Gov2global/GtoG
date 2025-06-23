"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ✅ โหลดแบบ dynamic ป้องกัน SSR
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LoadingOverlay = ({ text = "กำลังส่งข้อมูล กรุณารอสักครู่..." }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/lottie/sent.json");
      const data = await res.json();
      setAnimationData(data);
    };
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center">
      {animationData && <Lottie animationData={animationData} loop className="w-130 h-130 mb-4" />}
      <p className="text-[#0076CE] text-lg font-semibold">{text}</p>
    </div>
  );
};

export default LoadingOverlay;
