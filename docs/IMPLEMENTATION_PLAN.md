# Implementation Plan — EventFund v1.0

Status terbaru dicatat pada tabel dan implementation log di bawah. Saat paket awal dibuat seluruh fase NOT_STARTED; implementasi Phase 01 dimulai atas instruksi pengguna pada 10 November 2026. Ketergantungan linear 01→02→03→04→05→06→07; jangan membangun ketujuh fase dalam satu instruksi.

## 1. Aturan eksekusi dan progres

Satu fase mencakup persiapan, kode, migration, unit/integration/E2E relevan, demo yang bisa ditinjau, dan pembaruan progres. Selesai coding belum berarti fase diterima. Status: NOT_STARTED → IN_PROGRESS → READY_FOR_REVIEW → ACCEPTED. BLOCKED boleh digunakan bila prasyarat eksternal menghalangi; catat bukti dan pekerjaan yang masih bisa diteruskan. Hanya pemilik proyek yang menyatakan ACCEPTED; agen boleh READY_FOR_REVIEW jika semua kriteria dan pemeriksaan terpenuhi.

Lanjut fase berikutnya setelah pengguna menginstruksikan melanjutkan; tidak meminta persetujuan tambahan untuk langkah rutin dalam fase aktif. Bila fase sebelumnya belum ditandai accepted tetapi pengguna secara eksplisit meminta fase berikutnya, catat instruksi itu sebagai keputusan review dan lanjut sepanjang tidak ada blocker integritas yang diketahui.

| Phase | Deliverable inti | Status |
|---|---|---|
| 01 | Foundation, auth, design tokens, DB test harness | READY_FOR_REVIEW |
| 02 | Event ownership, lifecycle foundation, duplicate/archive | READY_FOR_REVIEW |
| 03 | Dynamic RAB, baseline, revision, hybrid editor | NOT_STARTED |
| 04 | General income/expense, reversal, local attachments | NOT_STARTED |
| 05 | Participants, charges, atomic/idempotent payments | NOT_STARTED |
| 06 | Unified summary, dashboard, Excel | NOT_STARTED |
| 07 | Security, concurrency, accessibility, restore, release lokal | NOT_STARTED |

## 2. Phase 01 — Foundation dan design system

**Prasyarat:** repo dapat diakses; Node dan PostgreSQL atau Docker tersedia. Jika tidak, lakukan setup yang diotorisasi atau catat blocker tanpa mengaku telah menjalankan aplikasi.

**Deliverable:** Next.js App Router JS/JSX; Tailwind/shadcn Radix JS; tokens dan shell responsif; Prisma connection; users + auth_rate_limits migration; Auth.js Credentials JWT; register/login/logout; server guard; rate limiter; error envelope; decimal money helpers; Vitest, PostgreSQL integration harness, Playwright; env.example; compose database lokal; health endpoint tanpa secret; README aplikasi dengan install/run/test.

**Langkah:** pilih versi kompatibel dan catat; scaffold minimal; smoke-test Prisma interactive transaction/raw SQL; implement hash/registration/session guard; tampilkan auth dan shell demo yang jujur; buat scripts; test. Jangan membuat domain kas/tagihan sebelum fondasi lolos.

**Exit criteria:** AC01; login salah generik, password hashed, email unique case-insensitive, inactive/session_version mismatch ditolak, rate limit bekerja, protected route menolak unauthenticated; Decimal rounding/serialization lolos; build dan lint JS berhasil; app dijalankan lokal dan viewport360/1440 diperiksa; migrations test DB kosong berhasil. Dependency/version incompatibility harus diselesaikan pada fase ini.

**Bukti:** versi Node/paket/PostgreSQL; migration name; test output ringkas; screenshot auth/shell; perintah startup yang berhasil. Tidak menyimpan screenshot yang memuat password/token.

## 3. Phase 02 — Event management dan ownership

**Prasyarat:** 01 accepted/instruksi lanjut; auth guard dan transaction wrapper tersedia.

**Deliverable:** events, settings, sources, audit, idempotency schema dasar; event CRUD metadata tanpa hard delete; create defaults; owner scoped pages/API; status service/lock helper; archive/unarchive; duplicate metadata dan settings; event switcher. Clone RAB ditambahkan Phase 03; tidak mengklaim duplicate lengkap sebelum itu.

**Transisi bertahap:** DRAFT→PLANNED hanya dapat dipicu baseline service Phase 03. Phase 02 membuat guard dan transition service, bukan endpoint bypass baseline. Close blocker registry/check service diperluas Phase 03/04/05 saat tabel tersedia. Untuk tes status PLANNED/ACTIVE di fase ini pakai fixture test eksplisit, bukan tombol produksi yang melompati baseline. Close tidak boleh dirilis sebagai fitur lengkap sampai semua blockers Phase 05 terhubung.

**Exit criteria:** AC02 untuk read/write event; create atomic beserta settings/source; metadata stale update 409; non-owner404; duplicate ID baru tanpa data finansial; archive hanya status final, unarchive tidak reopen; invalid transition ditolak; idempotent lifecycle replay dan key conflict teruji; audit transition atomik. Race lock event tervalidasi dengan dua transaksi PostgreSQL.

**Bukti:** test ownership matrix, lifecycle matrix, migration fresh DB, seed dua user; demo create/edit/duplicate metadata. Catat fitur yang sengaja menunggu schema fase berikutnya.

## 4. Phase 03 — Dynamic RAB builder

**Prasyarat:** 02. **Deliverable:** categories/items/revisions migrations; server Decimal subtotal; batch save DRAFT; hybrid desktop table/mobile card/form; baseline; draft revision snapshot; publish/discard; revision compare; duplicate RAB; budget totals read API. Sesuaikan current_revision event integrity dan close blocker draft revision.

