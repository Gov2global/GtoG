"use client"; // [ADDED: ให้เป็น client component]

import { Label } from "@/components/ui/label"; // [ADDED]
import { Textarea } from "@/components/ui/textarea"; // [ADDED]

export default function Field({ label, value, onChange, rows = 3, placeholder = "" }) { // [ADDED: default export เพื่อ import ง่าย]
  return ( // [ADDED]
    <div className="space-y-1.5"> {/* [ADDED: ระยะห่างแนวตั้ง] */}
      <Label className="text-sm font-medium text-gray-700">{label}</Label> {/* [ADDED: ทำ label อ่านง่าย] */}
      <Textarea
        rows={rows}
        className="min-h-[96px] resize-y" // [ADDED: สูงเริ่มต้น + ยืดได้]
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
