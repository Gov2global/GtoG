"use client";
import React from "react";

export default function ModernSelect({ label, value, onChange, options }) {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
      >
        {/* ✅ แสดงแค่ครั้งเดียว */}
        <option value="">-- กรุณาเลือก --</option>

        {options.map((opt, index) => (
          <option key={opt.value || index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
