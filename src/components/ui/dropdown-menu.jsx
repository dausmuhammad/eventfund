"use client";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;
export function DropdownMenuContent({ className, ...props }) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={8}
        align="end"
        className={cn(
          "z-50 min-w-52 rounded-lg border border-border bg-white p-1 shadow-lg",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}
export function DropdownMenuItem({ className, ...props }) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm outline-none focus:bg-blue-50 focus:text-primary",
        className,
      )}
      {...props}
    />
  );
}
export function DropdownMenuLabel(props) {
  return (
    <MenuPrimitive.Label
      className="px-3 py-2 text-xs font-medium text-muted-foreground"
      {...props}
    />
  );
}
