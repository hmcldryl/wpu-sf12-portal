"use client";

import { useState } from "react";
import { OTHER_OPTION } from "@/lib/respondentOptions";

interface SelectWithOtherProps {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  otherPlaceholder?: string;
}

export default function SelectWithOther({
  label,
  required,
  value,
  options,
  onChange,
  otherPlaceholder,
}: SelectWithOtherProps) {
  const [otherMode, setOtherMode] = useState(value !== "" && !options.includes(value));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={otherMode ? OTHER_OPTION : value}
        onChange={(e) => {
          if (e.target.value === OTHER_OPTION) {
            setOtherMode(true);
            onChange("");
          } else {
            setOtherMode(false);
            onChange(e.target.value);
          }
        }}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={OTHER_OPTION}>Other</option>
      </select>
      {otherMode && (
        <input
          type="text"
          placeholder={otherPlaceholder ?? `Please specify ${label.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
        />
      )}
    </div>
  );
}
