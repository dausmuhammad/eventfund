"use client";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { useRef } from "react";
import { Button } from "./button";
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  busy,
  destructive = false,
  confirmLabel = "Konfirmasi tindakan",
  returnFocusRef,
  children,
}) {
  const returnFocus = useRef(null);
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
        <AlertDialogPrimitive.Content
          onOpenAutoFocus={() => {
            returnFocus.current = document.activeElement;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const target = returnFocusRef?.current || returnFocus.current;
            if (target?.isConnected) target.focus();
          }}
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          className="fixed left-1/2 top-1/2 z-50 max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-white p-6 shadow-lg"
        >
          <AlertDialogPrimitive.Title className="text-xl font-semibold">
            {title}
          </AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </AlertDialogPrimitive.Description>
          {children}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={busy}>
                Kembali
              </Button>
            </AlertDialogPrimitive.Cancel>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? "Memproses…" : confirmLabel}
            </Button>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
