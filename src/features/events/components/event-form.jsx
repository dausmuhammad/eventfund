"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CalendarIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { eventSchema } from "../schemas";
import { useFormValidation } from "@/components/shared/use-form-validation";
import { FormFeedback } from "@/components/shared/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { UnsavedChangesGuard } from "@/components/shared/unsaved-changes-guard";
import { StatusBadge } from "@/components/shared/status-badge";
const subscribe = () => () => {};
export async function mutate(url, body, method = "POST", key) {
  const csrf = await fetch("/api/csrf", { cache: "no-store" });
  if (!csrf.ok) throw new Error("Sesi berakhir. Muat ulang halaman.");
  const { data } = await csrf.json();
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": data.token,
      ...(key ? { "Idempotency-Key": key } : {}),
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error.message);
    error.fields = result.error.fields;
    error.requestId = result.requestId;
    throw error;
  }
  return result.data;
}
export function EventForm({ event, duplicate = false }) {
  const router = useRouter();
  const formRef = useRef(null);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedDate, setExpandedDate] = useState(null);
  const [descriptionLength, setDescriptionLength] = useState(
    event?.description?.length || 0,
  );
  const form = useFormValidation(eventSchema);
  async function submit(e) {
    e.preventDefault();
    const body = form.validate(
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    if (!body) return;
    setBusy(true);
    try {
      if (event && !duplicate) body.expectedVersion = event.version;
      const url = duplicate
        ? `/api/events/${event.id}/duplicate`
        : event
          ? `/api/events/${event.id}`
          : "/api/events";
      const result = await mutate(
        url,
        body,
        event && !duplicate ? "PATCH" : "POST",
      );
      setDirty(false);
      router.push(`/events/${result.id}`);
      router.refresh();
    } catch (error) {
      form.failure(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      ref={formRef}
      noValidate
      method="post"
      onSubmit={submit}
      onBlur={form.onBlur}
      onChange={() => setDirty(true)}
      aria-busy={busy}
      className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_248px]"
    >
      <UnsavedChangesGuard dirty={dirty} />
      <div className="min-w-0 space-y-4">
        <FormFeedback
          message={form.message}
          fields={form.fields}
          requestId={form.requestId}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <CalendarIcon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Detail event</CardTitle>
                <CardDescription>
                  Nama kegiatan, jadwal, dan tempat.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field name="name" label="Nama event" error={form.fields.name}>
              <Input
                {...form.props("name")}
                required
                maxLength={200}
                placeholder="Contoh: Gathering komunitas"
                defaultValue={
                  duplicate
                    ? `${event.name.slice(0, 190)} (salinan)`
                    : event?.name || ""
                }
              />
            </Field>
            <Field
              name="description"
              label="Deskripsi"
              optional
              error={form.fields.description}
              description={`${descriptionLength.toLocaleString("id-ID")} / 4.000 karakter`}
            >
              <Textarea
                {...form.props("description", true)}
                maxLength={4000}
                rows={3}
                placeholder="Catatan atau tujuan kegiatan…"
                defaultValue={event?.description || ""}
                onChange={(e) => setDescriptionLength(e.target.value.length)}
              />
            </Field>
            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold">Waktu dan tempat</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Opsional. Lengkapi saat jadwal sudah pasti.
              </p>
            </div>
            <div className="date-fields">
              {[
                ["startDate", "Tanggal mulai"],
                ["endDate", "Tanggal selesai"],
              ].map(([name, label]) => (
                <Field
                  key={name}
                  name={name}
                  label={label}
                  optional
                  error={form.fields[name]}
                >
                  <DatePicker
                    {...form.props(name)}
                    label={label}
                    open={expandedDate === name}
                    onOpenChange={(open) => setExpandedDate(open ? name : null)}
                    onValueChange={(value) => {
                      setDirty(true);
                      if (form.fields.startDate || form.fields.endDate) {
                        const values = Object.fromEntries(
                          new FormData(formRef.current),
                        );
                        values[name] = value;
                        form.validateField("startDate", values);
                        form.validateField("endDate", values);
                      }
                    }}
                    defaultValue={event?.[name]?.slice(0, 10) || ""}
                  />
                </Field>
              ))}
            </div>
            <Field
              name="location"
              label="Lokasi"
              optional
              error={form.fields.location}
            >
              <Input
                {...form.props("location")}
                maxLength={250}
                placeholder="Contoh: Aula serbaguna"
                defaultValue={event?.location || ""}
              />
            </Field>
          </CardContent>
        </Card>
        {duplicate && (
          <Alert>
            Salinan mencakup metadata, default iuran, dan sumber pemasukan umum
            aktif. RAB, peserta, transaksi, lampiran, dan histori asal tidak
            disalin pada tahap ini.
          </Alert>
        )}
        <div className="flex flex-col-reverse justify-between gap-3 rounded-xl border border-border bg-white px-5 py-4 sm:flex-row sm:items-center">
          <Button variant="ghost" asChild>
            <Link href={event ? `/events/${event.id}` : "/events"}>
              Kembali
            </Link>
          </Button>
          <Button type="submit" disabled={!hydrated || busy}>
            {!busy && <CheckIcon aria-hidden="true" className="mr-2" />}
            {busy
              ? "Menyimpan…"
              : duplicate
                ? "Buat salinan event"
                : event
                  ? "Simpan perubahan"
                  : "Buat event"}
          </Button>
        </div>
      </div>
      <Card className="bg-blue-50/50 xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>
            {event && !duplicate ? "Tentang event ini" : "Mulai dari rencana"}
          </CardTitle>
          <CardDescription>
            {event && !duplicate
              ? "Perubahan disimpan pada event ini."
              : "Cukup beri nama. Detail lainnya bisa menyusul."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">
                <StatusBadge
                  status={event && !duplicate ? event.status : "DRAFT"}
                />
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <dt className="text-muted-foreground">Mata uang</dt>
              <dd className="font-medium">IDR</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-3">
              <dt className="text-muted-foreground">Zona waktu</dt>
              <dd className="font-medium">Asia/Jakarta</dd>
            </div>
          </dl>
          <p className="mt-5 flex items-start gap-2 border-t border-blue-100 pt-4 text-xs leading-relaxed text-muted-foreground">
            <LockClosedIcon className="mt-0.5 shrink-0" aria-hidden="true" />
            Hanya akun Anda yang dapat mengakses event ini.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
