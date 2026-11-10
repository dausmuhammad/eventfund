import Link from "next/link";
import {
  CalendarIcon,
  GearIcon,
  CopyIcon,
  DrawingPinIcon,
  FileTextIcon,
  CheckIcon,
  ChevronLeftIcon,
} from "@radix-ui/react-icons";
import { pageUser, pageEvent } from "@/features/events/page-context";
import { listEvents, serializeEvent } from "@/features/events/service";
import { EventSwitcher } from "@/features/events/components/event-switcher";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function date(value) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(value)
    : "Belum diatur";
}
export default async function EventPage({ params }) {
  const user = await pageUser();
  const event = await pageEvent(user, (await params).eventId);
  const events = await listEvents(user);
  const checklist = [
    ["Nama kegiatan", true],
    ["Jadwal kegiatan", !!event.startDate],
    ["Lokasi kegiatan", !!event.location],
    ["Deskripsi kegiatan", !!event.description],
  ];
  const completed = checklist.filter(([, done]) => done).length;
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/events"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeftIcon aria-hidden="true" />
          Semua event
        </Link>
        <EventSwitcher
          events={serializeEvent(events.map(({ id, name }) => ({ id, name })))}
          currentId={event.id}
        />
      </div>
      <section className="mb-4 overflow-hidden rounded-xl border border-[#254681] bg-[#19345f] text-white">
        <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 xl:flex-row xl:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-blue-100">
                Ringkasan event
              </span>
              <StatusBadge
                status={event.status}
                archived={!!event.archivedAt}
              />
            </div>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {event.name}
            </h1>
          </div>
          <div className="event-summary-actions">
            <Button
              variant="outline"
              asChild
              className="gap-2 border-white/50 bg-transparent px-3 text-white hover:bg-white/10 active:bg-white/15"
            >
              <Link
                href={`/events/${event.id}/duplicate`}
                aria-label="Duplikasi event"
              >
                <CopyIcon className="shrink-0" aria-hidden="true" />
                Duplikasi
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="gap-2 border-white bg-white px-3 text-[#19345f] hover:bg-blue-50"
            >
              <Link
                href={`/events/${event.id}/settings`}
                aria-label="Pengaturan event"
              >
                <GearIcon className="shrink-0" aria-hidden="true" />
                Pengaturan
              </Link>
            </Button>
          </div>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-white/15 border-t border-white/15 bg-white/5">
          <div className="flex min-w-0 gap-2 px-4 py-3 sm:px-5">
            <CalendarIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-blue-200"
            />
            <div className="min-w-0">
              <dt className="text-xs text-blue-100">Jadwal</dt>
              <dd className="mt-1 text-sm font-medium">
                {date(event.startDate)}
                {event.endDate && (
                  <span className="font-normal text-blue-100">
                    {" "}
                    sampai {date(event.endDate)}
                  </span>
                )}
              </dd>
            </div>
          </div>
          <div className="flex min-w-0 gap-2 px-4 py-3 sm:px-5">
            <DrawingPinIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-blue-200"
            />
            <div className="min-w-0">
              <dt className="text-xs text-blue-100">Lokasi</dt>
              <dd className="mt-1 text-sm font-medium">
                {event.location || "Lokasi belum diisi"}
              </dd>
            </div>
          </div>
        </dl>
      </section>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4">
              <CardTitle>Tentang kegiatan</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {event.description || "Belum ada catatan kegiatan."}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>IDR · Asia/Jakarta</span>
                <span>
                  {event.currentRevisionNo
                    ? `RAB revisi ${event.currentRevisionNo}`
                    : "Belum ada baseline RAB"}
                </span>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
            <FileTextIcon
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-semibold">
                Rencana anggaran belum tersedia
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                RAB, kas, dan iuran tersedia pada tahap berikutnya.
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader className="px-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Persiapan event</CardTitle>
              <span className="text-xs font-semibold text-primary">
                {completed}/4
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-3">
            <div
              role="progressbar"
              aria-label="Kelengkapan informasi event"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={completed}
              className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${completed * 25}%` }}
              />
            </div>
            <ul className="space-y-3">
              {checklist.map(([label, done]) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full ${done ? "bg-blue-50 text-primary" : "border border-slate-500"}`}
                    aria-hidden="true"
                  >
                    {done && <CheckIcon />}
                  </span>
                  <span className="flex-1">{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {done ? "Terisi" : "Belum diisi"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
