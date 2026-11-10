"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@radix-ui/react-icons";
import { eventSchema } from "../schemas";
import { useFormValidation } from "@/components/shared/use-form-validation";
import { FormFeedback } from "@/components/shared/form-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
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
      noValidate
      method="post"
      onSubmit={submit}
      onBlur={form.onBlur}
      onChange={() => setDirty(true)}
      aria-busy={busy}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]"
    >
      <UnsavedChangesGuard dirty={dirty} />
      <div className="min-w-0 space-y-6">
        <FormFeedback
          message={form.message}
          fields={form.fields}
          requestId={form.requestId}
        />
        <Card>
          <CardHeader>
            <CardTitle>Informasi kegiatan</CardTitle>
            <CardDescription>
              Beri nama yang mudah dikenali dan jelaskan kegiatan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field
              name="name"
              label="Nama event"
              error={form.fields.name}
              description="Gunakan nama kegiatan yang mudah dibedakan dari event lain."
            >
              <Input
                {...form.props("name", true)}
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
              description={`${descriptionLength.toLocaleString("id-ID")} / 4.000 karakter. Ceritakan tujuan atau kebutuhan kegiatan.`}
            >
              <Textarea
                {...form.props("description", true)}
                maxLength={4000}
                rows={5}
                placeholder="Tujuan kegiatan, kebutuhan persiapan, atau catatan lainnya…"
                defaultValue={event?.description || ""}
                onChange={(e) => setDescriptionLength(e.target.value.length)}
              />
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Waktu dan tempat</CardTitle>
            <CardDescription>
              Belum pasti? Jadwal dan lokasi dapat dilengkapi nanti.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
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
                  <Input
                    {...form.props(name)}
                    type="date"
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
              description="Nama tempat, alamat singkat, atau tautan pertemuan daring."
            >
              <Input
                {...form.props("location", true)}
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
        <div className="flex flex-col-reverse justify-between gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center">
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
      <Card className="xl:sticky xl:top-24">
        <CardHeader>
          <CardTitle>
            {event && !duplicate ? "Konteks event" : "Siap untuk direncanakan"}
          </CardTitle>
          <CardDescription>
            {event && !duplicate
              ? "Perubahan disimpan pada event ini."
              : "Setiap event baru punya ruang dan pengaturannya sendiri."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Status awal</dt>
              <dd className="font-medium">
                {event && !duplicate ? event.status : "Draft"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Mata uang</dt>
              <dd className="font-medium">IDR</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Zona waktu</dt>
              <dd className="font-medium">Asia/Jakarta</dd>
            </div>
          </dl>
          <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            Nama event wajib diisi. Isian lainnya boleh dilengkapi kemudian.
            Data hanya tersedia untuk akun Anda.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
