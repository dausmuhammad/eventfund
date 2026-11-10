"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "./button";
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export function SheetContent({ children, title, description }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
      <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(320px,calc(100%_-_2rem))] flex-col overflow-y-auto border-r border-border bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <DialogPrimitive.Title className="text-lg font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              className="px-3"
              aria-label="Tutup navigasi"
            >
              <Cross2Icon />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
