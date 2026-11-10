import Link from "next/link";
export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto my-10 max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-8"
    >
      <h1 className="text-2xl font-bold">Halaman tidak tersedia</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Halaman tidak ditemukan atau tidak tersedia untuk akun Anda.
      </p>
      <Link
        className="mt-4 inline-flex min-h-11 items-center text-primary underline"
        href="/events"
      >
        Kembali ke ruang kerja
      </Link>
    </main>
  );
}
