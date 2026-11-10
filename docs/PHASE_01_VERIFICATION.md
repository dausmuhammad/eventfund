# Verifikasi Phase 01

Tanggal: 10 November 2026. Lingkup: fondasi akun lokal, bukan modul finansial atau kesiapan deployment publik. Mode antislop `during`, dipilih pengguna. Arah dan alasan visual: [FOUNDATION_DESIGN.md](FOUNDATION_DESIGN.md).

## Bukti pemeriksaan

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| Unit | PASS, 28 test | Money/quantity parser, rounding independen, overflow, serializer, normalisasi email/password, strict schema, batas JSON, guard DB test, redirect alias lokal |
| Integration PostgreSQL | PASS, 4 test | Registrasi/hash/duplicate/inactive, raw SQL commit+rollback, 12 UPSERT paralel tepat 5 diterima dan 7 ditolak, seed idempotent |
| E2E Chrome | PASS, 6 test | Tiga skenario pada desktop 1440 dan mobile 360; reflow tambahan 360/768/1440 dan root font 200% |
| Lint | PASS | ESLint tanpa error/warning |
| Migration fresh | PASS | 202611100001_foundation pada dev baru dan test kosong |
| Prisma generate | PASS | Client 6.19.3; raw SQL dan interactive transaction diuji nyata |
| Build | PASS | Next.js 16.4.6, Webpack; seluruh route berhasil dibuat |
| Smoke hasil build | PASS | localhost:3000, health 200, me tanpa sesi 401, providers 200; browser error 0 dan overflow false |
| Pemeriksaan source | PASS | Tidak ada sumber .ts/.tsx/tsconfig, Number/parseFloat untuk uang, atau logging kredensial |

Pengujian pembesaran memakai root font 200% di Chrome headless, bukan klaim pengujian perangkat ponsel fisik. Console page error pada alur akun kosong. Tidak ada hasil Lighthouse/Web Vitals yang diklaim.

## Click-through yang dijalankan

- Buat akun dari login membuka /register; submit data valid menampilkan respons generik.
- Tautan Masuk kembali ke form login; fokus keyboard Email lalu Tab berpindah ke Kata sandi.
- Submit kosong memicu validasi required email tanpa membuat akun.
- Login salah menampilkan pesan generik; login benar membuka /events dan /api/me mengembalikan 200.
- Tentang fondasi ini terbuka dengan Enter dan klik; Escape menutup serta mengembalikan fokus; tombol Tutup penjelasan juga menutup.
- Keluar kembali ke /login; /api/me kembali 401. User nonaktif dan session_version berubah juga menghasilkan 401.
- Origin asing dan token CSRF salah menghasilkan 403; batas login menghasilkan 429 dengan Retry-After.
- Regresi laporan 403: alias localhost otomatis menuju APP_ORIGIN sebelum form digunakan; daftar tetap berhasil saat pengguna sudah memiliki sesi login. Enam E2E dan build dijalankan ulang setelah perbaikan.
- Header EventFund diklik pada hasil production build dan tetap menuju /login; skip link difokuskan dan diaktifkan dengan Enter, menghasilkan /login#main. Tautan Buat akun pada production build juga membuka /register.

Screenshot final: test-results/login-desktop.png, login-mobile.png, shell-desktop.png, shell-mobile.png. Login diambil setelah form siap dan tanpa isian password; shell memakai fixture bernama Bendahara tes. Gambar diperiksa secara visual. Tidak ada clipping atau horizontal page scroll pada viewport yang diuji.

## Delivery Gate antislop

Status di bawah berlaku pada source dan antarmuka Phase 01. Fitur yang tidak ada tidak diklaim telah diuji sebagai fitur. Keterbatasan infrastruktur dan dependency dicatat di implementation log.

### Hard Gate

- R-02 PASS: copy UI yang ditulis tidak memakai em dash; label dan instruksi spesifik akun.
- R-03 PASS: pengukuran scrollWidth <= innerWidth di 360/768/1440, termasuk root font 200%; kontrol minimal 44 px.
- R-17 PASS: tidak ada statistik/nominal fiktif; angka yang tampil adalah batas password dan label fase sesuai spesifikasi.
- R-18 PASS: tidak ada testimonial, profil pelanggan, atau klaim social proof.
- R-23 PASS: nama produk berupa teks, tanpa pembuatan aset logo/avatar; navigasi mengikuti sitemap dan batas fase.
- R-24 PASS: link internal menuju /login, /register, /events, dan #main yang tersedia; header/skip link serta navigasi form diklik pada runtime.
- R-25 PASS: pasangan teks/border/focus dihitung dengan formula WCAG; hasil rinci di FOUNDATION_DESIGN.md.
- R-26 PASS: submit akun, tautan auth, logout, dialog trigger/close/Escape berjalan; tidak ada kontrol modul yang belum dibuat.
- R-27 PASS: loading.jsx, error.jsx dengan retry, shell kosong berlabel fase, dan pesan kegagalan form tersedia; validasi form exercised di browser.
- R-28 PASS: tidak ada FAQ.
- R-32 PASS: Tab Email ke Kata sandi, Enter membuka dialog, Escape/focus restore berjalan; focus ring tampak pada screenshot shell.
- R-33 PASS: fitur ditulis langsung melalui patch source; formatter hanya merapikan format.
- R-34 PASS: hanya light theme sesuai scope, tanpa toggle yang menjanjikan tema lain.
- R-35 PASS: aplikasi dijalankan, build berhasil, enam E2E lulus dan click-through dicatat di atas.
- R-36 PASS: hasil tes dan keterbatasan ditulis apa adanya; audit dependency tidak disebut bebas kerentanan.
- R-37 PASS: arah berasal dari DESIGN_SYSTEM.md, dials dan alasan dicatat sebelum penyerahan.
- R-38 PASS: shell menyebut bahwa modul event/keuangan belum tersedia; fixture ditandai sebagai pengguna tes dalam bukti.
- R-39 PASS: kontrol native/Radix, label visible, pointer/disabled cursor, focus, lang=id, judul route, main/header/footer, reduced-motion pada CSS; tidak ada gambar tanpa alt karena tidak ada gambar UI.
- R-40 PASS: tidak ada media atau third-party script yang membutuhkan reservasi ruang/prioritas hero; tidak mengklaim angka performa.

