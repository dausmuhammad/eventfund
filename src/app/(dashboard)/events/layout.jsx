import { Suspense } from "react";
import { pageUser } from "@/features/events/page-context";
import { AppShell } from "@/components/layout/app-shell";
export default async function EventsLayout({ children }) {
  const user = await pageUser();
  return (
    <Suspense>
      <AppShell user={{ name: user.name }}>{children}</AppShell>
    </Suspense>
  );
}
