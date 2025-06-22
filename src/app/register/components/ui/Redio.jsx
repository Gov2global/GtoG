// components/ModernRadioGroup.jsx
"use client";
import React from "react";

export default function ModernRadioGroup({ label, options, selected, onChange, name }) {
  return (
    <div className="w-full mb-4">
      <p className="block text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-blue-500 w-4 h-4"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
