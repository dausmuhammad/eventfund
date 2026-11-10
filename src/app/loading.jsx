export default function Loading() {
  return (
    <main id="main" className="p-8" aria-busy="true">
      <p role="status">Memuat halaman…</p>
      <div
        className="mt-4 h-20 max-w-lg rounded-xl bg-slate-200"
        aria-hidden="true"
      />
    </main>
  );
}
