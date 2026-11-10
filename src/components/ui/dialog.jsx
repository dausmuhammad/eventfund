"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Cross2Icon } from "@radix-ui/react-icons";
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ title, description, children }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <DialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" aria-label="Tutup dialog" className="px-3">
              <Cross2Icon />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export function HelpDialog() {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button variant="outline">Tentang fondasi ini</Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[85dvh] max-w-lg overflow-y-auto rounded-t-xl border border-border bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-xl">
          <DialogPrimitive.Title className="text-xl font-semibold">
            Tahap fondasi EventFund
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-3 text-muted-foreground">
            Akun dan sesi sudah menjadi bagian fondasi. Pengelolaan event, RAB,
            kas, dan iuran dikerjakan pada fase berikutnya.
          </DialogPrimitive.Description>
          <DialogPrimitive.Close asChild>
            <Button className="mt-6">Tutup penjelasan</Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
