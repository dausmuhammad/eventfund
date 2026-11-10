"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }) {
  return (
    <main
      id="main"
      className="mx-auto my-10 max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-8"
    >
      <h1 className="text-2xl font-bold">Halaman belum bisa dimuat</h1>
      <p className="my-4 text-muted-foreground">
        Layanan belum dapat dihubungi. Coba muat ulang halaman ini.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </main>
  );
}
