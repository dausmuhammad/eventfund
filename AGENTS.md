# AGENTS.md — EventFund

Aturan kerja untuk agen yang mengimplementasikan repository ini. Baca sebelum mengubah kode. Bahasa komunikasi dan UI: Indonesia; nama kode: Inggris yang deskriptif.

## 1. Produk dan sumber kebenaran

EventFund adalah modular monolith untuk event, RAB dinamis, cashflow, peserta, tagihan, pembayaran parsial, dan laporan Excel. Implementasikan satu fase aktif sesuai prompts/PHASE_*.md dan docs/IMPLEMENTATION_PLAN.md.

Baca docs/PRD.md, docs/BUSINESS_RULES.md, docs/DATABASE.md, dan docs/DESIGN_SYSTEM.md. Untuk fase berikutnya, baca ulang bagian yang relevan serta progres terbaru. Jika menemukan konflik material, jangan memilih diam-diam: jelaskan konflik dan keputusan yang diusulkan; lanjutkan pekerjaan yang tidak tergantung keputusan itu. Jangan membuat persetujuan baru untuk keputusan rutin yang sudah tercakup spesifikasi.

## 2. Batas teknologi

- Next.js App Router, JavaScript .js/.jsx. Tidak membuat .ts/.tsx, tsconfig, tipe TypeScript, atau output shadcn TypeScript. Gunakan jsconfig dan konfigurasi generator JavaScript.
- Tailwind + shadcn/ui Radix; PostgreSQL + Prisma; Auth.js Credentials email/password dengan JWT session; Zod; ExcelJS; Vitest + Playwright.
- Pilih versi kompatibel pada Phase 01, catat persis di implementation log dan lockfile. Tidak perlu migrasi stack karena preferensi pribadi.
- Route Handlers adalah entry point mutasi bisnis. React Server Components boleh membaca lewat service yang sama. Server Action bila diperlukan harus tetap melalui service dan pemeriksaan akses yang sama.
- Tidak memakai SQLite sebagai pengganti PostgreSQL dalam tes transaksi. Tidak memasang hosting, microservices, queue, payment gateway, atau fitur AI.

## 3. Struktur dan batas modul

```text
prisma/{schema.prisma,migrations/,seed.js}
src/app/{(auth)/,(dashboard)/,api/}
src/components/{ui/,layout/,shared/}
src/features/{events,budget,incomes,expenses,participants,contributions,reports}/
src/lib/{auth,db,money,validation,storage}/
tests/{unit,integration,e2e}/
```

Di dalam feature, buat components, schemas, services, repositories hanya ketika dipakai. Domain calculation murni terpisah dari I/O. Service mengelola transaction boundary; repository menerima transaction client, bukan membuka transaksi tersembunyi. Tidak memanggil HTTP internal dari Server Components bila service langsung tersedia.

## 4. Invariant yang tidak boleh dilanggar

1. Seluruh data event diakses lewat event scope dan ownership server-side. ID dari client bukan bukti izin. Pemilik dibaca dari database; role/owner kiriman client diabaikan.
2. Uang dikirim dalam JSON sebagai string desimal, dihitung memakai Decimal server-side, disimpan NUMERIC(18,2). Jangan gunakan Number/parseFloat untuk hitung, pembulatan, atau pembandingan uang.
3. Pembayaran iuran dan income pasangannya harus commit atau rollback bersama. Satu payment entry tepat satu income entry; laporan kas membaca income saja.
4. Posting, reversal, perubahan status event, penerbitan/void tagihan, dan publikasi RAB mengambil lock event yang sama. Urutan lock event → charge → payment/transaction; banyak ID diurutkan.
5. Semua posting dan reversal idempotent dengan payload hash, unique key, dan hasil tersimpan. Retry tidak boleh menghasilkan efek kedua.
6. Posting bersifat immutable. Koreksi lewat reversal penuh dan transaksi pengganti, dengan alasan. Tidak menghapus histori, menandai original CANCELLED, atau mengecualikan original sekaligus menghitung reversal negatif.
7. RAB baseline dan revisi PUBLISHED immutable; draft revisi tidak mengubah anggaran aktif sebelum publish.
8. COMPLETED/CANCELLED/archived menolak mutasi operasional. Idempotent replay yang telah sukses masih boleh mengembalikan hasil setelah otorisasi.
9. Foreign key antarentitas event memakai pasangan event_id dan id. Jangan cukup percaya validasi form.
10. Dashboard dan Excel memakai financial summary service yang sama dan query snapshot konsisten.

## 5. Keamanan dan operasional

Hash password Argon2id; validasi dan normalisasi email di server. Auth.js Credentials tidak menyediakan registrasi dan penyimpanan password aplikasi secara otomatis. Buat alur tersebut secara eksplisit. Gunakan JWT session; periksa user aktif dan session_version di DB agar session lama dapat dicabut. Tidak mengandalkan middleware atau tombol tersembunyi sebagai authorization.

Custom API mutasi wajib same-origin/CSRF protection, tidak melakukan mutasi melalui GET. Parameterized raw SQL saja. Jangan log password, cookie, token, DATABASE_URL, atau body pembayaran penuh. Upload disimpan di luar public; download terautorisasi. Tidak menjalankan reset database atau menghapus data pengguna tanpa instruksi eksplisit.

## 6. Workflow tiap fase

1. Periksa repository, branch, perubahan lokal, dependency, migration, dan fase aktif. Pertahankan perubahan pengguna.
2. Nyatakan rencana singkat dan asumsi relevan; kerjakan fase sampai dapat ditinjau.
3. Buat migration berurutan, termasuk SQL check/index/trigger yang Prisma schema tidak wakili. Jangan mengedit migration yang sudah diterapkan.
4. Jalankan unit/integration/E2E sesuai risiko fase, lint, dan build. Hindari tes yang hanya menyalin implementasi. Tes keuangan memakai expected value independen.
5. Perbarui implementation log: deliverable, migration, perintah dan hasil tes, versi bila berubah, blocker, risiko, serta status fase.
6. Laporkan hasil, verifikasi yang benar-benar dijalankan, dan sisa pekerjaan. Jangan mengklaim PASS jika pemeriksaan tidak berjalan.
7. Berhenti pada batas fase; fase selanjutnya dimulai atas instruksi pengguna. Tidak perlu bertanya ulang di tengah fase untuk pekerjaan yang sudah diotorisasi.

## 7. Definition of done

Perilaku memenuhi acceptance criteria; akses lintas event ditolak; error dan loading ditangani; desktop dan mobile terverifikasi; migration dari DB kosong berhasil; tes yang relevan lulus; tidak ada secret di Git; docs sesuai implementasi. Infrastruktur yang tidak tersedia dilaporkan sebagai BLOCKED, bukan PASS. Jangan menyelesaikan fase hanya dengan UI mock atau response hardcode.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.codex/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.codex/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.codex/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.codex/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.codex/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.codex/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
