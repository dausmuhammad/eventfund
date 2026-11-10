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
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-sm">
          <Label htmlFor="event-search">Cari event</Label>
          <div className="relative">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"
            />
            <Input
              id="event-search"
              placeholder="Cari berdasarkan nama event…"
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
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">
          {archived ? "Event dalam arsip" : "Daftar event"}
        </h2>
        <p role="status" className="text-xs text-muted-foreground">
          {filtered.length} dari {events.length} event
        </p>
      </div>
      {filtered.length ? (
        <ul className="grid gap-4 xl:grid-cols-2">
          {filtered.map((event) => (
            <li key={event.id} className="min-w-0">
              <Card className="relative flex h-full flex-col overflow-hidden p-5 transition-colors hover:border-blue-300 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-primary">
                    <CalendarIcon className="size-5" aria-hidden="true" />
                  </span>
                  <StatusBadge
                    status={event.status}
                    archived={!!event.archivedAt}
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-tight">
                  <Link
                    href={`/events/${event.id}`}
                    className="after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-primary"
                  >
                    {event.name}
                  </Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {event.description || "Detail kegiatan siap Anda lengkapi."}
                </p>
                <div className="mb-5 mt-6 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <CalendarIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    {formatDate(event.startDate)}
                    {event.endDate && ` sampai ${formatDate(event.endDate)}`}
                  </p>
                  <p className="flex items-start gap-2">
                    <DrawingPinIcon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    {event.location || "Lokasi belum diisi"}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">
                    IDR · Asia/Jakarta
                  </span>
                  <span className="flex items-center gap-2 font-semibold text-primary">
                    Buka event
                    <ArrowRightIcon aria-hidden="true" />
                  </span>
                </div>
              </Card>
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
