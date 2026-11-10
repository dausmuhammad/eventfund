"use client";
import { useEffect, useRef } from "react";
import { Alert } from "@/components/ui/alert";
export function FormFeedback({
  message,
  fields = {},
  requestId,
  success = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (message && !success) ref.current?.focus();
  }, [message, success]);
  if (!message) return null;
  return (
    <Alert
      ref={ref}
      tabIndex={-1}
      variant={success ? "default" : "destructive"}
    >
      <p className="font-medium">{message}</p>
      {Object.keys(fields).length > 0 && (
        <ul className="mt-2 space-y-1">
          {Object.entries(fields).map(([name, errors]) => (
            <li key={name}>
              <a
                href={`#${name}`}
                className="underline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(name)?.focus();
                }}
              >
                {errors[0]}
              </a>
            </li>
          ))}
        </ul>
      )}
      {requestId && <p className="mt-2 text-xs">Kode bantuan: {requestId}</p>}
    </Alert>
  );
}
