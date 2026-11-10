# Phase 04 — Cashflow, reversal, bukti transaksi

Jalankan bersama MASTER_PROMPT.md setelah Phase03. Implementasikan **hanya Phase04**.

## Baca

AGENTS.md; PRD FR-04; BUSINESS_RULES §3/§5/BR-I/BR-F/§10–11; DATABASE income_sources/income_transactions/expense_transactions/attachments/audit/idempotency dan staged migrations; DESIGN_SYSTEM §8. Periksa current budget, event lock, authorization, money, dan lifecycle service.

## Pekerjaan

1. Buat schema income/expense/attachments dengan positive amount, status/date checks, self-reversal unique FK, composite event FK, immutable posted triggers. Contribution payment FK baru ditambah Phase05 saat tabel tersedia; saat ini source CONTRIBUTION tetap disisihkan untuk sistem dan ditolak generic route.
2. CRUD GENERAL source; archive tidak menghapus histori. Income NORMAL DRAFT/PENDING→RECEIVED atau CANCELLED; expense NORMAL DRAFT/PENDING→PAID atau CANCELLED. Version check saat update/post. Posted method/time wajib, date future ditolak, effective time terpisah created_at.
3. Expense optional satu item RAB; no-item reason wajib. Pada posting linked expense capture category/item label snapshot. Item archived tidak menghilangkan actual histori; posting baru ke item archived ditolak kecuali pengguna memilih item aktif atau tak teranggarkan.
4. Server hitung warning overbudget dan negative projected cash di dalam event-locked transaction. Tanpa acknowledgement balas409 tanpa write; setelah review kirim command baru yang dikonfirmasi dengan key baru. Warning tidak menjadi hard budget limit.
5. Posting dan reversal memakai key/hash/stored response dan audit satu commit. Reversal full append-only, original tetap posted; amount/kind/source/item/method/time linkage divalidasi. Tidak mengubah posted ke CANCELLED. Reversal atas reversal dan double reversal ditolak. Payment-linked income reversal nantinya harus melalui payment service, bukan generic endpoint.
6. Upload opsional JPEG/PNG/PDF max5MiB, max5 files/transaction. Validate signature/MIME/size, UUID storage key, outside public, temp cleanup, logical delete+audit, authorized download. Upload terpisah setelah posted commit agar kegagalan file tidak mengulang transaksi kas.
7. Sambungkan basic actual/cash aggregate dan close blockers DRAFT/PENDING income/expense. List search/pagination/filter, desktop table/mobile card/form, original/reversal detail dan confirmation. Belum perlu dashboard final/Excel.

## Tes wajib

- DRAFT/PENDING tidak memengaruhi kas; RECEIVED menambah, PAID mengurangi; posted reversal net tepat sekali. Original masih tampil; paired negative tidak menghitung dua kali.
- Warning ack flow; nominal melebihi budget tetap bisa commit; negative cash valid setelah acknowledgement; no-item reason422.
- Concurrent same key posting menghasilkan satu entry; key payload beda409; fault injection audit failure rollback posting+key. Double reversal409 dan raw SQL UPDATE posted ditolak.
- Cross-event source/item/target attachment FK dan non-owner routes404. Closed/archived mutation409; replay receipt authorized masih sama.
- File oversize413, MIME/signature mismatch415, SVG/HTML/executable ditolak; arbitrary storage path tidak dapat diakses; unauthorized download404; temp metadata failure cleanup.
- Report-date helper unit tests midnight Asia/Jakarta dan inclusive-date/exclusive-upper bound; reversal date≥original.
- Playwright income+expense+reverse+upload pada desktop/mobile. Migration fresh/upgrade, lint/build, auth regression.

## Selesai

Perbarui IMPLEMENTATION_PLAN.md. Jelaskan net cash/reversal evidence, migration, upload folder/run instructions, dan keterbatasan payment integration yang akan ditambahkan Phase05. Jangan menambahkan vendor installments, invoice allocations, refund parsial, atau laporan PDF. Berhenti di akhir Phase04.
