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
        eyebrow="Kegiatan Anda"
        title={archived ? "Arsip event" : "Event saya"}
        description={
          archived
            ? "Kegiatan yang disimpan tetap memiliki detail dan riwayatnya."
            : "Jadwal, tempat, dan persiapan kegiatan dalam satu ruang."
        }
      >
        <Button asChild>
          <Link href="/events/new">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Buat event
          </Link>
        </Button>
      </PageHeading>
      <nav
        aria-label="Filter event"
        className="mb-5 flex gap-5 border-b border-border"
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
              "-mb-px inline-flex min-h-12 items-center border-b-2 px-1 text-sm font-medium",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
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
