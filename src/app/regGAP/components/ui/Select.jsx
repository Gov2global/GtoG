"use client";
import React from "react";
import dynamic from "next/dynamic";

// Import react-select แบบ dynamic (ssr: false)
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function ModernSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  isMulti = false,
  disabled = false,
  className = "",
  placeholder,
}) {
  const optionObjs = options.map(opt =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  // สำหรับ multi, ต้อง map ให้เป็น object [{value, label}]
  const selectedValue = isMulti
    ? (Array.isArray(value)
        ? value.map(v => (typeof v === "string" ? { value: v, label: v } : v))
        : [])
    : value && typeof value === "string"
      ? optionObjs.find(o => o.value === value) || { value, label: value }
      : value;

  // --- Mobile-first Custom Styles ---
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: state.isFocused ? "#4ade80" : "#e5e7eb", // soft green/light gray
      minHeight: 38,
      fontSize: 15,
      paddingLeft: 2,
      background: disabled ? "#f1f5f9" : "#fff",
      boxShadow: state.isFocused ? "0 0 0 2px #bbf7d0" : "0 1px 2px 0 #0001",
      transition: "all .17s cubic-bezier(.4,0,.2,1)",
    }),
    valueContainer: base => ({
      ...base,
      padding: "2.5px 6px",
      gap: 5,
    }),
    input: base => ({
      ...base,
      fontSize: 15,
      margin: 0,
      padding: 0,
      color: "#134e4a"
    }),
    singleValue: base => ({
      ...base,
      fontWeight: 600,
      color: "#134e4a",
      fontSize: 15,
      letterSpacing: "0.01em"
    }),
    placeholder: base => ({
      ...base,
      fontSize: 15,
      color: "#64748b",
      fontWeight: 400,
      opacity: 0.8
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected
        ? "linear-gradient(90deg,#4ade80 60%,#06b6d4 100%)"
        : state.isFocused
          ? "#e0f2fe"
          : "#fff",
      color: state.isSelected ? "#fff" : "#0f172a",
      fontWeight: state.isSelected ? 700 : 500,
      borderRadius: 7,
      fontSize: 15,
      padding: "9px 14px",
      margin: 2,
      cursor: "pointer",
      transition: "background .17s",
    }),
    multiValue: base => ({
      ...base,
      background: "linear-gradient(90deg,#06b6d4,#38bdf8 80%)",
      borderRadius: 999,
      paddingLeft: 10,
      paddingRight: 5,
      minHeight: 28,
      boxShadow: "0 1px 2px #0ea5e933",
      alignItems: "center",
      margin: "1px 5px 1px 0",
      transition: "background .17s",
    }),
    multiValueLabel: base => ({
      ...base,
      color: "#fff",
      fontWeight: 500,
      fontSize: 15,
      padding: "2.5px 0",
      letterSpacing: 0.2,
    }),
    multiValueRemove: base => ({
      ...base,
      color: "#fff",
      borderRadius: "0 999px 999px 0",
      fontSize: 15,
      ":hover": {
        background: "#ef4444",
        color: "#fff",
      }
    }),
    indicatorsContainer: base => ({
      ...base,
      paddingRight: 3
    }),
    menu: base => ({
      ...base,
      borderRadius: 13,
      zIndex: 30,
      boxShadow: "0 4px 20px #0ea5e920"
    }),
    dropdownIndicator: base => ({
      ...base,
      color: "#06b6d4",
      padding: 3,
      ":hover": { color: "#4ade80" }
    }),
    clearIndicator: base => ({
      ...base,
      color: "#ef4444",
      padding: 3,
      ":hover": { color: "#dc2626" }
    }),
  };

  return (
    <div className={"mb-3 " + className}>
      <label className="block text-[15px] font-medium mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        isMulti={isMulti}
        isClearable={!required}
        isDisabled={disabled}
        name={name}
        value={selectedValue}
        options={optionObjs}
        onChange={opts => {
          if (isMulti) {
            onChange(opts ? opts.map(opt => opt.value) : []);
          } else {
            onChange(opts ? opts.value : "");
          }
        }}
        placeholder={placeholder || (isMulti ? "เลือกได้หลายรายการ" : "เลือก")}
        styles={customStyles}
        classNamePrefix="modern-select"
        menuPlacement="auto"
      />
    </div>
  );
}
