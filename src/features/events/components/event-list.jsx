"use client";
import Link from "next/link";
import { useState } from "react";
import {
  CalendarIcon,
  DrawingPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowRightIcon,
  ArchiveIcon,
} from "@radix-ui/react-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
export function formatDate(value) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "Tanggal belum diatur";
}
export function EventList({ events, archived }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = events.filter(
    (event) =>
      event.name
        .toLocaleLowerCase("id-ID")
        .includes(query.trim().toLocaleLowerCase("id-ID")) &&
      (status === "all" || event.status === status),
  );
  return (
    <>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-sm">
          <Label htmlFor="event-search">Cari event</Label>
          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <Input
              id="event-search"
              placeholder="Cari nama event…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="status-filter">Status event</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                ["all", "Semua status"],
                ["DRAFT", "Draft"],
                ["PLANNED", "Direncanakan"],
                ["ACTIVE", "Berlangsung"],
                ["COMPLETED", "Selesai"],
                ["CANCELLED", "Dibatalkan"],
              ].map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {archived ? "Event dalam arsip" : "Daftar event"}
        </h2>
        <p role="status" className="text-xs text-muted-foreground">
          {filtered.length} dari {events.length} event
        </p>
      </div>
      {filtered.length ? (
        <ul className="overflow-hidden rounded-xl border border-border bg-white divide-y divide-border">
          {filtered.map((event) => (
            <li key={event.id} className="min-w-0">
              <div className="event-row group relative grid gap-4 p-5 transition-colors hover:bg-slate-50 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center justify-between sm:contents">
                  <span
                    className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-primary"
                    aria-hidden="true"
                  >
                    {event.startDate ? (
                      <>
                        <span className="text-[11px] font-semibold">
                          {new Intl.DateTimeFormat("id-ID", {
                            month: "short",
                            timeZone: "UTC",
                          }).format(new Date(event.startDate))}
                        </span>
                        <span className="text-2xl font-semibold leading-tight">
                          {new Date(event.startDate).getUTCDate()}
                        </span>
                      </>
                    ) : (
                      <CalendarIcon className="size-6" />
                    )}
                  </span>
                  <div className="sm:hidden">
                    <StatusBadge
                      status={event.status}
                      archived={!!event.archivedAt}
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                    <Link
                      href={`/events/${event.id}`}
                      className="after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-primary"
                    >
                      {event.name}
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted-foreground">
                    {event.description || "Detail kegiatan siap Anda lengkapi."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <CalendarIcon
                        aria-hidden="true"
                        className="size-4 shrink-0"
                      />
                      {formatDate(event.startDate)}
                      {event.endDate && ` sampai ${formatDate(event.endDate)}`}
                    </p>
                    <p className="flex items-start gap-2">
                      <DrawingPinIcon
                        aria-hidden="true"
                        className="size-4 shrink-0"
                      />
                      {event.location || "Lokasi belum diisi"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm sm:flex-col sm:items-end sm:gap-4 sm:border-0 sm:pt-0">
                  <div className="hidden sm:block">
                    <StatusBadge
                      status={event.status}
                      archived={!!event.archivedAt}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground sm:hidden">
                    IDR · Asia/Jakarta
                  </span>
                  <span className="event-open flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    Buka event
                    <ArrowRightIcon aria-hidden="true" />
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <span className="mb-5 flex size-14 items-center justify-center rounded-xl bg-blue-50 text-primary">
            {archived ? (
              <ArchiveIcon className="size-6" aria-hidden="true" />
            ) : (
              <CalendarIcon className="size-6" aria-hidden="true" />
            )}
          </span>
          <h3 className="text-xl font-semibold">
            {events.length
              ? "Event tidak ditemukan"
              : archived
                ? "Belum ada event diarsipkan"
                : "Ruang untuk kegiatan berikutnya"}
          </h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {events.length
              ? "Coba kata pencarian atau status lain."
              : archived
                ? "Event yang selesai atau dibatalkan dapat Anda simpan di sini."
                : "Buat event pertama Anda. Mulai dengan nama kegiatan, lalu lengkapi jadwal dan lokasinya."}
          </p>
          {events.length ? (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
            >
              Hapus filter
            </Button>
          ) : (
            !archived && (
              <Button asChild className="mt-6">
                <Link href="/events/new">
                  <PlusIcon aria-hidden="true" className="mr-2" />
                  Buat event pertama
                </Link>
              </Button>
            )
          )}
        </Card>
      )}
    </>
  );
}
