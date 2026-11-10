import { pageUser, pageEvent } from "@/features/events/page-context";
import { serializeEvent } from "@/features/events/service";
import { EventForm } from "@/features/events/components/event-form";
import { EventControls } from "@/features/events/components/event-controls";
import { PageHeading } from "@/components/shared/page-heading";
import { Alert } from "@/components/ui/alert";
export default async function SettingsPage({ params }) {
  const user = await pageUser();
  const event = serializeEvent(await pageEvent(user, (await params).eventId));
  const readOnly =
    event.archivedAt || ["COMPLETED", "CANCELLED"].includes(event.status);
  return (
    <>
      <PageHeading
        eyebrow={event.name}
        title="Pengaturan event"
        description="Lengkapi detail kegiatan dan kelola status event Anda."
      />
      {readOnly ? (
        <Alert>Metadata event ini hanya dapat dibaca.</Alert>
      ) : (
        <EventForm key={event.version} event={event} />
      )}
      <EventControls key={`controls-${event.version}`} event={event} />
    </>
  );
}