**Exit criteria:** AC03, AC04, AC16 bagian RAB; rounding per baris; total overflow ditolak; invalid category event FK; stale batch tidak overwrite; failed batch rollback; baseline idempotent; direct edit setelah baseline ditolak; draft revision tidak mengubah current; published snapshot immutable; publish draft stale 409; item removal archive; clone UUID baru tanpa revision history. Event DRAFT dengan RAB kosong bisa baseline setelah konfirmasi.

**Bukti:** baseline/revision snapshots fixture; keyboard dan viewport360/1440; test migration SQL/check/index; exact-value tests untuk fractional quantity.

## 5. Phase 04 — Cashflow dan bukti transaksi

**Prasyarat:** 03. **Deliverable:** GENERAL sources CRUD; income/expense draft/pending/post/cancel; append-only reversal; warnings; idempotency posting/reversal; minimal financial audit; local upload/download authorization; basic cash list/totals service; server dates and range helper. Payment-related FK/trigger belum aktif sampai Phase 05; generic endpoint tetap menolak source CONTRIBUTION.

Tambahkan blockers income/expense DRAFT/PENDING ke close service. Budget item archived tetap terhubung expense, overbudget dihitung terhadap current working budget. Tidak perlu menambahkan dashboard final atau Excel pada fase ini.

**Exit criteria:** AC05, AC06; posted immutable; reversal signed net tepat sekali; double reversal dan reversal atas reversal ditolak; replay posting tidak menggandakan entry; failure audit rollback; paid/pending cash terpisah; archived item actual tetap dihitung; no-item reason wajib; source CONTRIBUTION tidak bisa dipakai manual; upload MIME/signature/size/XOR target/owner checks; posted mutation pada COMPLETED/archived ditolak. Net cash boleh negatif dengan acknowledgement.

**Bukti:** integration cash/reversal tests, unauthorized file access, date boundaries, upload cleanup failure; migration from Phase03 DB. Screenshot entry desktop/mobile.

## 6. Phase 05 — Peserta, tagihan, pembayaran

**Prasyarat:** 04; payment-income integration diperluas di schema/migration fase ini.

**Deliverable:** participants; charge snapshot/default/adjustments; issue/void/reissue; payment/receipt; full payment reversal; idempotency receipt lookup; matching income FK unique; deferred pair/balance triggers; settlement/overdue computed; charge zero flow; participant cards/table; attachment link generated income; all close blockers final.

**Exit criteria:** AC07–AC14, AC17–AC18; default change tidak mutasi issued; non-VOID charge unique; amount never float; payment+income+audit+key atomic; receipt replay immutable; concurrent distinct keys tidak overpay; simultaneous same key satu pair; reversal mengurangi kas dan menambah outstanding; direct income reversal linked payment ditolak; issued amount immutable walaupun pembayaran telah dibalik; VOID setelah net0 diperbolehkan sambil menyimpan payment history; event close vs payment aman. Uji raw SQL missing pair/mismatch/overpay menolak commit.

**Bukti:** real concurrent HTTP/DB tests dengan dua koneksi; fault injection sesudah payment insert; receipt dan summary fixture; UI network timeout/retry proof; full close blocker demo.

## 7. Phase 06 — Dashboard dan reporting Excel

**Prasyarat:** 05. **Deliverable:** summary service tunggal sesuai BR-F; overview dashboard; budget vs actual per item/category termasuk inactive/unbudgeted; contribution aging/overdue; ExcelJS workbook delapan sheet; read snapshot export; range opening/movement/closing; row/precision limit guards; download error UX.

**Exit criteria:** AC15; semua fixture BUSINESS_RULES §13 tepat; same snapshot summary dan workbook sesuai sampai dua desimal; linked contributions tidak double count; pending bukan cash; period reversal tidak menghapus original periode lampau; current position diberi label terpisah cash range; high precision amount plain decimal text aman; malicious formula-like user strings tetap literal; export tidak membawa password/path; non-owner 404; completed/archived export tetap boleh; batas rows tidak truncate. Workbook dibuka kembali dengan ExcelJS dan diperiksa nilai, format, sheet, row count.

**Bukti:** fixture expected totals independen, parsed workbook assertions, manual buka workbook di viewer tersedia; ukur render waktu dataset target. Jangan menuntut evaluator formula karena total resmi sudah dihitung server.

## 8. Phase 07 — Hardening dan kesiapan lokal

**Prasyarat:** 06. **Deliverable:** review akses seluruh entry point; concurrency matrix; regression happy path; accessibility; performance/pagination; structured logs tanpa secret; migration fresh/upgrade; seed idempotency; backup+restore PG dan local files; final README runbook dan known limitations; dependency/security review dengan perbaikan relevan. Tidak deploy publik dan tidak menambahkan fitur di luar scope.

**Exit criteria:** seluruh AC01–AC18 PASS atau blocker material dilaporkan sehingga fase belum READY_FOR_REVIEW; lint/build/unit/integration/E2E sukses; desktop1440 dan mobile360 happy path dari create event hingga export; unauthorized download/report/API tidak bocor; CSRF rejected; rate limit survives restart; concurrent payment/reversal/close outcomes konsisten; duplicate RAB benar; restore database+files direkonsiliasi. Performance target PRD diuji dengan hardware/runtime dicatat, bukan diklaim dari asumsi.

**Bukti:** matriks hasil, screenshot kunci, report hasil pengujian, migration replay, backup/restore checksum/count dan financial reconciliation. Jika dependency audit tidak dapat berjalan karena jaringan, tulis NOT_RUN serta konsekuensi; jangan lapor “aman” tanpa hasil.

## 9. Test strategy lintas fase

