import { pageUser, pageEvent } from "@/features/events/page-context";
import { serializeEvent } from "@/features/events/service";
import { EventForm } from "@/features/events/components/event-form";
import { PageHeading } from "@/components/shared/page-heading";
export default async function DuplicatePage({ params }) {
  const user = await pageUser();
  const event = serializeEvent(await pageEvent(user, (await params).eventId));
  return (
    <>
      <PageHeading
        eyebrow={event.name}
        title="Duplikasi event"
        description="Gunakan detail kegiatan sebelumnya untuk menyiapkan event baru."
      />
      <EventForm event={event} duplicate />
    </>
  );
}
