"use client";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarClient({ selected, onSelect }) {
  return (
    <Calendar mode="single" selected={selected} onSelect={onSelect} className="border rounded-md mt-2" />
  );
}
