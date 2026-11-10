"use client";
import { useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Input } from "./input";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/components/shared/use-is-mobile";
import { ResponsivePicker } from "./responsive-picker";

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value
    ? date
    : undefined;
}
function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function DatePicker({
  defaultValue = "",
  label,
  onValueChange,
  open,
  onOpenChange,
  id,
  name,
  ...props
}) {
  const [value, setValue] = useState(defaultValue);
  const [manual, setManual] = useState(false);
  const [month, setMonth] = useState(
    () => parseDate(defaultValue) || new Date(),
  );
  const mobile = useIsMobile();
  const selected = parseDate(value);
  function update(next) {
    setValue(next);
    onValueChange?.(next);
  }
  function close() {
    onOpenChange(false);
  }
  function changeOpen(next) {
    if (next) {
      setMonth(selected || new Date());
      setManual(false);
    }
    onOpenChange(next);
  }
  return (
    <div className="min-w-0">
      <input type="hidden" name={name} value={value} />
      <ResponsivePicker
        mobile={mobile}
        open={open}
        onOpenChange={changeOpen}
        title={`Kalender ${label.toLowerCase()}`}
        trigger={
          <Button
            {...props}
            id={id}
            type="button"
            variant="outline"
            aria-expanded={open}
            className={cn(
              "date-trigger w-full justify-start gap-3 text-left text-base font-normal md:text-sm",
              open && "border-primary bg-blue-50/60 ring-2 ring-primary/10",
            )}
          >
            <CalendarIcon
              className="size-[18px] shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <span className={cn("min-w-0 flex-1", !value && "text-slate-500")}>
              {selected
                ? new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(selected)
                : value || "Pilih tanggal"}
            </span>
            <ChevronDownIcon
              className={cn(
                "size-4 shrink-0 text-slate-500 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </Button>
        }
      >
        {!manual && (
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            selected={selected}
            onSelect={(date) => {
              update(date ? formatDate(date) : "");
              close();
            }}
          />
        )}
        {manual && (
          <div className="space-y-3 px-1 py-3">
            <Label htmlFor={`${id}-manual`}>Ketik {label.toLowerCase()}</Label>
            <Input
              id={`${id}-manual`}
              value={value}
              placeholder="YYYY-MM-DD"
              maxLength={10}
              onChange={(event) => {
                update(event.target.value);
                const date = parseDate(event.target.value);
                if (date) setMonth(date);
              }}
              aria-describedby={`${id}-format`}
            />
            <p
              id={`${id}-format`}
              className="mt-1.5 text-xs text-muted-foreground"
            >
              Format tahun-bulan-tanggal, contoh 2026-11-12.
            </p>
            {!mobile && (
              <Button type="button" className="w-full" onClick={close}>
                Selesai
              </Button>
            )}
          </div>
        )}
        <div className="calendar-commands mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-border pt-3">
          <Button
            type="button"
            variant="ghost"
            className="px-2"
            onClick={() => setManual(!manual)}
          >
            {manual ? "Lihat kalender" : "Ketik tanggal"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="px-2"
            onClick={() => {
              update("");
              close();
            }}
          >
            Kosongkan
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-2"
            onClick={() => {
              update(formatDate(new Date()));
              close();
            }}
          >
            Hari ini
          </Button>
        </div>
      </ResponsivePicker>
    </div>
  );
}
