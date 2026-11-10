import Link from "next/link";
import { CalendarIcon, LockClosedIcon, CheckIcon } from "@radix-ui/react-icons";
import { Brand } from "@/components/shared/brand";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      <section className="flex flex-col bg-[#19345f] px-6 py-5 text-white sm:px-10 lg:min-h-dvh lg:px-12 lg:py-10 xl:px-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/login" className="inline-flex min-h-11 items-center">
            <Brand />
          </Link>
          <span className="text-xs text-blue-100 lg:hidden">
            Ruang kerja bendahara
          </span>
        </div>
        <div className="my-auto hidden max-w-md py-14 lg:block">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-white/25 bg-white/10">
            <CalendarIcon className="size-7 text-blue-100" aria-hidden="true" />
          </div>
          <h2 className="text-4xl font-semibold leading-[1.18] tracking-tight xl:text-5xl">
            Setiap kegiatan,
            <br />
            <span className="text-blue-200">punya rencana.</span>
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
            Siapkan jadwal, tempat, dan detail event dalam ruang kerja pribadi
            Anda.
          </p>
          <div className="mt-9 space-y-4 border-t border-white/20 pt-7">
            {[
              "Satu ruang untuk setiap event",
              "Detail kegiatan mudah dilengkapi",
              "Hanya dapat diakses akun pemilik",
            ].map((text) => (
              <p
                key={text}
                className="flex items-center gap-3 text-sm text-blue-100"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <CheckIcon aria-hidden="true" />
                </span>
                {text}
              </p>
            ))}
          </div>
        </div>
        <p className="hidden items-center gap-2 text-xs text-blue-100 lg:flex">
          <LockClosedIcon aria-hidden="true" />
          Ruang kerja pribadi · IDR · Asia/Jakarta
        </p>
      </section>
      <main
        id="main"
        className="flex flex-col justify-center px-4 py-7 sm:px-10 sm:py-10 lg:px-12"
      >
        <div className="mx-auto w-full max-w-[440px] rounded-2xl border border-border bg-white p-6 sm:p-8">
          {children}
          <p className="mt-6 border-t border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
            EventFund · Ruang kerja pribadi
          </p>
        </div>
      </main>
    </div>
  );
}
