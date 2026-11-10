# Phase 01 — Foundation, autentikasi, design system

Gunakan bersama MASTER_PROMPT.md. Implementasikan **hanya Phase 01** sampai siap ditinjau. Target local development, tanpa deployment.

## Baca dan periksa

Baca AGENTS.md, PRD §2/§6/AC01, BUSINESS_RULES §1–2 dan error envelope §11, DATABASE §1/§3/§4.1/§4.16, DESIGN_SYSTEM §1–4/§10, IMPLEMENTATION_PLAN Phase01. Periksa repository, package manager, perubahan lokal, dan ketersediaan Node/PostgreSQL. Jangan menimpa aplikasi existing dengan scaffold baru tanpa memeriksa isinya.

## Pekerjaan

1. Pilih kombinasi versi stabil Next.js/React/Auth.js/Prisma/Tailwind/shadcn yang kompatibel, termasuk Argon2 implementation yang berjalan di Node runtime lokal. Catat exact versions/Node/PostgreSQL, simpan lockfile. Prisma harus mendukung interactive transactions dan parameterized raw SQL yang akan dipakai fase finansial. Jalankan smoke transaction commit/rollback di PostgreSQL sekarang.
2. Scaffold Next.js App Router JavaScript/JSX. Tidak boleh .ts/.tsx/tsconfig. Konfigurasikan shadcn untuk JavaScript dan Radix. Buat tokens, font fallback, shell responsif, Button/Input/Form/Dialog/Sheet dasar serta loading/empty/error yang benar-benar dipakai. Shell boleh demo, beri label jika belum terhubung domain.
3. Siapkan Prisma singleton server-only, migration users/auth_rate_limits sesuai dictionary, env.example tanpa secret, compose.yaml DB lokal bila Docker tersedia. DB test terpisah dengan guard nama `_test`; connection URL dev/test tidak boleh sama.
4. Implement registrasi email/password melalui service dengan Zod, lowercase email unik, Argon2id, generic duplicate/error response. Auth.js Credentials authorize memvalidasi input dan hash; JWT membawa userId/sessionVersion. Server guard cek user aktif serta session_version DB. Session max8jam; logout tersedia. Jangan memakai email magic link atau mengandalkan Credentials untuk menyimpan user otomatis.
5. Buat rate limiter DB atomic sesuai BR-A03. Proteksi custom mutation same-origin/CSRF, error envelope dan request ID. Jangan log password/cookie/body credential. Protected placeholder page membuktikan guard berjalan.
6. Buat money module: normalize string, Decimal parse, precision bounds, round half-up per item, serializer. Pembagian UI preview/server authoritative jelas. Tidak ada parseFloat/Number untuk hitung uang.
7. Siapkan scripts lint/build/test:unit/test:integration/test:e2e/db:generate/db:migrate/db:seed/dev. README aplikasi harus menjelaskan menjalankan DB/app/test dan env. Perintah harus sesuai versi framework yang dipakai.

## Tes dan bukti

- Unit: input money/qty valid/invalid, penolakan eksponen/NaN/precision berlebih, `1.125×10.10=11.36`, `0.005×1=0.01`, serializer string, batas nominal.
- PostgreSQL: migration DB kosong; email beda case duplicate ditolak; stored password bukan plaintext; transaction rollback smoke test; rate limiter atomic UPSERT.
- Auth/API: sukses login/logout, password salah/email tak dikenal pesan generik, inactive user/sessionVersion mismatch ditolak, unauthenticated endpoint401, protected page redirect; origin/token salah403; limiter429 dengan Retry-After.
- Playwright: register→login→protected shell→logout; viewport360/1440, keyboard form focus. Jangan mencetak password pada artifact.
- Jalankan lint dan build. Catat pemeriksaan NOT_RUN jika terhalang, beserta alasan.

## Batas dan selesai

Tidak membuat event/RAB/cashflow/contribution feature pada fase ini. Jangan menambahkan OAuth/SMTP/hosting. Phase01 READY_FOR_REVIEW hanya bila auth, money boundary, DB harness, dan smoke transaction nyata terbukti. Perbarui implementation log, sertakan versi yang dipilih, migration, hasil tes dan cara mencoba. Berhenti sebelum Phase02.
