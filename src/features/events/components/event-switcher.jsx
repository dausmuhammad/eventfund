"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export function EventSwitcher({ events, currentId }) {
  const [query, setQuery] = useState("");
  const filtered = events.filter((event) =>
    event.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          Ganti event
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent
        title="Ganti event"
        description="Pilih kegiatan yang ingin Anda kelola."
      >
        <Label htmlFor="switcher-search">Cari event untuk beralih</Label>
        <Input
          id="switcher-search"
          placeholder="Cari nama event…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="mt-4 max-h-64 space-y-1 overflow-y-auto">
          {filtered.map((event) => (
            <li key={event.id}>
              <DialogClose asChild>
                <Link
                  href={`/events/${event.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-blue-50 hover:text-primary"
                  aria-current={event.id === currentId ? "page" : undefined}
                >
                  {event.name}
                  {event.id === currentId && (
                    <CheckIcon
                      aria-hidden="true"
                      className="shrink-0 text-primary"
                    />
                  )}
                </Link>
              </DialogClose>
            </li>
          ))}
          {!filtered.length && (
            <li className="px-3 py-5 text-sm text-muted-foreground">
              Tidak ada event yang cocok.
            </li>
          )}
        </ul>
        <DialogClose asChild>
          <Button asChild variant="outline" className="mt-5 w-full">
            <Link href="/events?archived=true">Lihat arsip event</Link>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
