import Link from "next/link";
import { PlusIcon } from "@radix-ui/react-icons";
import { pageUser } from "@/features/events/page-context";
import { listEvents, serializeEvent } from "@/features/events/service";
import { EventList } from "@/features/events/components/event-list";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export const dynamic = "force-dynamic";
export const metadata = { title: "Event saya" };
export default async function EventsPage({ searchParams }) {
  const user = await pageUser();
  const archived = (await searchParams).archived === "true";
  const events = await listEvents(user, archived);
  return (
    <>
      <PageHeading
        eyebrow={`Ruang kerja ${user.name}`}
        title={archived ? "Arsip event" : "Event saya"}
        description={
          archived
            ? "Kegiatan yang disimpan tetap memiliki detail dan riwayatnya."
            : "Setiap kegiatan punya ruang sendiri. Siapkan detailnya, lalu lanjutkan rencana Anda."
        }
      >
        <Button asChild>
          <Link href="/events/new">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Buat event
          </Link>
        </Button>
      </PageHeading>
      {!archived && (
        <section className="mb-8 grid gap-6 rounded-xl border border-blue-200 bg-blue-50 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
          <div>
            <p className="text-sm font-medium text-primary">
              Perencanaan dimulai di sini
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              Fokus ke kegiatan. Detailnya tetap tertata.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              Jadwal, lokasi, dan catatan event tersimpan di satu tempat, khusus
              untuk ruang kerja Anda.
            </p>
          </div>
          <div className="flex items-center gap-4 border-t border-blue-200 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
            <span className="text-5xl font-semibold tracking-tight text-primary">
              {events.length}
            </span>
            <div className="text-sm leading-relaxed text-slate-600">
              Event di
              <br />
              ruang kerja
            </div>
          </div>
        </section>
      )}
      <nav
        aria-label="Filter event"
        className="mb-6 flex w-fit gap-1 rounded-lg border border-border bg-slate-100 p-1"
      >
        {[
          ["/events", "Event aktif", !archived],
          ["/events?archived=true", "Arsip", archived],
        ].map(([href, label, active]) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 items-center rounded-md px-5 text-sm font-medium",
              active
                ? "border border-border bg-white text-primary"
                : "border border-transparent text-muted-foreground hover:bg-white",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      <EventList events={serializeEvent(events)} archived={archived} />
    </>
  );
}
