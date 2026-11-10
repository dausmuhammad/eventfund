# Phase 02 — Event management, ownership, lifecycle foundation

Gunakan bersama MASTER_PROMPT.md. Lanjutkan setelah Phase01 accepted atau instruksi eksplisit pengguna. Implementasikan **hanya Phase02**.

## Baca dan periksa

Baca AGENTS.md; PRD FR-01/02 dan AC02/AC14; BUSINESS_RULES §2–3/BR-I/§11; DATABASE events/settings/sources/audit/idempotency serta migration staging; DESIGN_SYSTEM shell/lifecycle; implementation log. Verifikasi auth guard, CSRF, error envelope dan Prisma transaction wrapper sudah bekerja.

## Pekerjaan

1. Buat migration events, event_contribution_settings, income_sources, audit_logs, idempotency_records dengan FK/index/check relevan. Current revision FK/trigger yang membutuhkan tabel budget ditambahkan Phase03. Jangan membuat tabel role anggota atau endpoint invite.
2. Buat create event service atomik: owner dari session, DRAFT/IDR/Asia-Jakarta, settings0, exactly-one source CONTRIBUTION. UI field nama, tanggal, lokasi, deskripsi; tidak meminta owner ID. Event list/switcher hanya owner, archived filter terpisah; detail404 untuk non-owner.
3. Edit metadata dengan expectedVersion, validasi dates dan field lengths. Event-scoped guard dan lock helper menjadi jalur standar semua mutation. User aktif/session version dicek; idempotency replay tidak melewati ownership check.
4. Implement lifecycle state service BR-E dan archive/unarchive. DRAFT→PLANNED **hanya** lewat baseline Phase03; jangan membuat tombol atau API bypass. Siapkan extensible close-blocker checks agar nanti membaca domain yang benar-benar tersedia; close belum dianggap lengkap sebelum Phase05 menghubungkan seluruh blockers.
5. Implement reopen COMPLETED→ACTIVE dengan reason; CANCELLED terminal; archive hanya COMPLETED/CANCELLED. Audit perubahan dalam transaction. Gunakan idempotency key/hash/stored response untuk lifecycle commands. Replay success lama boleh dibaca saat event archived setelah authorization.
6. Duplikasi membuat event DRAFT ID baru, metadata pilihan/default settings/sources GENERAL baru. Tidak menyalin posted data, participant, attachment, baseline atau history. RAB clone ditambahkan Phase03; UI/release note harus jujur tentang cakupan saat ini.
7. Buat event dashboard shell dengan context header dan navigation; jangan menampilkan uang contoh sebagai data aktual. Empty state memberi CTA susun RAB yang sesuai prasyarat fase berikutnya.

## Tes dan bukti

- Dua user fixtures: semua list/read/PATCH/command/duplicate atas event user lain ditolak404; event ID/path/body yang bertentangan tidak merubah scope.
- Create failure sesudah event insert rollback settings/source/event/audit. Duplicate membuat UUID baru dan owner sama, source sistem tepat satu.
- Metadata stale version409; date end<start422; owner_id body tidak mengubah ownership.
- Transition matrix termasuk DRAFT→PLANNED ditolak tanpa baseline; test PLANNED/ACTIVE via DB fixture eksplisit yang konsisten dengan schema fase ini. Invalid archive/reopen/cancel ditolak.
- Dua koneksi mengambil event lock: mutation kedua menunggu dan membaca state hasil commit pertama. Idempotency key same payload replay identik, key different payload409. Audit tetap konsisten.
- Playwright event create/edit/list/switcher pada360/1440; auth behavior tetap lulus. Lint/build dan migration fresh DB.

## Selesai

Perbarui IMPLEMENTATION_PLAN.md dengan status dan bukti; catat close blocker dan duplicate RAB yang menunggu fase berikutnya. Jangan menandai fitur close penuh selesai sebelum semua domain tersedia. Berhenti setelah Phase02 READY_FOR_REVIEW; tidak membuat RAB editor pada fase ini.