| Layer | Apa yang diuji | Alat |
|---|---|---|
| Unit | Money parsing/rounding, formulas, settlement, overdue, state matrix, canonical payload hash | Vitest |
| Integration PostgreSQL | Composite FK, checks/triggers, transaction rollback, immutable records, locks, idempotency, ownership, date aggregates | Vitest + PostgreSQL dedicated |
| API | Status/error envelope, request validation, CSRF, session revocation, query scopes | Integration HTTP/test runtime |
| E2E | Register/login, create→baseline→cash→charge→partial→reverse→export, hybrid layout, conflict/retry UX | Playwright |
| Export | Load generated workbook; sheets/values/metadata/precision/text-safety; summary equality | ExcelJS + Vitest |

Jangan mock Prisma untuk membuktikan row lock, deferred trigger, atau transaction atomicity. Gunakan dua koneksi database yang benar-benar paralel dan barrier agar race terjadi; sequential Promise tanpa overlap tidak cukup. Fault injection hanya dalam test harness, tidak endpoint publik.

Target scripts aplikasi: `lint`, `build`, `test:unit`, `test:integration`, `test:e2e`, `db:generate`, `db:migrate`, `db:seed`. `test:integration` tidak menyentuh DB dev; Playwright test DB dan port terpisah. Pilih lint command yang sesuai Next.js versi terpasang, jangan mengasumsikan legacy `next lint` tersedia.

## 10. Risk register dan change control

| Risiko | Penanganan | Gate |
|---|---|---|
| Prisma/Auth.js tidak kompatibel versi terpasang | Pin exact versions, smoke login dan transaction | 01 |
| Total client float berbeda | Decimal boundary dan string serializer | 01,03 |
| Scope event bocor lewat file/report | Guard server + composite FK + security matrix | 02,04,06,07 |
| Revisi draft mengubah budget aktif | Snapshot terpisah dan atomic publish | 03 |
| Reversal mengurangi dua kali | Signed pair, original unchanged, date fixture | 04,05,06 |
| Duplikasi payment/overpay | Event+charge locks, key hash unique, triggers | 05 |
| Historical report menyesatkan | Scope current position vs cash period eksplisit | 06 |
| File orphan / restore tidak lengkap | Temp cleanup, metadata+storage backup/restore | 04,07 |

Perubahan spesifikasi dicatat ID keputusan baru, alasan, dokumen terdampak, migration/test impact. Jika scope berubah, perbarui PRD, BUSINESS_RULES, DATABASE, UX dan prompt fase yang terkait sebelum menandai fitur selesai.

## 11. Implementation log — diisi saat implementasi

### Pemadatan kartu ringkasan berdasarkan screenshot, 10 November 2026

- Instruksi pengguna: kartu mobile masih memiliki ruang berlebih setelah tombol dan antarbagian. Cakupan khusus ringkasan event dan kartu pendukung; mempertahankan perubahan Popover/Drawer/mandatory sebelumnya.
- Hero: padding16px mobile/20px desktop, gap12px, hapus pengantar berulang; label tombol Duplikasi/Pengaturan dipersingkat dan disusun dua kolom mobile, aria-label tetap Duplikasi event/Pengaturan event. Action grid dapat membungkus pada ruang sempit. Target tombol44px dipertahankan.
- Jadwal/lokasi menjadi dua kolom, padding vertikal12px dan ikon16px; bulan singkat mengurangi wrapping. Catatan/persiapan padding16px, helper berulang dihapus, checklist gap12px, progress gap12px, antarkartu16px. Empty catatan tetap jujur; data event tidak dipotong/dihapus.
- Tidak ada migration/dependency/service/data development berubah. Lint/build/E2E dan pemeriksaan screenshot dicatat bersama hasil final pemilih responsif di RESPONSIVE_PICKERS_VERIFICATION.md.
- Final: lint PASS, build PASS,8 E2E produksi PASS (27,1 detik), git diff --check PASS; screenshot ringkasan360/1440 diperiksa. Build .env pengguna dipulihkan dan container test dihentikan; server pengguna tetap berjalan. Status fase tidak berubah.

### Popover desktop, Drawer mobile dan indikator wajib, 10 November 2026

- Instruksi pengguna: kalender desktop harus Popover yang menempel ke seluruh field, tanggal/dropdown mobile muncul dari bawah sebagai Drawer; field mandatory memakai * merah; Popover dipadatkan. Ini mengoreksi interpretasi kalender inline pada audit sebelumnya. Tetap antislop during; tidak memulai Phase03.
- Deliverable: ResponsivePicker dengan Radix Popover desktop288 px dan Drawer Radix Dialog mobile<768 px. Sel desktop36 px/sel mobile44 px; anchor seluruh Button, collision-aware placement, portal di luar form, tanggal Indonesia, canonical YYYY-MM-DD, dismiss dan return focus. Drawer memiliki handle, max92dvh, scrollable body, safe-area, animasi180/140ms dan reduced-motion. Mode manual dan kalender tetap bergantian.
- Select status event dan tindakan lifecycle mempertahankan Radix Select desktop. Mobile memakai Drawer+listbox terkontrol, indikator pilihan, panah/Home/End/Enter/Space, fokus opsi terpilih, dismiss dan input hidden bernama bila dipakai dalam form. Field wajib dan checkbox pengakuan bertanda * merah; optional tetap berlabel. Nama aksesibel tidak memasukkan simbol dekoratif.
- Dependency @radix-ui/react-popover1.1.15 dipasang kembali dan dipin. Install melaporkan12 vulnerabilities (9 moderate/3 high); tidak menjalankan force upgrade. Node host26 berbeda dari target24, engines dipertahankan.
- Verifikasi awal: lint PASS, unit30/30 PASS, build PASS, E2E8/8 PASS (28,5 detik). Menguji posisi Lokasi tetap saat kalender terbuka, panel bukan bagian form, anchor desktop dan lebar<=300 px, Drawer mobile menyentuh bawah viewport, keyboard Select mobile, marker wajib dan regresi akun/event. Reflow empat lebar+teks200% tetap lulus. Capture kalender setelah pergantian viewport diperbaiki agar animasi tidak terekam setengah jalan.
- Tidak ada migration/perubahan service/database development/.env. Test memakai PostgreSQL17.11 khusus di Docker; build normal dipulihkan setelah E2E. Detail dan hasil final di docs/RESPONSIVE_PICKERS_VERIFICATION.md.

