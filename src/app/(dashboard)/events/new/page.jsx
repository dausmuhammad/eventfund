import { pageUser } from "@/features/events/page-context";
import { EventForm } from "@/features/events/components/event-form";
import { PageHeading } from "@/components/shared/page-heading";
export const metadata = { title: "Buat event" };
export default async function NewEventPage() {
  await pageUser();
  return (
    <>
      <PageHeading
        eyebrow="Kegiatan baru"
        title="Buat event"
        description="Beri nama kegiatan Anda. Jadwal dan detail lainnya bisa menyusul."
      />
      <EventForm />
    </>
  );
}
