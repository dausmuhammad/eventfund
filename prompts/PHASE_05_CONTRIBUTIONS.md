# Phase 05 — Peserta, tagihan, pembayaran atomik/idempotent

Jalankan bersama MASTER_PROMPT.md setelah Phase04. Ini gate integritas utama. Implementasikan **hanya Phase05** sampai skenario concurrency dan rollback terbukti di PostgreSQL nyata.

## Baca

AGENTS.md; PRD FR-05/06 dan AC07–AC14/AC17/AC18; BUSINESS_RULES §6–8, BR-A/E/F/H; DATABASE participants/charges/payments/paired income/trigger matrix; DESIGN_SYSTEM §7–8; implementation log. Periksa event lock, immutable income, idempotency store dan summary dasar.

## Pekerjaan

1. Buat migration participants, participant_charges, contribution_payments, income contribution_payment FK unique/composite, pairing/reversal/balance deferred triggers dan partial unique active charge. Raw SQL bypass service harus tetap ditolak untuk missing pair/mismatch/overpaid.
2. CRUD/search/archive participants sesuai BR-P; identifier nullable unique case-insensitive, nama boleh sama. Default setting editor dengan expectedVersion dan audit. Settings change tidak mengubah charge existing.
3. Create charge DRAFT dari default snapshot; NONE/DISCOUNT/SURCHARGE + reason; final amount computed/check DB. Refresh default draft explicit. Satu non-VOID per participant. Bulk create/issue max100 atomic; duplicate existing ditolak bukan ditimpa.
4. Issue membekukan amount/due_date/participant snapshot. Zero charge ISSUED computed PAID tanpa income/payment. Settlement dan overdue computed, bukan mutable DB status. VOID hanya bila net paid0; koreksi issued lewat reverse→void→new charge, tidak edit amount bahkan setelah reversal.
5. Payment service urutan authenticate→normalize/hash→transaction→lock event→guard/replay→state check→lock charge→compute current outstanding→validate→insert payment→matching income→audit→idempotency→commit. Semua repository menggunakan `tx` yang sama. Amount>0≤sisa. Method/time pair identik; source sistem CONTRIBUTION.
6. Full payment reversal menambah payment REVERSAL dan linked income REVERSAL dalam transaction yang sama, amount sama, pointers original benar, reason wajib. Original tetap immutable. Generic income reverse menolak contribution linked row. Historical payments pada charge yang kemudian VOID tetap tersimpan, tetapi net0.
7. Idempotency key event+actor scoped; exact replay same receipt/status, different payload/operation409. Replay tetap authorized setelah close/archived. Receipt menyimpan sisa saat transaksi; charge latest diambil terpisah. Lookup hasil pending-network untuk UI agar retry memakai intent/key sama.
8. UX desktop participants table dan mobile cards, form pembayaran empat langkah, conflict banner dengan sisa baru, receipt, attachment upload ke generated income. Network timeout tidak membuat key baru otomatis. Remaining berubah tidak auto-adjust amount.
9. Lengkapi close blockers charge DRAFT serta draft revision/income/expense; outstanding ISSUED hanya konfirmasi, bukan blocker. Payment vs close memakai lock event yang sama.

## Tes wajib dengan expected independen

- Fixture A BUSINESS_RULES:41×310000=12710000 charges; cash0 sebelum payment. Default berubah320000 tidak mengubah charge issued310000.
- Satu charge310000: bayar100000→sisa210000;150000→60000;60000→0. Setiap payment tepat satu income, cash sama jumlah payment net tanpa dobel.
- Charge zero dan full discount PAID tanpa cash; discount>base/negative final/reason kosong ditolak; no active charge duplicate; OVERDUE tambahan pada PARTIAL setelah due_date.
- Concurrency nyata minimal dua koneksi/barrier: same key parallel satu pair; beda key200000+150000 hanya satu commit pada charge310000; beda key100000+150000 keduanya commit dan net250000; payment vs reversal dan payment vs close tidak melanggar invariant.
- Fault sesudah payment insert, sesudah income insert, dan sesudah audit sebelum commit: seluruh payment/income/audit/key rollback. Jangan hanya mock Prisma untuk mengklaim atomicity.
- Full reversal150000 memperbesar outstanding dan mengurangi cash150000; duplicate reversal/key mismatch ditolak. Raw SQL missing income/mismatched amount/missing reverse pair/overpay menolak commit. VOID setelah semua pembayaran direversal harus sukses tanpa menghapus history.
- Issued amount immutable, issue pada DRAFT event ditolak, payment pada VOID/closed/archived ditolak, exact replay setelah close berhasil, non-owner404 termasuk receipt/file.
- Playwright timeout/retry dan stale outstanding UX; desktop1440/mobile360; lint/build, full integration regression dan migration fresh/upgrade.

## Selesai

Jangan menandai siap review tanpa bukti PostgreSQL concurrency dan rollback. Laporkan skenario paralel beserta hasil, paired row counts, migration/triggers, demo partial→reverse→void/reissue, dan known issues. Perbarui log. Tidak membuat multiple charge types, overpayment credit, gateway, atau refund parsial. Berhenti sebelum Phase06.
