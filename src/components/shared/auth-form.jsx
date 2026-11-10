"use client";
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { registrationFormSchema, loginSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormFeedback } from "./form-feedback";
import { useFormValidation } from "./use-form-validation";
const subscribe = () => () => {};
export function AuthForm({ register = false }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState({});
  const form = useFormValidation(
    register ? registrationFormSchema : loginSchema,
  );
  async function submit(event) {
    event.preventDefault();
    setSuccess(false);
    const values = form.validate(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!values) return;
    setBusy(true);
    try {
      if (register) {
        const response = await fetch("/api/csrf", { cache: "no-store" });
        if (!response.ok)
          throw new Error("Token tidak tersedia. Muat ulang halaman.");
        const { data } = await response.json();
        const { confirmPassword: confirmation, ...body } = values;
        void confirmation;
        const saved = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": data.token,
          },
          body: JSON.stringify(body),
        });
        const result = await saved.json();
        if (!saved.ok) {
          const error = new Error(
            result.error.message +
              (saved.status === 429
                ? ` Coba lagi dalam ${saved.headers.get("Retry-After")} detik.`
                : ""),
          );
          error.fields = result.error.fields;
          error.requestId = result.requestId;
          throw error;
        }
        setSuccess(true);
        form.setMessage(result.data.message);
      } else {
        const result = await signIn("credentials", {
          ...values,
          redirect: false,
          callbackUrl: "/events",
        });
        if (result?.error)
          throw new Error(
            result.error === "RATE_LIMITED"
              ? "Terlalu banyak percobaan. Coba lagi dalam 15 menit."
              : result.error === "AUTH_UNAVAILABLE"
                ? "Layanan masuk belum tersedia. Coba lagi."
                : "Email atau kata sandi tidak sesuai.",
          );
        router.push("/events");
        router.refresh();
      }
    } catch (error) {
      form.failure(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {register ? "Mulai dengan akun Anda" : "Selamat datang kembali"}
      </p>
      <h1 className="text-[1.75rem] font-semibold tracking-tight">
        {register ? "Buat akun" : "Masuk ke akun"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {register
          ? "Siapkan ruang kerja pribadi untuk kegiatan Anda."
          : "Masuk untuk melanjutkan persiapan dan pengelolaan event."}
      </p>
      <form
        noValidate
        method="post"
        action={register ? "/api/register" : "/api/auth/callback/credentials"}
        onSubmit={submit}
        onBlur={form.onBlur}
        className="mt-6 space-y-4"
        aria-busy={busy}
      >
        <FormFeedback
          message={form.message}
          fields={form.fields}
          requestId={form.requestId}
          success={success}
        />
        {register && (
          <Field name="name" label="Nama" error={form.fields.name}>
            <Input
              {...form.props("name")}
              autoComplete="name"
              required
              maxLength={120}
              placeholder="Nama lengkap Anda"
            />
          </Field>
        )}
        <Field name="email" label="Email" error={form.fields.email}>
          <Input
            {...form.props("email")}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="nama@email.com"
          />
        </Field>
        {(register
          ? [
              ["password", "Kata sandi"],
              ["confirmPassword", "Konfirmasi kata sandi"],
            ]
          : [["password", "Kata sandi"]]
        ).map(([name, label]) => (
          <Field
            key={name}
            name={name}
            label={label}
            error={form.fields[name]}
            description={
              name === "password"
                ? "12–128 karakter. Spasi tetap diperhitungkan."
                : undefined
            }
          >
            <div className="relative">
              <Input
                {...form.props(name, name === "password")}
                type={visible[name] ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={12}
                maxLength={128}
                placeholder={
                  name === "confirmPassword"
                    ? "Ulangi kata sandi"
                    : "Masukkan kata sandi"
                }
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-0 top-0 size-12 px-0"
                aria-label={`${visible[name] ? "Sembunyikan" : "Tampilkan"} ${label.toLowerCase()}`}
                aria-pressed={!!visible[name]}
                onClick={() =>
                  setVisible((previous) => ({
                    ...previous,
                    [name]: !previous[name],
                  }))
                }
              >
                {visible[name] ? (
                  <EyeClosedIcon aria-hidden="true" />
                ) : (
                  <EyeOpenIcon aria-hidden="true" />
                )}
              </Button>
            </div>
          </Field>
        ))}
        <Button type="submit" disabled={busy || !hydrated} className="w-full">
          {busy ? "Memproses…" : register ? "Buat akun" : "Masuk"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {register ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link
          href={register ? "/login" : "/register"}
          className="inline-flex min-h-11 items-center font-semibold text-primary underline"
        >
          {register ? "Masuk" : "Buat akun"}
        </Link>
      </p>
    </>
  );
}