### Audit UI/UX penuh dan redesign akun/event, 10 November 2026

- Instruksi pengguna: audit penuh dan perbaiki tampilan semaksimal mungkin, termasuk field kalender yang hanya dapat diklik lewat ikon dan overlay yang menimpa form. Antislop during tetap dari pilihan sesi; tidak berganti mode after atau meminta pemilihan temuan untuk pekerjaan yang sudah diotorisasi.
- Audit mencakup login/registrasi, shell/sidebar/mobile navigation, list/arsip/filter/empty state, create/edit/duplicate, ringkasan, switcher, lifecycle/konfirmasi/read-only, loading/error404, keyboard/reflow dan kegagalan jaringan. Temuan, perbaikan dan bukti ada di UI_UX_AUDIT.md.
- Redesign: palette navy/slate/biru yang konsisten, font system Segoe UI, sidebar232 px dengan konteks akun dan active state pada halaman anak, header reflow, list baris menggantikan kartu besar/banner pemasaran, ringkasan identitas event dengan metadata dan progress kelengkapan riil, satu kartu form dengan helper singkat, auth split navy/kartu form, serta loading/error surface yang sesuai. Logo/favicon SVG sebelumnya dipertahankan.
- Kalender: seluruh field Button dapat diklik, tanggal terformat Indonesia, panel inline menggeser konten di bawahnya, hanya satu panel terbuka. Kalender/mode input manual bergantian agar ringkas. Kosongkan/Hari ini/pilih hari/Selesai menutup dan mengembalikan fokus; Escape dari panel. Mode manual dan hidden canonical input mempertahankan kontrak server YYYY-MM-DD. Mobile scroll menampilkan panel; tidak ada calendar portal/z-index overlay.
- Popover dan dependency langsung @radix-ui/react-popover dihapus karena tidak dipakai. react-day-picker9.11.1 tetap dipin. Uninstall offline bukan audit dependency jaringan dan tidak dipakai sebagai bukti bebas kerentanan; catatan risiko dependency sebelumnya tetap terbuka.
- Perbaikan audit: error TypeError jaringan diterjemahkan ke pesan Indonesia dan input dipertahankan; tes abort HTTP membuktikan retry simpan berhasil. Reflow kalender360/768/1024/1440 dengan root font200% sempat gagal; header membungkus, padding/kolom/calendar table disesuaikan tanpa menyembunyikan overflow. Dua E2E sempat gagal karena selector alert juga mencocokkan Next route announcer; selector dibatasi ke pesan form, lalu8/8 PASS (22,2 detik) sebelum pemadatan mode manual terakhir.
- Tidak mengubah migration/service bisnis/database development/.env. Verifikasi memakai container PostgreSQL17.11 eventfund-ui-review-postgres/eventfund_ui_test yang sudah dibuat terpisah. Node host26.13.0 berbeda dari target24; tidak mengubah engines. Hasil final dicatat di UI_UX_AUDIT.md. Phase02 tetap READY_FOR_REVIEW, Phase03 belum dimulai.
- Hasil final source: lint PASS, unit30/30 PASS, build Webpack PASS, E2E produksi8/8 PASS (21,8 detik) dengan kalender/manual/tutup, return focus dirty-dialog, abort jaringan/retry dan reflow360/768/1024/1440+teks200%. Screenshot duplikasi menunggu heading/tombol siap sebelum capture; source form/kalender/detail/auth dan overlay diperiksa visual. Server pengguna3000 read-only smoke login200 memuat desain baru. Build normal dengan .env dipulihkan setelah E2E; container test dihentikan. Laporan18 temuan dan Delivery Gate: docs/UI_UX_AUDIT.md.

### Sidebar berwarna, identitas dan kalender, 10 November 2026

