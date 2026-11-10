# Phase 07 — Hardening, acceptance, runbook lokal

Gunakan MASTER_PROMPT.md setelah Phase06. Selesaikan kualitas seluruh alur EventFund v1; tidak melakukan deployment publik.

## Baca dan audit

Baca semua docs, AGENTS.md dan implementation log. Cocokkan implementasi terhadap AC01–AC18 dan invariant BR/DB, bukan hanya daftar task fase. Identifikasi regression, endpoint tanpa guard, trigger hilang, placeholder yang tersisa, UI mock, dan test yang mengklaim concurrency tanpa koneksi paralel.

## Pekerjaan

1. Susun matriks coverage acceptance criteria→test/evidence. Lengkapi jalur register/login→event→RAB baseline→revision publish→GENERAL income→expense→participant→charge→partial payment→reversal→dashboard→Excel→close→reopen. Uji desktop1440/mobile360.
2. Audit seluruh entry point page/API/Server Action/file/report/receipt. Auth required, scope owner, is_active/session_version, CSRF/origin, Zod limits, decimal string serialization, error envelope tanpa secret. Middleware tidak boleh menjadi satu-satunya proteksi.
3. Uji dan perbaiki concurrency: same-key retry, different-key overpay, valid parallel partials, payment vs close, payment vs reversal, double reversal, duplicate active charge, stale revision publish, stale metadata save. Semua writer mengambil event lock sebelum membaca nilai authoritative; gunakan koneksi PostgreSQL terpisah dan barrier.
4. Verifikasi DB constraints/triggers final benar-benar ada melalui catalog query dan negative raw SQL tests; migration dari kosong serta upgrade snapshot fase sebelumnya berjalan. Seed idempotent tidak overwrite password/data pengguna. DB test reset guard terbukti melindungi dev DB.
5. Security file tests: path traversal, MIME spoof, file signature, oversized file, ownership, logical deletion, download headers. Temp orphan cleanup berbasis metadata/umur tidak menghapus file valid. Rate limiter DB tahan restart; logger tidak memuat secret/contact yang tidak diperlukan.
6. Accessibility dan UX: keyboard RAB/payment, focus trap/restore, label/error association, status tidak hanya warna, touch44px, zoom200%, reduced motion, no page horizontal scroll360. Dirty navigation, network retry, event context, closed read-only, warning acknowledgement berfungsi. Perbaiki masalah yang menghalangi alur.
7. Jalankan dataset target1000 items/1000 participants/5000 cash entries; ukur list/save p95 dan export sampai10000 rows/sheet, catat runtime/hardware/sample size. Tuning pagination/index/query berdasarkan hasil. Jika target gagal, perbaiki atau tandai belum memenuhi dengan bukti; jangan menurunkan target diam-diam.
8. Backup PostgreSQL dan folder file lokal, restore ke DB/storage baru, jalankan migration/version check, row counts/FK/trigger dan financial reconciliation. Jangan restore dengan menimpa dev DB pengguna. Tambahkan runbook startup, env, migration, test, backup/restore, troubleshooting login/db/file, dan known limitations pada README aplikasi.
9. Review dependency vulnerabilities dengan tooling tersedia; perbaiki yang relevan dan kompatibel, jangan upgrade mayor seluruh stack tanpa kebutuhan. Jalankan lint/build/unit/integration/E2E akhir setelah perubahan terakhir. Catat NOT_RUN bila alat/jaringan tidak tersedia.

## Gate penerimaan

- Semua AC01–AC18 dibuktikan dengan hasil test/demonstrasi yang dapat ditinjau.
- Payment+income+audit+idempotency tidak dapat setengah commit; dashboard/Excel exact totals cocok; published history immutable.
- Non-owner tidak bisa membaca/mengubah/download; completed/archived menolak mutation baru dan tetap mengizinkan authorized exact replay.
- Mobile/desktop alur utama lancar; login, money parsing, error/retry, close/reopen dan report semantics jelas.
- Migration fresh/upgrade, seed idempotency, backup/restore PG+files dan final checks lulus. Bila blocker material tersisa, fase tetap IN_PROGRESS/BLOCKED dengan uraian yang jujur.

## Hasil akhir

Perbarui docs/IMPLEMENTATION_PLAN.md, termasuk versi akhir, matriks acceptance, migration, tes/performance/restore, known risks dan cara menjalankan. Laporkan hasil utama dan langkah mencoba aplikasi lokal. Tandai READY_FOR_REVIEW, bukan ACCEPTED tanpa review pengguna. Tidak men-deploy, mengunggah data, mengaktifkan public sharing, atau memulai fitur berikutnya.
