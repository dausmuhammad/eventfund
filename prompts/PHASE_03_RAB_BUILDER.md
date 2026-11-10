# Phase 03 — Dynamic RAB, baseline, revision, hybrid editor

Gunakan MASTER_PROMPT.md dan prasyarat Phase02. Implementasikan **hanya Phase03**.

## Baca

AGENTS.md; PRD FR-03/AC03/AC04/AC16; BUSINESS_RULES BR-M/BR-B/BR-E/BR-I; DATABASE categories/items/revisions/snapshot/SQL constraints; DESIGN_SYSTEM §5–6; implementation log. Pastikan event lock, Decimal helpers, scoped guard dan idempotency wrapper tersedia.

## Pekerjaan

1. Migration categories/items/revisions, composite FKs, qty/price checks, unique names/revision_no/one-draft partial index, immutable published snapshots dan current revision integrity. Incremental migration tidak boleh menghilangkan constraint Phase02.
2. Implement working RAB DRAFT batch editing: add/update/archive/reorder categories/items, custom unit, qty tiga desimal, price dua desimal. Save batch atomik dengan budget_version. Subtotal round half-up per item; sum Decimal; overflow reject. Jangan menyimpan total mutable yang dapat berbeda dari qty×price.
3. Desktop editable table memakai explicit Save, dirty state, error cell/summary, keyboard Tab/Enter/Escape dan Ctrl/Cmd+S yang sesuai DESIGN_SYSTEM. Mobile category cards dan edit form/sheet tanpa scroll horizontal. Nilai preview dilabeli belum tersimpan; official value dari server.
4. Baseline command: lock event, replay check, validate state/version, snapshot lengkap schemaVersion1, revision_no1 PUBLISHED, transition PLANNED, audit/idempotency, commit bersama. RAB kosong boleh dengan konfirmasi, tidak ada minimum angka hardcode.
5. Setelah baseline, working edit langsung ditolak. Start revision membuat snapshot draft dari current, base_revision_no dan version. Edit draft tidak mengubah working set. Publish dengan reason, current-version check, UUID ownership validation, atomic apply ke working, archive rows yang dihilangkan, published immutable snapshot/revision_no berikutnya, current pointer, audit/idempotency. Discard draft tidak menghapus histori.
6. Compare baseline/current/revision menampilkan qty/price/subtotal delta. Realisasi akan disambungkan Phase04; jangan mengarang angka actual. Duplicate event kini clone categories/items aktif dengan UUID baru dan mapping kategori baru, tetapi tanpa baseline/revision lama atau transaksi.
7. Tambahkan draft revision ke close blocker service; working draft tidak menciptakan status event baru.

## Tes wajib

- Expected subtotal independen: `1.125×10.10=11.36`, `0.005×1=0.01`; sum per-row rounding berbeda dari round-after-sum pada fixture yang sesuai; quantity0/negative dan precision berlebih ditolak.
- Cross-event category FK; stale budget_version409; batch satu baris invalid rollback seluruh batch; aggregate overflow tidak commit.
- Baseline replay satu published revision; baseline failure tidak meninggalkan PLANNED; published row UPDATE/DELETE ditolak DB.
- Draft revision tidak mengubah summary current; publish menghasilkan current snapshot cocok working tables; failed publish rollback; stale base/version409; one-draft index menolak create kedua.
- Archive category/item menjaga row stabil; duplicate menghasilkan UUID baru dan tidak menyalin history.
- Playwright desktop keyboard flow; mobile360 card/edit/save; dirty navigation confirmation; error stale tanpa overwrite. Migration fresh/upgrade, lint/build.

## Batas dan laporan

Tidak membuat cashflow atau peserta pada fase ini. Data actual pada comparison harus empty/0 yang berasal dari domain belum ada dengan label yang tepat, bukan fixture palsu dalam aplikasi. Laporkan file penting, migration, hasil tes dan demo baseline→draft→publish. Perbarui implementation log dan berhenti sebelum Phase04.
