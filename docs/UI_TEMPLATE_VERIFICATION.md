# Verifikasi template UI dan validasi

Tanggal 10 November 2026. Lingkup fitur akun dan event sampai Phase 02. Arah desain: [UI_TEMPLATE.md](UI_TEMPLATE.md), ENERGY 2 / RHYTHM 2 / MOTION 1. Mode antislop during dipilih pengguna dalam sesi.

## Bukti

| Pemeriksaan | Hasil |
|---|---|
| Unit | PASS 30/30, mencakup regresi schema akun/event, lifecycle dan fondasi |
| Integration PostgreSQL | PASS 9/9, ownership, rollback, session revocation, stale update, idempotency dan row lock |
| Lint | PASS ESLint tanpa error/warning |
| Build | PASS Next.js Webpack, seluruh route akun/event berhasil dibuat |
| E2E produksi | PASS 8/8 final pada 1440 dan 360 setelah perapian feedback; durasi lokal 2,9 menit, bukan klaim performa produk |
| Kontras | PASS pasangan warna teks baru terendah 5.915:1; rincian di bawah |
| Smoke dev final | PASS /login200 dengan copy template baru, /api/health200, /api/events401 tanpa sesi; server dev kembali di port3000 dengan .env pengguna |

Alur yang diverifikasi: pengguna mengisi form akun/event → validasi Zod → Route Handler dengan guard/CSRF → service PostgreSQL → respons JSON → detail/error pada UI.

| Batas alur | Status | Bukti |
|---|---|---|
| UI render | PASS | Screenshot final desktop/mobile dan dev /login200 memuat copy baru |
| Client → API | PASS | E2E create/edit/cancel/archive, request valid dan invalid |
| API → Data | PASS | Integration PostgreSQL dan assertion event owner/status pada E2E |
| Data → Response | PASS | Deskripsi4000 diterima,4001 ditolak422, stale409 dan non-owner404 |
| Response → UI | PASS | Heading/detail terbaru, pesan field, read-only setelah cancel dan arsip diperiksa E2E |

E2E memeriksa registrasi dengan konfirmasi sandi berbeda ditolak sebelum akun dibuat, toggle sandi, login salah/benar, sesi, CSRF, logout dan limiter; event kosong ditolak dengan aria-invalid, tanggal terbalik ditolak lalu diperbaiki, create/edit/duplicate/switcher, guard perubahan yang belum disimpan, cancel dialog yang dibatalkan tidak mengubah DB, cancel/archive/unarchive sukses, Select/Checkbox Radix, search/filter/clear, Sheet mobile dengan Escape dan focus restore, serta root font 200%. Deskripsi 4.000 karakter diterima melalui API dan 4.001 ditolak422. Dataset test dikembalikan ke metadata yang mudah dibaca setelah uji batas.

Screenshot tanpa password: test-results/login-{desktop,mobile}.png, shell-{desktop,mobile}.png, event-form-{desktop,mobile}.png, events-{desktop,mobile}.png, event-list-{desktop,mobile}.png. Nama kegiatan dan akun dalam screenshot adalah fixture test, bukan data pengguna. Screenshot desktop dan mobile diperiksa visual setelah run final. Full-page capture dapat meletakkan elemen fixed/sticky pada posisi viewport saat pengambilan; semua field tetap dapat dijangkau dengan scroll dan aksi form diuji pada viewport nyata.

## Delivery Gate antislop

| Item | Hasil dan bukti |
|---|---|
| R-02 copy | PASS pemindaian source baru tanpa em dash; copy Indonesia menyebut tugas dan field |
| R-03 layout | PASS E2E scrollWidth <= innerWidth pada 360/1440; root font200% juga diuji |
| R-17 angka | PASS jumlah event dibaca dari query owner; tidak ada uang contoh, statistik pemasaran atau KPI palsu |
| R-18 testimonial | PASS tidak ada testimonial atau orang fiktif di produk |
| R-23 aset | PASS tanpa aset gambar/logo baru; ikon Radix memetakan aksi nyata dan inisial akun diturunkan dari nama user |
| R-24 navigasi | PASS semua tautan menuju route yang tersedia; modul mendatang dijelaskan sebagai teks |
| R-25 kontras | PASS formula WCAG: biru/blue50 6.158:1, slate600/blue50 6.963:1, blue900/blue50 9.518:1, danger/red50 5.915:1, green800/green50 6.812:1, slate700/slate100 9.452:1 |
| R-26 interaksi | PASS E2E alur akun/event, search/filter/reset, dialog/checkbox/select/switcher dan navigasi mobile |
| R-27 states | PASS empty/no-match, Skeleton, pending/disabled dan error inline dengan input dipertahankan |
| R-28 FAQ | PASS tidak menambahkan FAQ |
| R-32 keyboard | PASS Tab antarfield, Enter switcher, Escape Sheet, focus restore, label dan error yang terhubung |
| R-33 source | PASS fitur ditulis pada JSX/JS/CSS source melalui patch; formatter hanya merapikan source |
| R-34 tema | PASS mengikuti light-only v1; tidak menambahkan toggle yang tak berfungsi |
| R-35 runtime | PASS build dan alur browser produksi dijalankan; kegagalan awal dicatat, bukan disamarkan |
| R-36 klaim | PASS klaim akses pemilik diuji API lintas-user404; tidak menambah klaim keamanan/performa tanpa sumber |
| R-37 arah | PASS arah dan dials dinyatakan sebelum edit, mengikuti DESIGN_SYSTEM dan token fondasi |
| R-38 konten | PASS detail event berasal dari DB; informasi fitur mendatang disebut belum tersedia |
| R-39 affordance | PASS native button/link dan primitive Radix; aria label/pressed untuk toggle sandi; invalid/describedby; target kontrol44px, label checkbox dapat diklik; reduced-motion diwarisi CSS |
| R-40 media/performa | PASS tidak menambah media atau third-party script; tidak mengklaim skor performa |
| Purpose Gate | PASS aksen biru membedakan aksi/konteks, border mengelompokkan tugas, ikon relevan dengan kontrol; tanpa gradient/glow atau shadow massal |
| Liveliness | PASS fokus nama event/heading, whitespace membatasi tugas, aksen dan motif kalender/status berulang; dials konsisten |
| Craftsmanship | PASS reusable primitives, DOM keyboard order, form state/error/loading nyata; tidak membuat UI palsu untuk modul fase berikutnya |

## Keterbatasan dan run yang gagal

Run browser pertama: lima tes lulus, tiga gagal karena interaksi blur. Summary validasi yang terfokus saat reason blur membuat klik checkbox kehilangan target; blur di perpindahan ke tombol juga mengganggu submit login mobile. Perbaikan: validasi blur hanya memperbarui field, summary fokus pada submit/error, serta tidak melakukan blur validation ketika fokus pindah ke tombol/tautan. Run berikutnya delapan tes lulus. Feedback yang sudah valid kemudian dirapikan agar summary tidak tertinggal.

Tidak menguji ponsel fisik, screen reader nyata, Compose/PostgreSQL17, atau audit dependency lengkap ulang. Tidak ada migration untuk perubahan UI ini. Temuan dependency baseline masih terbuka. Belum ada repository Git sehingga pemeriksaan secret-in-index tidak dapat dilakukan; source/ignore diperiksa, .env dan .local dipertahankan.
