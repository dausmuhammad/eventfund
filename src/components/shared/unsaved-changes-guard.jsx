"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/ui/alert-dialog";
export function UnsavedChangesGuard({ dirty }) {
  const router = useRouter();
  const [destination, setDestination] = useState(null);
  const returnFocusRef = useRef(null);
  useEffect(() => {
    if (!dirty) return;
    const unload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target.closest?.("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.href === window.location.href ||
        (url.pathname === window.location.pathname &&
          url.search === window.location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      returnFocusRef.current = anchor;
      setDestination(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
  return (
    <ConfirmationDialog
      returnFocusRef={returnFocusRef}
      open={!!destination}
      onOpenChange={(open) => {
        if (!open) setDestination(null);
      }}
      title="Tinggalkan perubahan?"
      description="Isian yang belum disimpan akan hilang jika Anda meninggalkan halaman ini."
      confirmLabel="Tinggalkan halaman"
      onConfirm={() => {
        const path = destination;
        setDestination(null);
        router.push(path);
      }}
    />
  );
}
