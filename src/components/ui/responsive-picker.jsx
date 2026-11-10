"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Drawer, DrawerTrigger, DrawerContent } from "./drawer";
import { Button } from "./button";

export function ResponsivePicker({
  mobile,
  open,
  onOpenChange,
  title,
  trigger,
  children,
}) {
  if (mobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent
          title={title}
          description="Pilih hari di kalender atau ketik tanggal."
          closeLabel="Tutup kalender"
        >
          {children}
        </DrawerContent>
      </Drawer>
    );
  }
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-surface="popover"
          aria-label={title}
          align="start"
          side="bottom"
          sideOffset={8}
          collisionPadding={12}
          sticky="always"
          className="picker-popover z-50 max-h-[var(--radix-popover-content-available-height)] w-[288px] max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-border bg-white p-3 shadow-lg"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{title}</p>
            <PopoverPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                className="size-8 min-h-8 px-0"
                aria-label="Tutup kalender"
              >
                <Cross2Icon aria-hidden="true" />
              </Button>
            </PopoverPrimitive.Close>
          </div>
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
