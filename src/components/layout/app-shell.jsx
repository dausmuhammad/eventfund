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
import { Brand } from "@/components/shared/brand";
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
            ? (path === "/events" && query.get("archived") !== "true") ||
              (path.startsWith("/events/") && path !== "/events/new")
            : path === href;
        const link = (
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[#254681] text-white ring-1 ring-inset ring-blue-300/25"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {label}
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
  const query = useSearchParams();
  const [open, setOpen] = useState(false);
  const section =
    path === "/events/new"
      ? "Buat event"
      : path.endsWith("/settings")
        ? "Pengaturan"
        : path.endsWith("/duplicate")
          ? "Duplikasi"
          : path === "/events"
            ? query.get("archived") === "true"
              ? "Arsip"
              : "Ruang kerja"
            : "Detail event";
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="app-sidebar fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col overflow-y-auto border-r border-slate-800 px-4 py-6 text-white lg:flex">
        <Link
          href="/events"
          className="mb-7 inline-flex min-h-11 items-center px-2"
        >
          <Brand />
        </Link>
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold"
            aria-hidden="true"
          >
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="mt-0.5 text-xs text-slate-300">Ruang kerja pribadi</p>
          </div>
        </div>
        <p className="mb-2 px-3 text-xs font-medium text-slate-400">
          Kelola kegiatan
        </p>
        <Navigation />
        <div className="mt-auto space-y-5 pt-10">
          <div className="border-t border-white/15 px-2 pt-4">
            <p className="text-xs text-slate-300">EventFund untuk bendahara</p>
            <p className="mt-1 text-xs text-slate-400">IDR · Asia/Jakarta</p>
          </div>
        </div>
      </aside>
      <div className="min-w-0 pb-20 md:pb-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b border-border bg-white">
          <div className="mx-auto flex min-h-16 max-w-[1360px] flex-wrap items-center justify-between gap-3 px-[16px] py-2 sm:px-7">
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
                    <div className="app-sidebar mt-4 rounded-xl p-3">
                      <Navigation mobile />
                    </div>
                    <p className="mt-auto pt-8 text-sm text-muted-foreground">
                      {user.name}
                    </p>
                  </SheetContent>
                </Sheet>
              </div>
              <Link href="/events" className="lg:hidden">
                <Brand className="gap-2 text-base [&_svg]:size-8" />
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
          className="mx-auto min-h-[calc(100dvh-120px)] max-w-[1360px] px-[16px] py-6 sm:px-7 sm:py-7"
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
              aria-current={
                (
                  href === "/events"
                    ? path === "/events" && query.get("archived") !== "true"
                    : href.includes("?")
                      ? path === "/events" && query.get("archived") === "true"
                      : path === href
                )
                  ? "page"
                  : undefined
              }
              className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-primary aria-[current=page]:bg-blue-50 aria-[current=page]:text-primary"
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
