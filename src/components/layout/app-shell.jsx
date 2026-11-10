"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArchiveIcon,
  CalendarIcon,
  PlusIcon,
  HamburgerMenuIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";
const links = [
  { href: "/events", label: "Event saya", icon: CalendarIcon },
  { href: "/events/new", label: "Event baru", icon: PlusIcon },
  { href: "/events?archived=true", label: "Arsip event", icon: ArchiveIcon },
];
function Navigation({ mobile = false, onNavigate }) {
  const path = usePathname();
  const query = useSearchParams();
  return (
    <nav
      aria-label={mobile ? "Navigasi mobile" : "Navigasi utama"}
      className="space-y-1"
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = href.includes("?")
          ? path === "/events" && query.get("archived") === "true"
          : href === "/events"
            ? path === "/events" && query.get("archived") !== "true"
            : path === href;
        const link = (
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-blue-50 text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {label}
            {active && (
              <span
                className="ml-auto h-5 w-1 rounded bg-primary"
                aria-hidden="true"
              />
            )}
          </Link>
        );
        return mobile ? (
          <SheetClose key={href} asChild>
            {link}
          </SheetClose>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
    </nav>
  );
}
export function AppShell({ user, children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const section =
    path === "/events/new"
      ? "Buat event"
      : path.endsWith("/settings")
        ? "Pengaturan"
        : path.endsWith("/duplicate")
          ? "Duplikasi"
          : "Ruang kerja";
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-white px-5 py-7 lg:flex">
        <Link
          href="/events"
          className="mb-10 inline-flex min-h-11 items-center text-2xl font-bold tracking-tight"
        >
          EventFund<span className="text-primary">.</span>
        </Link>
        <p className="mb-3 px-3 text-xs font-semibold text-muted-foreground">
          Ruang kerja
        </p>
        <Navigation />
        <div className="mt-auto space-y-5 pt-10">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">
              Rencana yang tertata.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-blue-900">
              Mulai dari detail event. Penyusunan anggaran menjadi langkah
              berikutnya.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3 border-t border-border pt-5">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold"
              aria-hidden="true"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                Pemilik ruang kerja
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="min-w-0 pb-20 md:pb-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b border-border bg-white">
          <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="px-2.5"
                      aria-label="Buka navigasi"
                    >
                      <HamburgerMenuIcon className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    title="EventFund"
                    description="Kelola kegiatan di ruang kerja Anda."
                  >
                    <div className="mt-7">
                      <Navigation mobile />
                    </div>
                    <p className="mt-auto pt-8 text-sm text-muted-foreground">
                      {user.name}
                    </p>
                  </SheetContent>
                </Sheet>
              </div>
              <Link href="/events" className="text-lg font-bold lg:hidden">
                EventFund<span className="text-primary">.</span>
              </Link>
              <div className="hidden items-center gap-3 text-sm text-muted-foreground sm:flex">
                <span className="lg:hidden" aria-hidden="true">
                  /
                </span>
                <Link
                  href="/events"
                  className="hidden hover:text-primary lg:block"
                >
                  Event saya
                </Link>
                <ChevronRightIcon
                  aria-hidden="true"
                  className="hidden lg:block"
                />
                <span className="text-foreground">{section}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main
          id="main"
          className="mx-auto min-h-[calc(100dvh-150px)] max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10"
        >
          {children}
        </main>
        <footer className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-5 pb-6 text-xs text-muted-foreground sm:px-8 lg:px-10">
          <span>EventFund · Ruang kerja pribadi</span>
          <span>IDR · Asia/Jakarta</span>
        </footer>
        <nav
          aria-label="Navigasi bawah"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-white px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        >
          {[
            ["/events", "Event", CalendarIcon],
            ["/events/new", "Buat", PlusIcon],
            ["/events?archived=true", "Arsip", ArchiveIcon],
          ].map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-primary"
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
