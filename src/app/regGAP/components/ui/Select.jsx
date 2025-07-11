import React from "react";
import CreatableSelect from "react-select/creatable";

export function ModernSelect({ label, value, onChange, options }) {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
      >
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

export function ModernCreatableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "เลือกหรือพิมพ์",
  ringColor = "amber",
  isMulti = false,
}) {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "1rem",
      borderColor: state.isFocused ? `#F59E0B` : "#D1D5DB",
      boxShadow: state.isFocused ? `0 0 0 3px rgba(251,191,36,0.3)` : "none",
      "&:hover": {
        borderColor: `#F59E0B`,
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "1rem",
      zIndex: 20,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "#FDE68A" // สีเหลืองอ่อนเมื่อ hover
        : "white",
      color: state.isDisabled ? "#ccc" : "#111827", // ถ้า disable ให้จาง, ปกติเป็นเทาเข้ม
      cursor: state.isDisabled ? "not-allowed" : "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#111827", // สีเทาเข้ม
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#1F2937", // สี text ใน tag
    }),
  };

  const selectedValue = isMulti
    ? Array.isArray(value)
      ? value.map((v) => (typeof v === "string" ? { value: v, label: v } : v))
      : []
    : typeof value === "string"
    ? { value, label: value }
    : value;

  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <CreatableSelect
        isMulti={isMulti}
        value={selectedValue}
        onChange={(option) => {
          if (isMulti) {
            onChange(option ? option.map((opt) => opt.value) : []);
          } else {
            onChange(option?.value || "");
          }
        }}
        options={options}
        styles={customStyles}
        placeholder={placeholder}
        isClearable
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: "#FEF3C7", // Hover option background (เหลืองอ่อน)
            primary: "#F59E0B",   // Border สี amber
          },
        })}
      />
    </div>
  );
}
