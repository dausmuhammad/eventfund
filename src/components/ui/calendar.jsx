"use client";
import { DayPicker } from "react-day-picker";
import { id } from "react-day-picker/locale";
import { cn } from "@/lib/utils";

export function Calendar({ className, ...props }) {
  return (
    <DayPicker
      locale={id}
      weekStartsOn={1}
      navLayout="around"
      className={cn("event-calendar", className)}
      labels={{
        labelNext: () => "Bulan berikutnya",
        labelPrevious: () => "Bulan sebelumnya",
      }}
      {...props}
    />
  );
}
