// components/ModernInput.jsx
"use client";
import React from "react";

// components/ui/Input.js
export default function ModernInput({
  label,
  name,
  value,
  onChange,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block mb-1.5 text-gray-700 font-medium">
          {label}
        </label>
      )}
      <input
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition shadow-sm bg-white text-gray-800 text-base ${inputClassName}`}
        {...props}
      />
    </div>
  );
}
