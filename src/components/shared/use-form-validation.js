"use client";
import { useRef, useState } from "react";
export function useFormValidation(schema) {
  const [fields, setFields] = useState({});
  const [message, setMessage] = useState("");
  const [requestId, setRequestId] = useState("");
  const touched = useRef(new Set());
  function validate(values) {
    const result = schema.safeParse(values);
    const errors = result.success ? {} : result.error.flatten().fieldErrors;
    setFields(errors);
    setMessage(result.success ? "" : "Ada isian yang perlu diperbaiki.");
    setRequestId("");
    return result.success ? result.data : null;
  }
  function onBlur(event) {
    if (!event.target.name || !event.currentTarget) return;
    if (event.relatedTarget?.closest("button,a,[role='button']")) return;
    const name = event.target.name;
    touched.current.add(name);
    const result = schema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    const errors = result.success ? {} : result.error.flatten().fieldErrors;
    if (result.success && message === "Ada isian yang perlu diperbaiki.")
      setMessage("");
    setFields((previous) => {
      const next = { ...previous };
      for (const field of touched.current) {
        if (errors[field]) next[field] = errors[field];
        else delete next[field];
      }
      return next;
    });
  }
  function failure(error) {
    setFields(error.fields || {});
    setMessage(
      error instanceof TypeError
        ? "Koneksi terputus. Isian Anda tetap tersedia. Coba simpan kembali."
        : error.message || "Koneksi terputus. Isian Anda tetap tersedia.",
    );
    setRequestId(error.requestId || "");
  }
  function validateField(name, values) {
    const result = schema.safeParse(values);
    const errors = result.success ? {} : result.error.flatten().fieldErrors;
    if (result.success && message === "Ada isian yang perlu diperbaiki.")
      setMessage("");
    setFields((previous) => {
      const next = { ...previous };
      if (errors[name]) next[name] = errors[name];
      else delete next[name];
      return next;
    });
  }
  function props(name, help = false) {
    return {
      id: name,
      name,
      "aria-invalid": !!fields[name],
      "aria-describedby":
        [help ? `${name}-help` : null, fields[name] ? `${name}-error` : null]
          .filter(Boolean)
          .join(" ") || undefined,
    };
  }
  return {
    fields,
    message,
    requestId,
    validate,
    validateField,
    onBlur,
    failure,
    props,
    setMessage,
  };
}