### Purpose-Gate

- R-01 PASS: warna mengikuti token produk dan membedakan aksi; tidak ada gradient/glow.
- R-04 PASS: tidak ada icon dekoratif atau default icon library yang dipasang untuk mengisi ruang.
- R-06 PASS: fallback font lokal dipilih untuk keterbacaan dan build tanpa download font, dijelaskan pada arah desain.
- R-07 PASS: tidak ada grid/pattern background dekoratif.
- R-08 PASS: tombol tidak memakai panah dekoratif.
- R-09 PASS: tidak ada capsule/eyebrow status palsu.
- R-10 PASS: tidak ada glassmorphism.
- R-12 PASS: shadow hanya pada overlay dialog untuk elevasi.
- R-13 PASS: tidak ada glow.
- R-14 PASS: card membungkus tugas form dan konteks shell kosong, bukan feature grid pemasaran.
- R-19 PASS: transisi hanya umpan balik kontrol; reduced-motion menghentikannya.
- R-22 PASS: tidak ada ilustrasi stok atau aset fiktif.

### Liveliness

- Dials PASS: ENERGY 1 / RHYTHM 1 / MOTION 1 tertulis dan sesuai antarmuka tenang.
- Konsistensi PASS: struktur form/panel berulang untuk tugas akun; tidak menjanjikan komposisi eksperimental.
- Focal point PASS: h1 memberi konteks; CTA form dibedakan dengan satu aksen biru untuk tindakan layar.
- Whitespace PASS: jarak mengelompokkan pengantar, form, dan footer; mobile reflow tidak bergantung tinggi viewport tetap.
- Accent PASS: biru dipakai pada aksi/tautan yang relevan, tanpa glow atau ornamentasi tambahan.
- Identity PASS: nama EventFund dengan titik biru, angka tabular, dan bahasa pencatatan keuangan diulang secara konsisten.
- Design Read PASS: dicatat pada commentary awal implementasi dan FOUNDATION_DESIGN.md.

### Craftsmanship dan Quality Locks

- C-1 PASS: warna, font, spacing, card, shadow dan responsive memiliki alasan tertulis.
- C-2 PASS: kontrol akun/dialog berfungsi dalam click-through.
- C-3 PASS: tidak ada testimonial, pricing, feature grid, atau section template untuk mengisi halaman.
- C-4 PASS: form error/empty/loading tersedia; keyboard, tiga lebar dan pembesaran teks diuji. Hardware keyboard ponsel tetap NOT_RUN.
- C-5 PASS: bukti berasal dari runtime, database, dan screenshot; tidak ada klaim pelanggan/keamanan yang dibuat-buat.
- R-05 PASS: auth memakai pengantar dan form; workspace memakai konteks dan empty state yang dibutuhkan fase.
- R-11 PASS: radius input 8 px dan card 12 px sesuai token, bukan semua pill.
- R-15 PASS: CTA Buat akun, Masuk, Keluar, dan Tutup penjelasan menyebut tindakan.
- R-16 PASS: copy tidak memakai buzzword pemasaran AI.
- R-20 PASS: identitas sederhana EventFund dan konteks bendahara mengikuti arah proyek.
- R-21 PASS: light-only mengikuti keputusan v1 untuk konsistensi pengujian.
- R-29 PASS: palette netral dengan biru utama; merah/hijau hanya umpan balik error/sukses.
- R-30 PASS: tidak menyalin produk populer atau komposisi landing template.
- R-31 PASS: alasan keputusan mayor tersedia dalam FOUNDATION_DESIGN.md.

## Batas bukti

Docker/PostgreSQL 17.11 belum dijalankan. Semua tes transaksi memakai PostgreSQL 13.23 nyata yang tersedia lokal dan sudah diisolasi dari data pengguna. Chromium download gagal, sehingga E2E memakai Chrome host. Audit dependency tetap memiliki 12 temuan transitif yang dijelaskan pada implementation log. Tidak ada Git repository sehingga pemeriksaan secret dalam Git index tidak tersedia. Tidak ada klaim deployment, WCAG conformance penuh, performance target fase lanjutan, atau penerimaan pengguna.
