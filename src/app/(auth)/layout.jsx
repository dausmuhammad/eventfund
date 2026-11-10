import Link from "next/link";
import {
  CalendarIcon,
  LockClosedIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <section className="flex flex-col border-b border-blue-200 bg-blue-50 px-6 py-7 sm:px-10 lg:min-h-dvh lg:border-b-0 lg:border-r lg:px-14 lg:py-10 xl:px-20">
        <Link
          href="/login"
          className="inline-flex min-h-11 w-fit items-center text-2xl font-bold tracking-tight"
        >
          EventFund<span className="text-primary">.</span>
        </Link>
        <div className="my-auto max-w-lg py-5 sm:py-10 lg:py-20">
          <Badge>Ruang kerja bendahara event</Badge>
          <h1 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            Kegiatan terencana.
            <br />
            <span className="text-primary">Detailnya terjaga.</span>
          </h1>
          <p className="mt-6 hidden max-w-md text-base leading-relaxed text-slate-600 sm:block">
            Siapkan kegiatan Anda dalam satu ruang kerja. Mulai dari jadwal,
            lokasi, dan catatan yang bisa dilengkapi bersama rencana.
          </p>
          <div className="mt-9 hidden space-y-5 sm:block">
            {[
              [
                CalendarIcon,
                "Satu ruang untuk setiap event",
                "Jadwal dan detail kegiatan tetap dalam konteks.",
              ],
              [
                LockClosedIcon,
                "Khusus ruang kerja Anda",
                "Event hanya dapat diakses oleh akun pemilik.",
              ],
            ].map(([Icon, title, description]) => (
              <div key={title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 hidden items-start gap-2 border-t border-blue-200 pt-5 text-xs leading-relaxed text-muted-foreground sm:flex">
            <FileTextIcon aria-hidden="true" className="mt-0.5 shrink-0" />
            Pengelolaan event sudah tersedia. Modul anggaran, kas, dan iuran
            dilanjutkan pada tahap berikutnya.
          </p>
        </div>
        <p className="hidden text-xs text-muted-foreground lg:block">
          EventFund · IDR · Asia/Jakarta
        </p>
      </section>
      <main
        id="main"
        className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20"
      >
        <div className="mx-auto w-full max-w-md">
          {children}
          <p className="mt-9 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            Ruang kerja pribadi · Pengembangan lokal
          </p>
        </div>
      </main>
    </div>
  );
}
