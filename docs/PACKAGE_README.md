# EventFund — Paket Implementasi v1.0

Spesifikasi siap pakai untuk membangun aplikasi RAB event dinamis, cashflow, dan iuran peserta. Bahasa antarmuka: Indonesia. Target awal: local development. Dokumen ini adalah rancangan implementasi, bukan aplikasi yang sudah berjalan.

Tanggal paket: 10 November 2026. Sumber keputusan: percakapan **Rancang Aplikasi RAB Event**, termasuk pilihan cakupan B, model iuran B, email/password, dan local development. Rincian yang belum ditetapkan dalam percakapan dikunci sebagai keputusan desain di PRD §2 agar Codex tidak perlu menebak.

## Isi paket

```text
EventFund/
├── README.md
├── AGENTS.md
├── docs/
│   ├── PRD.md
│   ├── BUSINESS_RULES.md
│   ├── DATABASE.md
│   ├── DESIGN_SYSTEM.md
│   └── IMPLEMENTATION_PLAN.md
└── prompts/
    ├── MASTER_PROMPT.md
    ├── PHASE_01_FOUNDATION.md
    ├── PHASE_02_EVENT_MANAGEMENT.md
    ├── PHASE_03_RAB_BUILDER.md
    ├── PHASE_04_CASHFLOW.md
    ├── PHASE_05_CONTRIBUTIONS.md
    ├── PHASE_06_REPORTING.md
    └── PHASE_07_HARDENING.md
```

## Mulai di Codex

1. Ekstrak ZIP. Salin **isi folder EventFund** ke root repository aplikasi; AGENTS.md harus berada sejajar dengan package.json nantinya. Jika repository sudah memiliki dokumen bernama sama, gabungkan setelah meninjau perbedaannya; jangan menimpa kode atau dokumen tanpa pemeriksaan.
2. Buka root repository tersebut di Codex. Baca PRD terlebih dahulu untuk memahami batas produk.
3. Salin isi [MASTER_PROMPT.md](prompts/MASTER_PROMPT.md) ke chat Codex, lalu isi [PHASE_01_FOUNDATION.md](prompts/PHASE_01_FOUNDATION.md). Master prompt memberi aturan bersama; prompt fase menentukan pekerjaan aktif.
4. Codex mengimplementasikan satu fase, menjalankan pemeriksaan, lalu mencatat hasil di [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md). Tinjau demo dan bukti pengujian; mulai fase berikutnya dengan prompt yang bersangkutan.
5. Jika melanjutkan chat baru, berikan master prompt dan prompt fase aktif. Catatan progres repository menjadi sumber status, bukan ingatan chat.

Contoh instruksi awal:

> Baca AGENTS.md dan seluruh docs. Jalankan prompts/PHASE_01_FOUNDATION.md. Implementasikan sampai acceptance criteria fase ini terpenuhi, jalankan pemeriksaan yang tersedia, dan perbarui progres. Berhenti pada akhir fase ini.

Semua fase saat paket dibuat berstatus **NOT_STARTED**. Tidak ada klaim migration, build, atau tes aplikasi sudah dijalankan.

## Teknologi dan lingkungan

Next.js App Router; JavaScript .js/.jsx tanpa TypeScript; Tailwind; shadcn/ui berbasis Radix; PostgreSQL; Prisma ORM dengan Prisma Client yang mendukung interactive transactions dan raw SQL terparameterisasi; Auth.js Credentials email/password; Zod; ExcelJS; Vitest; Playwright. Tidak ada hosting, OAuth, atau layanan berbayar yang perlu dipasang untuk MVP.

Phase 01 harus memilih versi stabil yang saling kompatibel, mencatat versi persis dan Node runtime, serta menyimpan lockfile. Jangan memasang paket `latest` tanpa verifikasi. Gunakan dokumentasi **versi Prisma yang dipilih**: API dan kemampuan transaksi tidak boleh diasumsikan sama antarversi mayor.

Kontrak perintah yang harus dibuat oleh implementasi:

```sh
npm ci
docker compose up -d db
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Perintah tersebut baru dapat berjalan setelah Phase 01 membuat aplikasi, package.json, dan compose.yaml. Jika Docker tidak tersedia, gunakan PostgreSQL lokal dengan database pengembangan serta pengujian terpisah. DB test boleh direset; DB pengembangan tidak boleh direset otomatis.

Variabel contoh yang harus tersedia di `.env.example`: DATABASE_URL, TEST_DATABASE_URL, AUTH_SECRET, AUTH_URL (sesuai versi Auth.js), APP_ORIGIN, LOCAL_UPLOAD_DIR, SEED_DEMO_EMAIL, SEED_DEMO_PASSWORD. Isikan placeholder; jangan menyimpan secret atau password demo tetap dalam Git. Binding development default localhost, zona waktu event Asia/Jakarta, mata uang IDR. Password demo diatur operator lewat environment dan di-hash ketika seed dijalankan.

## Cara membaca dan menyelesaikan konflik

| Kebutuhan | Sumber utama |
|---|---|
| Cakupan dan keputusan produk | [PRD](docs/PRD.md) |
| Formula, status, transaksi, authorization | [BUSINESS_RULES](docs/BUSINESS_RULES.md) |
| Struktur penyimpanan dan integritas | [DATABASE](docs/DATABASE.md) |
| Interaksi dan tampilan | [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) |
| Urutan kerja dan bukti penerimaan | [IMPLEMENTATION_PLAN](docs/IMPLEMENTATION_PLAN.md) |

Instruksi terbaru pemilik proyek mengungguli dokumen. Bila perubahan menyentuh kontrak finansial, dokumentasikan keputusan, perbarui seluruh rujukan yang terdampak, dan sertakan migration serta tes yang sesuai. Prompt fase tidak boleh diam-diam mengubah aturan bisnis.

## Batas paket

MVP memakai akses pemilik event. Tabel role anggota dan kolaborasi dibahas sebagai evolusi, bukan fitur tersembunyi dalam fase awal. Pembayaran vendor bertahap, hutang/piutang umum, payment gateway, refund parsial, PDF, import Excel, dan deployment publik di luar cakupan. Reversal penuh tetap wajib untuk koreksi transaksi tercatat. Audit minimal untuk perubahan finansial tetap wajib; antarmuka audit lengkap ditunda.

## Referensi teknis

Referensi resmi diperiksa saat penyusunan paket. Instruksi API harus dicocokkan kembali dengan versi paket saat implementasi.

- [Next.js: authentication dan authorization](https://nextjs.org/docs/app/guides/authentication)
- [Auth.js: Credentials provider](https://authjs.dev/reference/core/providers/credentials)
- [Auth.js: strategi session](https://authjs.dev/concepts/session-strategies)
- [Prisma Client: transaksi versi v6 sebagai referensi API klasik](https://www.prisma.io/docs/orm/v6/prisma-client/queries/transactions)
- [PostgreSQL: row locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [ExcelJS: repository dan dokumentasi](https://github.com/exceljs/exceljs)

Desain EventFund di dokumen ini adalah keputusan proyek. Referensi tersebut mendukung penggunaan teknologinya, bukan sumber aturan bisnis EventFund.