- Instruksi pengguna: review dan perbaiki komponen yang masih bawaan browser, sidebar berwarna modern SaaS, logo/favicon, dan layout lebih padat. Antislop during dari pilihan sesi. Cakupan tetap fitur akun/event Phase 02; tidak memulai Phase 03.
- Review source: Input/Textarea sudah komponen reusable pola shadcn; Select, Checkbox dan dialog telah memakai Radix. Dua tanggal event masih memakai input date browser. Diganti DatePicker + Calendar (React DayPicker) + Radix Popover, dengan locale Indonesia, input YYYY-MM-DD, pemilihan hari, bulan sebelumnya/berikutnya, kosongkan, Hari ini, Escape dan pemulihan fokus. Validasi server tetap schema semula; error rentang tanggal diperbarui ketika tanggal dikoreksi.
- Sidebar navy 224 px, canvas slate #EEF2F7, header64 px, kartu16–20 px dan jarak form16 px. Kontrol tetap44 px; input mobile16 px/desktop14 px. Logo SVG kalender/F pada desktop/mobile/auth dan icon.svg favicon. Alasan/dials di UI_TEMPLATE.md; ENERGY2/RHYTHM2/MOTION1.
- Dependency baru dipin: @radix-ui/react-popover1.1.15, react-day-picker9.11.1. Instalasi melaporkan12 vulnerabilities (9 moderate,3 high); tidak menjalankan force upgrade. Runtime host Node26.13.0/npm11.20.0 berbeda dari target Node24/npm11; npm mencatat EBADENGINE. Tidak mengubah engines proyek.
- Tidak ada migration baru atau perubahan service bisnis. .env dan data development dipertahankan. Database test konfigurasi pengguna tidak dapat diakses oleh runner; verifikasi memakai container PostgreSQL17.11 khusus eventfund-ui-review-postgres pada127.0.0.1:55439, DB eventfund_ui_test, secret acak hanya environment proses. Kedua migration existing berhasil pada DB kosong. Tidak memakai cluster lokal lama yang disebut log sebelumnya.
- Build sandbox awal gagal EPERM menulis .next; build host berhasil. Chrome channel tidak tersedia, lalu Chromium Playwright1254 berhasil diunduh. Run E2E awal gagal karena selector tanggal ambigu dan timing pemulihan fokus; selector dibedakan dan penutupan dialog ditunggu. Run berikutnya8/8 PASS (17,8 detik). Screenshot kemudian menemukan error tanggal tertinggal; perbaikan dan assertion regresi ditambahkan sebelum verifikasi final.
- Lint dan unit30/30 PASS sebelum perubahan validasi tanggal; hasil final dan Delivery Gate dicatat pada docs/SAAS_UI_VERIFICATION.md. Ponsel fisik dan screen reader nyata tidak diuji. Status Phase02 tetap READY_FOR_REVIEW, bukan ACCEPTED.
- Verifikasi final source: lint PASS, unit30/30 PASS, build produksi PASS, E2E8/8 PASS (19,6 detik) termasuk assertion error tanggal pulih; screenshot form desktop/kalender mobile/detail mobile diperiksa. PostgreSQL17.11 fresh migration PASS. Suite integration terpisah tidak diulang karena service/schema tidak berubah. Build dengan .env pengguna dijalankan ulang setelah E2E agar origin runtime kembali normal. Delivery Gate terperinci pada SAAS_UI_VERIFICATION.md.

### Penyempurnaan template UI dan validasi Phase 02, 10 November 2026

- Instruksi pengguna: membuat template UI/UX yang menarik, validasi form lengkap, dan komponen/field shadcn/ui + Radix. Mode antislop during dari sesi tetap berlaku. Tidak memulai Phase 03.
- Deliverable: AppShell sidebar desktop 240 px, mobile Sheet dan bottom navigation; page heading/card/badge/alert/skeleton bersama; event list dengan pencarian/status filter, empty filtered state, ringkasan detail/persiapan; switcher dalam Radix Dialog yang dapat dicari; halaman akun diperbarui. Input, Textarea dan Field dipakai untuk seluruh isian yang tersedia; Select/Checkbox/AlertDialog/Sheet/Dialog menggunakan primitive Radix. Seluruh source tetap JS/JSX.
- Validasi: schema Zod dibagi client/server dan pesan Indonesia; error per field, aria-invalid/describedby, summary dengan fokus/tautan field, request ID, batas panjang, urutan tanggal, konfirmasi sandi, alasan dan pengakuan lifecycle. Form mempertahankan input saat gagal. Visibilitas sandi memakai tombol berlabel; field konfirmasi tidak dikirim ke registrasi. Perubahan metadata yang belum disimpan dilindungi konfirmasi tautan dan beforeunload. Dialog lifecycle menyebut nama event/dampak, focus trap dan return focus; key retry tetap dipertahankan.
- Perbaikan API: readJson event memakai batas 32 KiB agar panjang maksimal metadata/deskripsi yang sah tidak ditolak batas default 4 KiB. Batas registrasi tidak dilonggarkan. Tidak ada migration, perubahan data development, atau perubahan kalkulasi uang. Client tetap tidak menentukan owner/status; lifecycle staging dan batas duplikasi tetap berlaku.
- Dependensi tambahan dipin: @radix-ui/react-alert-dialog 1.2.1, react-checkbox 1.4.1, react-select 2.4.1, react-dropdown-menu 2.2.1, react-icons 1.3.2. package-lock diperbarui. Install melaporkan 12 vulnerabilities (9 moderate, 3 high); bukan audit bersih dan tidak menjalankan force upgrade.
- Bukti awal: unit 30/30 PASS, integration PostgreSQL 9/9 PASS, lint PASS, build Webpack PASS. Delapan E2E produksi desktop/mobile PASS setelah memperbaiki blur yang mengganggu pointer/fokus; verifikasi final serta screenshot dicatat pada docs/UI_TEMPLATE_VERIFICATION.md.
- Kondisi host: PowerShell awal kehabisan memori; pembacaan sementara memakai cmd. Instalasi npm sandbox tertahan jaringan dan berhasil di host. Dev server EventFund yang teridentifikasi dihentikan sementara untuk mengurangi memori saat build/test. Tidak menghentikan proses aplikasi lain atau mengubah `.env` pengguna. Tidak ada .git sehingga diff/branch/index audit tetap NOT_RUN.
- Risiko/batas: ponsel fisik dan screen reader nyata NOT_RUN; browser Chrome diuji 360/1440 dan reflow 200%. Modul keuangan berikutnya belum disimulasikan dengan angka contoh. Tidak mengubah status ACCEPTED; Phase 02 tetap untuk review pengguna.
- Arah desain, alasan komponen, versi dan perilaku: docs/UI_TEMPLATE.md. Laporan Delivery Gate dan hasil akhir: docs/UI_TEMPLATE_VERIFICATION.md.
- Verifikasi final sesudah seluruh perubahan source: lint PASS; unit30/30 PASS; E2E produksi8/8 PASS (2,9 menit), termasuk boundary description4000/4001, feedback error hilang setelah koreksi, dan metadata fixture dipulihkan setelah uji batas. Screenshot form/overview/list/login desktop dan mobile diperiksa. Delivery Gate PASS. Tidak ada migration baru untuk dijalankan ulang dari DB kosong; migration Phase02 tidak disentuh.
- Build final dengan `.env` pengguna exit0. Dev server dikembalikan di host pada port3000, sesuai mode server sebelum pekerjaan. Smoke read-only final PASS: health200, event API401 tanpa sesi, login200 memuat copy template baru; stdout server tanpa error pada permintaan ini. Tidak membuat akun/event contoh pada database development.

