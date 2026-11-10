"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export function DrawerContent({
  title,
  description,
  closeLabel = "Tutup pilihan",
  children,
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="drawer-overlay fixed inset-0 z-50 bg-slate-950/45" />
      <DialogPrimitive.Content
        data-surface="drawer"
        className={cn(
          "drawer-content fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl border-t border-border bg-white shadow-xl outline-none",
          className,
        )}
        {...props}
      >
        <div
          className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-slate-300"
          aria-hidden="true"
        />
        <header className="shrink-0 border-b border-border px-[16px] pb-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <DialogPrimitive.Title className="text-lg font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                className="size-[44px] min-h-[44px] shrink-0 px-0"
                aria-label={closeLabel}
              >
                <Cross2Icon aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain px-[16px] py-4">
          {children}
        </div>
        <footer className="shrink-0 border-t border-border px-[16px] pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <DialogPrimitive.Close asChild>
            <Button type="button" className="w-full">
              Selesai
            </Button>
          </DialogPrimitive.Close>
        </footer>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
