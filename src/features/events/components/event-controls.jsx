"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { commandSchema } from "../schemas";
import { mutate } from "./event-form";
import { useFormValidation } from "@/components/shared/use-form-validation";
import { FormFeedback } from "@/components/shared/form-feedback";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
const subscribe = () => () => {};
export function EventControls({ event }) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const retry = useRef(null);
  const form = useFormValidation(commandSchema);
  const commands = event.archivedAt
    ? [["unarchive", "Keluarkan dari arsip"]]
    : [
        ...(event.status === "PLANNED" ? [["activate", "Mulai event"]] : []),
        ...(event.status === "COMPLETED"
          ? [["reopen", "Buka kembali event"]]
          : []),
        ...(["COMPLETED", "CANCELLED"].includes(event.status)
          ? [["archive", "Arsipkan event"]]
          : [["cancel", "Batalkan event"]]),
      ];
  const [command, setCommand] = useState(commands[0][0]);
  const needsReason = ["cancel", "reopen"].includes(command);
  function values() {
    return { command, reason, acknowledged, expectedVersion: event.version };
  }
  function submit(e) {
    e.preventDefault();
    const body = form.validate(values());
    if (body) setPending(body);
  }
  async function confirm() {
    const body = pending;
    const payload = JSON.stringify(body);
    if (retry.current?.payload !== payload)
      retry.current = { payload, key: crypto.randomUUID() };
    setBusy(true);
    try {
      await mutate(
        `/api/events/${event.id}/commands`,
        body,
        "POST",
        retry.current.key,
      );
      retry.current = null;
      setPending(null);
      router.refresh();
    } catch (error) {
      setPending(null);
      form.failure(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="mt-6 border-red-200">
      <CardHeader>
        <CardTitle>Status dan arsip</CardTitle>
        <CardDescription>
          Perubahan status memengaruhi aktivitas yang dapat dilakukan pada
          event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          onSubmit={submit}
          className="max-w-2xl space-y-4"
          aria-busy={busy}
        >
          <FormFeedback
            message={form.message}
            fields={form.fields}
            requestId={form.requestId}
          />
          <Field name="command" label="Tindakan" error={form.fields.command}>
            <Select
              name="command"
              value={command}
              onValueChange={(value) => {
                setCommand(value);
                form.validate({ ...values(), command: value });
              }}
            >
              <SelectTrigger id="command">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {commands.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {needsReason && (
            <Field
              name="reason"
              label="Alasan pembatalan atau pembukaan kembali (minimal 5 karakter)"
              error={form.fields.reason}
              description="Jelaskan alasannya agar perubahan tetap dapat dipahami di kemudian hari."
            >
              <Textarea
                required
                {...form.props("reason", true)}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onBlur={() => form.validateField("reason", values())}
              />
            </Field>
          )}
          {command === "cancel" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  {...form.props("acknowledged")}
                  checked={acknowledged}
                  onCheckedChange={(value) => {
                    const checked = value === true;
                    setAcknowledged(checked);
                    form.validateField("acknowledged", {
                      ...values(),
                      acknowledged: checked,
                    });
                  }}
                  className="mt-0.5"
                />
                <label
                  htmlFor="acknowledged"
                  className="text-sm leading-relaxed"
                >
                  Saya memahami pembatalan mempertahankan histori dan tidak
                  membalik transaksi.
                  <span
                    className="ml-1 font-semibold text-danger"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </label>
              </div>
              {form.fields.acknowledged && (
                <p id="acknowledged-error" className="mt-3 text-sm text-danger">
                  {form.fields.acknowledged[0]}
                </p>
              )}
            </div>
          )}
          <Button
            variant={command === "cancel" ? "destructive" : "outline"}
            disabled={!hydrated || busy}
          >
            {busy ? "Memproses…" : "Terapkan tindakan"}
          </Button>
        </form>
        <ConfirmationDialog
          open={!!pending}
          onOpenChange={(open) => {
            if (!open && !busy) setPending(null);
          }}
          busy={busy}
          onConfirm={confirm}
          title={
            commands.find(([value]) => value === command)?.[1] ||
            "Konfirmasi tindakan"
          }
          description={
            command === "cancel"
              ? `Event “${event.name}” akan dibatalkan. Histori dipertahankan dan event tidak dapat dibuka kembali.`
              : `Terapkan perubahan pada event “${event.name}”? Mengeluarkan dari arsip tidak mengubah status operasionalnya.`
          }
          destructive={command === "cancel"}
          confirmLabel={
            command === "cancel" ? "Ya, batalkan event" : "Konfirmasi tindakan"
          }
        />
      </CardContent>
    </Card>
  );
}