### Phase 02, 10 November 2026

- Instruksi pengguna: “lanjut phase 02”, lalu memilih antislop during. Instruksi lanjut menjadi keputusan meneruskan dari Phase 01 READY_FOR_REVIEW; tidak menganggap Phase 01 atau 02 ACCEPTED tanpa review pengguna.
- Status Phase 02: READY_FOR_REVIEW. Berhenti pada batas fase; tidak membuat editor RAB, transaksi kas, peserta, atau laporan.
- Deliverable: schema events/settings/sources/audit/idempotency; service owner-scoped; row lock event; metadata optimistic version; validasi tanggal; create transaction; default DRAFT/IDR/Asia-Jakarta, iuran 0 dan satu sumber sistem; daftar aktif/arsip; detail/settings; native event switcher; duplikasi metadata pilihan/default/sumber GENERAL aktif; lifecycle dasar, alasan/konfirmasi, audit atomik dan replay stored response. Guard memeriksa akun aktif/session_version lagi dalam transaksi setelah lock.
- Migration `202611100002_events`: tabel/index/composite unique/FK/check, deferred integrity settings/sumber, partial unique CONTRIBUTION, proteksi sumber sistem/owner, append-only audit/idempotency. FK/trigger current revision ke budget sengaja menunggu Phase 03. Migration foundation tidak diubah. Tidak ada reset atau penghapusan data pengguna.
- Migration berhasil pada upgrade database test terisolasi, database baru kosong `eventfund_phase02_fresh_test`, dan development `.env` pengguna localhost:5432. Test menggunakan cluster 13.23 port 55439 lewat override environment, tanpa mengubah `.env`. Database test dan fixture event/audit dipertahankan; history tidak dihapus untuk cleanup.
- Verifikasi: generate Prisma PASS; unit 30/30 PASS; integration PostgreSQL 9/9 PASS; lint PASS; build Webpack PASS; E2E Chrome 8/8 PASS dengan build produksi pada 1440/360. Dua skenario event diulang setelah penambahan assertion keyboard/screenshot: 2/2 PASS. Integration final mencakup dua cancel serentak key sama, conflict payload, replay setelah arsip, audit tepat satu, dua koneksi lock dengan observasi pg_stat_activity, rollback sesudah event insert, ownership, stale version, fixture PLANNED/COMPLETED, reopen dan pencabutan sesi.
- Batas lifecycle: DRAFT→PLANNED tidak mempunyai API bypass. Baseline Phase 03 satu-satunya jalur produksi. `complete` menolak dengan CLOSE_NOT_AVAILABLE sampai seluruh blocker Phase 05 tersedia; findCloseBlockers menjadi titik integrasi modul berikutnya dan juga dipanggil cancel. Fixture database eksplisit dipakai untuk menguji ACTIVE/reopen, bukan tombol melompati baseline. Tidak mengklaim close penuh selesai.
- Batas duplikasi: hanya metadata pilihan/default settings/GENERAL aktif, ID baru dan source CONTRIBUTION baru. Clone RAB menunggu Phase 03; UI dan README menyebut batas ini. Tidak menyalin histori asal, baseline, peserta, transaksi atau lampiran.
- Kendala yang diselesaikan: engine Prisma Windows terkunci server lokal lama; server EventFund dihentikan dan generate berhasil. Schema engine di sandbox gagal, migration berhasil setelah eskalasi. E2E development pertama gagal alokasi memori setelah tiga tes desktop; E2E produksi 8/8 sukses. Runner kini mendukung PLAYWRIGHT_PRODUCTION=true. Prettier tidak mendukung schema Prisma tanpa plugin; schema diformat dengan prisma format, JS/JSX dengan Prettier.
- Tidak ada perubahan versi dependency/lockfile. Tidak ada .git sehingga branch/diff/secret-in-index NOT_RUN; `.env` dan `.local` tetap diabaikan. Docker/PostgreSQL 17.11, ponsel fisik, audit dependency ulang dan review pengguna NOT_RUN. Temuan dependency Phase 01 masih berlaku. Memori server dev pada host tetap risiko lokal; gunakan hasil build produksi bila kompilasi dev kehabisan memori.
- Bukti UI, arah desain, Delivery Gate dan rincian verifikasi: docs/PHASE_02_VERIFICATION.md; screenshot test-results/events-desktop.png dan events-mobile.png. Tidak ada uang contoh sebagai data aktual.
- Prasyarat Phase 03: instruksi lanjut pengguna; tambahkan budget schema, deferred revision integrity, baseline dan clone RAB. Phase 04/05 wajib menghubungkan blockers nyata sebelum membuka close.
- Build final dengan `.env` pengguna exit 0 setelah E2E; `npm run start` kembali berjalan pada port 3000, origin kanonis localhost. Pemeriksaan source baru tidak menemukan parseFloat/Number untuk uang, logging, URL kredensial, atau em dash; ignore secret tetap berlaku.
- Smoke final host exit 0: /api/health 200, /api/events tanpa sesi 401, alias 127.0.0.1/login 307 menuju localhost:3000/login. Server awal di sandbox memakai port tetapi tidak merespons dari host; hanya proses Next EventFund terkait dihentikan lalu dimulai ulang di host dan HTTP berhasil. Server lokal dibiarkan berjalan untuk review.

