import Link from "next/link";
import {
  CalendarIcon,
  GearIcon,
  CopyIcon,
  DrawingPinIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { pageUser, pageEvent } from "@/features/events/page-context";
import { listEvents, serializeEvent } from "@/features/events/service";
import { EventSwitcher } from "@/features/events/components/event-switcher";
import { PageHeading } from "@/components/shared/page-heading";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
function date(value) {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(value)
    : "Belum diatur";
}
export default async function EventPage({ params }) {
  const user = await pageUser();
  const event = await pageEvent(user, (await params).eventId);
  const events = await listEvents(user);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/events"
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-primary"
        >
          Semua event / Ringkasan
        </Link>
        <EventSwitcher
          events={serializeEvent(events.map(({ id, name }) => ({ id, name })))}
          currentId={event.id}
        />
      </div>
      <PageHeading
        eyebrow="Ringkasan event"
        title={event.name}
        description="Detail kegiatan dan langkah persiapan Anda."
      >
        <Button variant="outline" asChild>
          <Link href={`/events/${event.id}/duplicate`}>
            <CopyIcon className="mr-2" aria-hidden="true" />
            Duplikasi event
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/events/${event.id}/settings`}>
            <GearIcon className="mr-2" aria-hidden="true" />
            Pengaturan event
          </Link>
        </Button>
      </PageHeading>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4">
        <StatusBadge status={event.status} archived={!!event.archivedAt} />
        <p className="text-xs text-muted-foreground">
          IDR · Asia/Jakarta ·{" "}
          {event.currentRevisionNo
            ? `Revisi ${event.currentRevisionNo}`
            : "Belum ada baseline RAB"}
        </p>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detail kegiatan</CardTitle>
              <CardDescription>
                Informasi yang menjadi acuan persiapan event.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon aria-hidden="true" />
                    Tanggal mulai
                  </dt>
                  <dd className="font-medium">{date(event.startDate)}</dd>
                </div>
                <div>
                  <dt className="mb-2 text-sm text-muted-foreground">
                    Tanggal selesai
                  </dt>
                  <dd className="font-medium">{date(event.endDate)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <DrawingPinIcon aria-hidden="true" />
                    Lokasi
                  </dt>
                  <dd className="font-medium">
                    {event.location || "Lokasi belum diisi"}
                  </dd>
                </div>
              </dl>
              <div className="mt-7 border-t border-border pt-6">
                <h3 className="mb-3 text-sm text-muted-foreground">
                  Tentang kegiatan
                </h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {event.description ||
                    "Belum ada deskripsi. Tambahkan catatan untuk menjelaskan tujuan dan kebutuhan kegiatan."}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-5 sm:flex-row">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <FileTextIcon aria-hidden="true" className="size-6" />
              </span>
              <div>
                <Badge variant="secondary">Langkah berikutnya</Badge>
                <h2 className="mt-3 text-lg font-semibold">
                  Rencana anggaran belum tersedia
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Penyusunan RAB akan tersedia pada tahap berikutnya. Setelah
                  baseline RAB diterbitkan, event Draft dapat dilanjutkan
                  menjadi Direncanakan.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Ringkasan kas dan tagihan belum tersedia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Persiapan event</CardTitle>
            <CardDescription>
              Mulai dengan informasi kegiatan yang jelas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5">
              {[
                ["Nama kegiatan", true],
                ["Jadwal kegiatan", !!event.startDate],
                ["Lokasi kegiatan", !!event.location],
                ["Deskripsi kegiatan", !!event.description],
              ].map(([label, done]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{label}</span>
                  <Badge variant={done ? "success" : "secondary"}>
                    {done ? "Terisi" : "Belum diisi"}
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              Tanggal, lokasi, dan deskripsi boleh dilengkapi nanti. Penutupan
              event tersedia setelah pemeriksaan kas dan tagihan terhubung.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
