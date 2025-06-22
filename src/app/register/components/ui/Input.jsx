// components/ModernInput.jsx
"use client";
import React from "react";

export default function ModernInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 shadow-sm transition duration-200"
      />
    </div>
  );
}
