# Phase 06 — Unified financial summary, dashboard, Excel

Jalankan bersama MASTER_PROMPT.md setelah Phase05. Implementasikan **hanya Phase06**.

## Baca

AGENTS.md; PRD FR-07/AC15; BUSINESS_RULES §9/§12/§13 secara penuh; DATABASE canonical queries dan snapshot rules; DESIGN_SYSTEM §9; implementation log. Periksa cash/reversal/charge calculation yang sudah ada dan gabungkan ke service tunggal agar rumus tidak tersebar.

## Pekerjaan

1. Buat financial summary domain/service tunggal: B/B0/I/E/C/Q/P/R/N/J, saldo kas, remaining/projected budget, projected income/funding gap, utilization. Ikuti formula BR-F persis. Payment hanya detail iuran; cash dari income. Hindari join multiplication; aggregate dahulu atau query terpisah di snapshot sama.
2. Dashboard current all-time menampilkan KPI, per-category/item budget vs actual, inactive item actual, tak teranggarkan, tunggakan/overdue, dan warning. Pisahkan actual, commitment, dan projection. B=0 utilization null; cash/variance negatif ditampilkan benar.
3. Report date range memakai effective received_at/paid_at, timezone event, batas `[from,to+1)`; opening+movement=closing. RAB/receivable/participant adalah posisi saat snapshot dan harus diberi label, bukan diklaim historis pada tanggal range. Reversal dihitung di tanggalnya; original tetap pada tanggal original.
4. Satu REPEATABLE READ read-only transaction materialisasikan summary dan detail konsisten, lalu commit sebelum Excel generation. Simpan snapshot_at, generated_at, revision_no, scope/filter metadata. Dashboard/export memakai summary service sama. Jangan membandingkan dua snapshot berbeda sebagai equality test.
5. ExcelJS workbook sheets persis Summary, RAB, Budget_Revisions, Incomes, Expenses, Participants, Charges, Payments. Kolom status/kind/original IDs/signed_effect transparan; published revision metadata + flattened item snapshots. Format header/freeze/autofilter/width/IDR/date dan nama file aman.
6. Nominal normal numeric hanya setelah pemeriksaan roundtrip presisi; >15 significant digits atau tidak aman ditulis teks decimal penuh dengan label. Input user menjadi string literal, tidak objek formula/hyperlink. Totals resmi precomputed server, tidak bergantung kalkulasi formula Excel.
7. Batas10.000 rows per sheet setelah flatten, termasuk Budget_Revisions; preflight count dan tolak413 jika melebihi, tanpa truncation. Download authorized/no-store; current/closed/archived semua boleh read/export. Jangan export secret/storage paths.
8. UI reports filter/scope/processing/error jelas. Ukur dataset target PRD dan catat mesin/runtime; tuning index/pagination hanya berdasarkan bukti query.

## Tes wajib

- Fixtures A/B/C dari BUSINESS_RULES §13 dengan expected decimal string independen; dashboard service dan parsed workbook sama pada satu snapshot. Setelah reversal P turun dan R naik tanpa double subtraction/double count.
- Opening100000 + income movement−100000 pada reversal day →closing0; test midnight Jakarta, date boundary dan no future entries. Current-position labels tidak berubah menjadi historical claims ketika range dipilih.
- Expense pending tidak masuk cash; GENERAL pending masuk J saja; charge DRAFT/VOID tidak masuk receivable; zero charge tidak cash; archived item actual tetap di total.
- Workbook readback ExcelJS: semua8 sheet, headers/row counts, cells/number formats, reversal references, revision rows, summary metadata dan totals. String `=1+1`, `+SUM(A1)`, `@x` tetap text; tidak ada formula object dari user data. Large amount roundtrip safe/text exact.
- Non-owner export404, no-store/content type/file name benar; row limit tidak truncate; response error tidak dikirim sebagai file xlsx sukses.
- Playwright dashboard→filter report→download→validate workbook. Build/lint, integration/E2E regression. Buka workbook manual bila viewer tersedia dan catat jika tidak tersedia.

## Selesai

Laporkan metrik fixture dan workbook validation, file sample yang aman, performance measurement, serta migration/index bila ada. Perbarui log. Tidak membuat PDF, CSV/import Excel, automated email, atau public sharing. Berhenti sebelum Phase07.
