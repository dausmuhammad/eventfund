import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="p-8">
      <h1 className="text-2xl font-bold">Halaman tidak tersedia</h1>
      <Link
        className="mt-4 inline-flex min-h-11 items-center text-primary underline"
        href="/events"
      >
        Kembali ke ruang kerja
      </Link>
    </main>
  );
}