### Environment dan versi

Dipilih dan diuji pada Windows, 10 November 2026. Node 24.19.0, npm 11.10.0, Next.js 16.4.6, React/React DOM 19.3.1, Tailwind/PostCSS 4.3.5, Prisma CLI/Client 6.19.3, NextAuth 4.24.15, Zod 4.6.7, ExcelJS 4.4.0, Vitest 5.1.0, Playwright 1.65.0, Argon2 0.45.2, ESLint 9.39.5, eslint-config-next 16.4.6, Prettier 3.9.10. Lockfile menyimpan seluruh versi transitif.

Radix Dialog 1.3.1, Label 2.1.17, Slot 1.5.0; class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.7.0. Konfigurasi shadcn JavaScript (`tsx:false`); komponen dasar ditulis di source dengan pola shadcn/Radix, tidak memakai generator TypeScript atau memasang shadcn CLI. Dialog yang dipakai berubah menjadi sheet bawah di mobile.

PostgreSQL nyata yang tersedia: 13.23, cluster baru terisolasi `.local/postgres-data` pada loopback port 55439, timezone UTC. Bukan cluster PostgreSQL pengguna yang telah berjalan. Compose menargetkan PostgreSQL 17.11; Docker CLI 29.1.3 tersedia tetapi daemon tidak berjalan, sehingga Compose NOT_RUN. PostgreSQL 13 sudah [end-of-life](https://www.postgresql.org/support/versioning/); dipakai untuk bukti transaksi lokal saja, bukan rekomendasi lingkungan baru. Chrome host digunakan melalui Playwright `channel=chrome`; unduhan Chromium Playwright gagal karena timeout/TLS jaringan.

Pemilihan NextAuth 4 stabil didasarkan peer dependency yang mencakup Next.js 16 dan React 19; API Credentials/JWT diverifikasi dengan alur login nyata. [Dokumentasi Credentials](https://next-auth.js.org/providers/credentials), [instalasi Next.js](https://nextjs.org/docs/app/getting-started/installation). Prisma 6 dipin agar interactive transaction/raw SQL sesuai API yang diuji. Webpack dipakai karena Turbopack gagal menjalankan worker CSS pada host Windows, termasuk di luar sandbox.

### Template entri fase

```text
Phase:
Status:
Started / finished:
User instruction / review decision:
Deliverables and key files:
Migrations and data impact:
Commands executed and actual outcomes:
Acceptance criteria and evidence:
Screenshots / workbook / performance evidence:
Not run and reasons:
Known risks / blockers / remaining work:
Specification decisions changed:
Next phase prerequisites:
```

### Progres saat paket dibuat

Belum ada fase implementasi dimulai. Dokumen ini tidak memberi izin reset DB pengguna, deployment publik, atau pengiriman data ke layanan eksternal.

### Phase 01, 10 November 2026

- Instruksi pengguna: melanjutkan Phase 01; mode antislop `during` dipilih melalui jawaban 1. Review pengguna belum dilakukan.
- Kondisi awal: hanya dokumentasi dan skill lokal, tidak ada `.git`, aplikasi, lockfile, atau migration. Tidak membuat commit/branch atau mengubah database existing. README paket awal dipertahankan sebagai docs/PACKAGE_README.md.
- Deliverable: App Router JS/JSX; shell akun dengan label fase; form register/login/logout; Radix dialog/sheet; loading, empty, error; server-only Prisma singleton; registrasi Argon2id dan email unik; JWT delapan jam dengan batas usia absolut; validasi akun aktif/session_version pada callback sesi dan guard; invalidation helper; origin/CSRF; limiter PostgreSQL; envelope error/request ID; bounded JSON body; money/quantity Decimal precision 48 dan serializer tanpa kehilangan pecahan; scripts unit/integration/E2E/build; README/env/Compose.
- Migration `202611100001_foundation`: hanya users/auth_rate_limits, UUID, email lower/trim, indeks unik email case-insensitive, positive version/session_version dan check limiter. Berhasil diterapkan pada database dev baru dan test kosong. Tidak ada domain event/RAB/kas/tagihan dibuat.
- Keamanan lokal: `.env` dibuat dengan secret acak, `.env`/`.local` diabaikan Git. Tidak mencetak password/token/URL database lengkap. Form menggunakan POST dan disabled sampai hydration agar native submission tidak membocorkan isian melalui query string. Error penting fokus ke pesan, isian dipertahankan.
- Rate limit memakai satu identitas loopback tepercaya karena app hanya binding 127.0.0.1, bukan forwarding header client. Seluruh request lokal berbagi bucket IP, lebih konservatif daripada pemisahan banyak IP; perilaku ini harus dievaluasi lagi jika scope deployment berubah. Fixed-window boundary burst terdokumentasi di README.
- Verifikasi akhir: `npm run db:generate` PASS; `npm run db:migrate` pada dev baru dan migration deploy pada test kosong PASS; `npm run lint` tanpa error/warning PASS; `npm run test:unit` 25/25 PASS; `npm run test:integration` 4/4 PASS (termasuk commit/rollback raw SQL, UPSERT limiter paralel, duplicate register dan seed idempotent); `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` 6/6 PASS; `npm run build` Webpack exit 0 PASS setelah perubahan source terakhir. E2E 2 menit, integration 3,51 detik dan unit 1,14 detik adalah durasi run lokal, bukan klaim target performa produk.
- Bukti UI: `test-results/login-{desktop,mobile}.png` dan `shell-{desktop,mobile}.png`; screenshot tidak berisi password. Arah desain dan kontras ada di docs/FOUNDATION_DESIGN.md. Rasio dihitung memakai formula WCAG lewat Node karena alias Python host tidak dapat dijalankan.
- Kegagalan selama pengerjaan yang telah ditangani: unduhan engine Prisma DNS di sandbox (generate berhasil setelah eskalasi); schema engine tidak berjalan di sandbox (migration nyata berhasil di host); Turbopack worker CSS (Webpack berhasil); CommonJS default export NextAuth (interop diperbaiki); race navigasi test (menunggu heading form baru); selector alert Next.js announcer (dibatasi ke pesan error form).
- Audit `npm audit --json` dan `npm audit fix`: tetap 12 temuan (9 moderate, 3 high), bukan klaim aman. Prisma CLI/@prisma/config/deepmerge-ts: recursive graph merge, tidak menerima konfigurasi pengguna lewat aplikasi; minimatch/typescript-eslint: glob DoS tooling lint; ExcelJS/uuid: buffer bounds v3/v5/v6, ExcelJS belum dipakai dalam fase ini. Tidak memaksa upgrade mayor Prisma atau downgrade ExcelJS; mitigasi/peninjauan lanjut sebelum modul reporting dan hardening. Tidak ada public deployment.
- NOT_RUN: Docker Compose/PostgreSQL 17.11, Chromium hasil unduhan, hardware keyboard ponsel, migrasi upgrade dari fase sebelumnya (fase pertama), review pengguna. Git status/secret-in-index tidak dapat diperiksa karena belum ada repository Git; pemeriksaan source dan ignore dilakukan sebagai gantinya.
- Verifikasi reflow tambahan menemukan overflow pada root font 200%; `overflow-wrap:anywhere` memperbaiki judul panjang. Enam E2E final menguji 360/768/1440, root font 200%, validasi form kosong, dialog via keyboard/klik/tutup/focus restore, login/logout, inactive/session revocation, CSRF dan 429. Screenshot full-page diperiksa ulang tanpa password. Bukti dan Delivery Gate: docs/PHASE_01_VERIFICATION.md.
- Hasil: READY_FOR_REVIEW, belum ACCEPTED. Tidak mengubah kontrak bisnis. Phase 02 belum dimulai; prasyaratnya review/instruksi lanjut pengguna, memakai fondasi auth/Decimal/DB yang sudah diuji. PostgreSQL yang masih didukung perlu dipakai untuk lingkungan baru; Compose tetap NOT_RUN.
- `npm run start` hasil build berjalan pada http://127.0.0.1:3000, binding loopback, waktu startup yang dilaporkan 493 ms. Navigasi production header/skip link/register dijalankan; screenshot production-login-desktop.png dan production-login-mobile.png tanpa overlay development tersedia di test-results. Skrip smoke pertama memakai URL relatif tanpa baseURL untuk API dan gagal pada skrip, setelah navigasi/screenshot berhasil; pemeriksaan API diulang dengan URL absolut tanpa perubahan source aplikasi.
- Smoke production final exit 0: /api/health 200, /api/me tanpa sesi 401, /api/auth/providers 200; Chrome page errors 0 dan overflow false pada mobile. Server produksi lokal dan cluster proyek dibiarkan berjalan untuk review.

### Perbaikan registrasi 403, 10 November 2026

- Laporan pengguna: registrasi mendapat 403. Diagnosis tanpa write keuangan/akun: POST JSON invalid dengan token/cookie valid menghasilkan 403 pada origin localhost:3000 dan 400 pada 127.0.0.1:3000; server lama masih memakai origin 127.0.0.1 sementara `.env` pengguna sudah memakai localhost.
- Perubahan: redirect hanya untuk dua alias loopback ke APP_ORIGIN yang dikonfigurasi, dengan destination tetap dari environment, bukan host kiriman client. Pemeriksaan origin/CSRF tidak dilonggarkan. Penerbit dan pemeriksa CSRF memakai helper identitas sesi yang sama; registrasi saat sudah login tidak lagi salah memeriksa token sebagai anonymous.
- `.env` pengguna dipertahankan, termasuk database localhost:5432. Read-only check memastikan database development dapat dijangkau dan tabel public.users tersedia. Tidak menjalankan migration development yang sebelumnya dibatalkan pengguna.
- Tes menggunakan kembali cluster test terisolasi port 55439 melalui environment proses, tanpa mengubah `.env`. Runner dengan TEST_DATABASE_URL pengguna pada localhost:5432 sempat gagal pada schema engine; bukan PASS dan tidak dilanjutkan ke reset/schema recreate.
- Verifikasi regresi: 28 unit test dan lint PASS; 6/6 E2E Chrome PASS (1,9 menit), termasuk redirect dari localhost:3100 ke 127.0.0.1:3100, daftar/login, registrasi saat session aktif, serta penolakan origin asing dan token salah. Build Webpack dengan `.env` pengguna sekarang PASS (exit 0). Integrasi domain PostgreSQL tidak diulang karena tidak ada perubahan service akun, limiter, uang, atau schema.
- Tidak ada migration/schema atau perubahan visual; Phase 02 tetap belum dimulai.
- Server production dimulai ulang dari build terbaru dengan `.env` pengguna. Navigasi nyata 127.0.0.1:3000/register diarahkan ke localhost:3000/register. Smoke POST dengan CSRF valid melewati guard (JSON string invalid schema memberi 422 tanpa membuat akun); pengujian byte JSON malformed diulang agar berhenti sebelum service registrasi. Redirect dan konfigurasi runtime sekarang sama; akun pengguna tidak dibuat/diubah oleh smoke test.
- Smoke byte JSON malformed final exit 0: origin localhost dengan token benar menghasilkan 400 MALFORMED_REQUEST (lolos CSRF); origin evil.invalid tetap 403. Tidak ada migration development, reset, atau perubahan akun.
