# EventFund

Aplikasi pengelolaan anggaran dan keuangan event. Phase 01 menyediakan akun dan fondasi Decimal. Phase 02 menambahkan daftar, pembuatan, edit metadata, duplikasi terbatas, lifecycle dasar, serta arsip event milik sendiri. RAB, kas, peserta, dan laporan menunggu fase berikutnya.

Dokumentasi paket awal disimpan di [docs/PACKAGE_README.md](docs/PACKAGE_README.md). Status dan bukti pekerjaan ada di [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

Template UI memakai sidebar desktop, Sheet dan navigasi bawah mobile, pencarian/filter event, ringkasan kegiatan, serta form shadcn/ui JavaScript dengan primitive Radix. Validasi Zod client/server menampilkan error per field dan ringkasan yang dapat difokuskan. Registrasi memiliki konfirmasi serta toggle visibilitas kata sandi; perubahan status memakai dialog konfirmasi; form metadata menjaga isian saat gagal dan memperingatkan saat meninggalkan perubahan. Arah, inventory komponen, dan batasnya ada di [docs/UI_TEMPLATE.md](docs/UI_TEMPLATE.md).

## Menjalankan lokal

Gunakan Node 24, npm 11, dan PostgreSQL. Seluruh versi paket dipin di package.json dan package-lock.json. Jangan menjalankan reset database development.

```sh
npm ci
```

Salin `.env.example` menjadi `.env`, lalu isi password database dan `AUTH_SECRET` acak minimal 32 karakter. `.env` diabaikan Git. `AUTH_URL`, `NEXTAUTH_URL`, dan `APP_ORIGIN` harus identik, misalnya `http://127.0.0.1:3000`. NextAuth 4 memakai `NEXTAUTH_URL`; konfigurasi aplikasi memakai `AUTH_SECRET` secara eksplisit.

Alamat `localhost` dan `127.0.0.1` otomatis diarahkan ke alamat lokal pada `APP_ORIGIN` sebelum form digunakan, supaya origin dan cookie konsisten. Proteksi CSRF tetap memeriksa origin secara ketat. Setelah mengubah alamat di `.env`, restart dev server; untuk hasil build, jalankan ulang `npm run build` lalu `npm run start` agar aturan redirect dan runtime memakai konfigurasi yang sama.

Untuk Docker, hidupkan Docker Desktop lalu jalankan:

```sh
docker compose up -d db
```

Compose menyediakan database `eventfund` pada localhost:5432. Buat `eventfund_test` secara terpisah pada server yang sama untuk pengujian. PostgreSQL lokal dapat dipakai sebagai alternatif; sesuaikan kedua URL. Pengujian transaksi tidak memakai SQLite.

```sh
npm run db:generate
npm run db:migrate
npm run dev
```

Buka alamat `APP_ORIGIN` pada `/register`, buat akun, lalu masuk. `/events` menampilkan daftar event sendiri; buat event untuk memulai. `/api/health` menunjukkan proses aplikasi hidup, bukan kesiapan database.

Event baru berstatus DRAFT. DRAFT menjadi PLANNED hanya lewat baseline RAB pada Phase 03. Penutupan COMPLETED belum dibuka sampai semua blocker keuangan Phase 05 terhubung. Pembatalan dengan alasan dan konfirmasi, arsip/unarchive status final, serta reopen COMPLETED tersedia pada service. Tidak ada penghapusan event. Duplikasi saat ini menyalin metadata pilihan, default iuran dan sumber GENERAL aktif; tidak menyalin RAB, peserta, transaksi, lampiran atau histori asal.

Seed akun demo opsional:

```sh
npm run db:seed
```

Isi `SEED_DEMO_EMAIL` dan `SEED_DEMO_PASSWORD` melalui environment terlebih dahulu. Seed tidak mengganti nama/password akun existing. Jangan memasukkan password demo tetap ke Git.

## Pengujian

`TEST_DATABASE_URL` harus menunjuk PostgreSQL berbeda, dengan nama database mengandung `_test`. Runner dan suite menolak database development. Suite membersihkan bucket limiter pada database test dan akun fixture miliknya; tidak me-reset schema atau data development. Jangan menjalankan integration dan E2E bersamaan pada DB test yang sama.

```sh
npm run lint
npm run test:unit
npm run test:integration
npx playwright install chromium
npm run test:e2e
npm run build
```

E2E memakai port 3100, origin dan secret test tersendiri. Jika unduhan Chromium terhalang tetapi Chrome sudah terpasang, pada PowerShell gunakan `$env:PLAYWRIGHT_CHANNEL='chrome'` sebelum `npm run test:e2e`. Trace/video dan screenshot otomatis dimatikan supaya kredensial tidak masuk artifact. Screenshot eksplisit diambil setelah logout atau pada shell tanpa password.

Untuk E2E terhadap hasil produksi, set `$env:PLAYWRIGHT_PRODUCTION='true'` sebelum `npm run test:e2e`. Runner membangun aplikasi memakai origin test lalu menjalankan `next start`. Sesudahnya, jalankan `npm run build` tanpa environment test sebelum memulai server lokal biasa agar redirect memakai APP_ORIGIN yang benar.

Webpack dipakai untuk dev/build karena Turbopack pada host uji gagal membuat proses transformasi CSS. Sumber aplikasi tetap JavaScript/JSX; tidak ada tsconfig atau sumber TypeScript.

## Keamanan dan batas lokal

- Password Argon2id; email trim/lowercase; duplicate registration memakai respons generik.
- JWT maksimum delapan jam dengan batas usia absolut; user aktif dan session_version diperiksa melalui DB. Helper invalidateSessions tersedia; UI ubah password belum termasuk fase ini.
- Custom registration memakai origin check dan CSRF double-submit bertanda tangan. Endpoint Auth.js memakai proteksi bawaan Auth.js.
- Rate limit disimpan PostgreSQL: lima percobaan login gagal per identitas dan 30 per ingress dalam 15 menit; registrasi lima per jam. Fixed window memungkinkan burst pada batas window. Untuk binding localhost, semua request memakai satu identitas ingress loopback; header forwarding client diabaikan. Ini sengaja konservatif untuk lingkungan lokal, belum konfigurasi reverse proxy publik.
- `.local/` berisi cluster dan konfigurasi host khusus sesi pengembangan ini; seluruhnya diabaikan Git. Jangan mengunggahnya.
- Audit dependency melaporkan temuan transitif; rincian dampak ada pada implementation log. Tidak ada klaim siap deployment publik.

Cluster test terisolasi sesi ini berjalan di `127.0.0.1:55439`. Database development mengikuti `.env` pengguna pada localhost:5432; runner test memakai override environment proses dan tidak mengubah `.env`. Cluster test memakai PostgreSQL 13.23 yang tersedia di host, tanpa memakai data cluster pengguna. Versi ini hanya lingkungan verifikasi lokal dan sudah [di luar masa dukungan](https://www.postgresql.org/support/versioning/); gunakan PostgreSQL yang masih didukung untuk lingkungan baru. Compose menargetkan 17.11, tetapi belum diuji karena daemon Docker tidak tersedia.

Jika cluster khusus sesi ini perlu dinyalakan lagi, gunakan `pg_ctl` dari instalasi PostgreSQL lokal dengan data directory `D:/Frontend/EventFund/.local/postgres-data`, opsi `-h 127.0.0.1 -p 55439 -c timezone=UTC`, dan log di `.local/postgres.log`. Jangan mengarahkan perintah tersebut ke data directory pengguna lain.
