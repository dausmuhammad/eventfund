# Verifikasi pemilih responsif dan field wajib

Tanggal10 November2026. Instruksi pengguna menggantikan kalender inline dengan Popover desktop dan Drawer mobile; dropdown mobile juga Drawer, field mandatory bertanda * merah, dan Popover dipadatkan. Mode antislop during dari sesi tetap berlaku. Arah visual/dials tidak berubah: ENERGY2/RHYTHM2/MOTION1.

## Perilaku akhir

- Desktop>=768px: seluruh field tanggal merupakan pemicu Radix Popover. Panel288px, sel hari36px, footer32px; berjangkar ke sisi field, flip/shift mengikuti ruang viewport, tanpa mengubah tinggi/posisi form. Desktop Select tetap Radix Select.
- Mobile<768px: tanggal dan Select status/tindakan memakai Drawer Radix Dialog yang masuk dari bawah, overlay dan focus trap. Body dapat discroll, footer Selesai terpisah dengan safe-area, Escape/tutup mengembalikan fokus. Kalender mempertahankan sel44px; opsi dropdown minimal52px. Drawer memiliki batas92dvh dan animasi180/140ms dengan reduced-motion.
- Drawer dropdown memakai listbox, opsi terpilih bertanda check, ArrowUp/Down/Home/End dan Enter/Space. Pemilihan langsung memperbarui controlled value dan menutup panel. Field bernama tetap memiliki input hidden untuk FormData.
- Tanggal tampil Indonesia, dikirim YYYY-MM-DD. Mode manual/kalender, Hari ini/Kosongkan, validasi, dirty guard dan retry tetap bekerja. Semua panel di-portal di luar form.
- Field wajib memiliki * merah di samping label; optional tetap berlabel. Marker dekoratif tidak mengubah nama aksesibel label. Password/email/nama dan reason mandatory tetap memakai validasi/required yang tersedia.

## Bukti yang dijalankan

| Pemeriksaan | Hasil |
|---|---|
| Lint | PASS ESLint exit0 pada source final |
| Unit | PASS30/30 |
| Build produksi test | PASS Webpack, semua route terbangun |
| E2E produksi | PASS8/8 (28,5 detik), desktop1440/mobile360 |
| E2E event dengan screenshot final | PASS2/2 (24,2 detik), sesudah penambahan capture animations=disabled |
| Reflow | PASS360/768/1024/1440 dan root font200% saat pemilih terbuka |
| Geometri | PASS posisi absolut field Lokasi tidak berubah; panel.closest(form)=null; Popover<=300px dan x sesuai trigger; Drawer bottom sama dengan viewport.height |
| Keyboard | PASS Escape/return focus kalender, ArrowDown opsi mobile, dirty-dialog/fokus dan Sheet navigasi |
| Mandatory marker | PASS label Nama event memiliki marker * merah; nama label tetap dapat dicari secara exact |
| Diff | PASS git diff --check tanpa error whitespace |

Regresi8 E2E mencakup registrasi/login/logout, revocation/CSRF/rate limit, create/edit/duplicate, lifecycle/arsip, ownership404, stale409, pencarian/filter serta network abort dan retry tanpa kehilangan isian. PostgreSQL17.11 test terisolasi, tidak ada reset/migration baru atau perubahan database development/.env.

Screenshot kalender desktop/mobile dan form desktop diperiksa; screenshot awal mobile menangkap animasi setelah pergantian viewport. Capture diperbaiki dengan animations=disabled dan assertion jenis surface sebelum screenshot. Screenshot final mobile menunjukkan kalender, footer Selesai dan safe area lengkap. Screenshot dropdown menunjukkan daftar opsi dari bawah dan indikator pilihan. Artifacts: test-results/calendar-desktop.png, calendar-mobile.png, select-drawer-mobile.png dan event-form-desktop.png.

## Delivery Gate antislop

| Item | Hasil dan bukti |
|---|---|
| R-01 | PASS palette navy/slate/biru existing, tanpa gradient baru |
| R-02 | PASS copy kontrol tidak memakai em dash |
| R-03 | PASS empat viewport dan font200%; collision-aware Popover dan Drawer scrollable |
| R-04 | PASS kalender/chevron/check/tutup sesuai fungsi |
| R-05 | PASS struktur tugas akun/event tidak berubah menjadi template dashboard |
| R-06 | PASS font system existing dipertahankan |
| R-07 | PASS tanpa pattern dekoratif |
| R-08 | PASS chevron untuk membuka pemilih/navigasi bulan |
| R-09 | PASS tidak menambah badge promosi |
| R-10 | PASS tanpa glassmorphism |
| R-11 | PASS input8px, Popover12px, Drawer sudut atas24px; bukan semua pill |
| R-12 | PASS shadow menandai portal Popover/Drawer |
| R-13 | PASS tanpa glow |
| R-14 | PASS tidak menambah grid feature card |
| R-15 | PASS CTA Ketik tanggal/Kosongkan/Hari ini/Selesai menyebut tindakan |
| R-16 | PASS tanpa buzzword pemasaran |
| R-17 | PASS tidak menambah metrik/data contoh dalam produk |
| R-18 | PASS tanpa testimonial/avatar fiktif |
| R-19 | PASS Drawer180/140ms dan reduced-motion CSS existing |
| R-20 | PASS motif kalender dan konteks event konsisten |
| R-21 | PASS light content dan sidebar navy sesuai keputusan pengguna |
| R-22 | PASS tanpa ilustrasi baru |
| R-23 | PASS tidak membuat aset baru |
| R-24 | PASS route/navigasi existing tetap teruji E2E |
| R-25 | PASS token kontras audit sebelumnya dipertahankan; star memakai danger#B91C1C/putih dari palette existing |
| R-26 | PASS semua kontrol kalender dan Select desktop/mobile pada alur diuji |
| R-27 | PASS pending/error/empty existing; validasi dan network retry regression lulus |
| R-28 | PASS tanpa FAQ |
| R-29 | PASS tidak menambah core color baru |
| R-30 | PASS komposisi mengikuti kebutuhan pemilih responsif, tanpa menyalin produk tertentu |
| R-31 | PASS alasan ukuran/anchor/drawer/mobile touch dinyatakan sebelum perubahan dan di UI_TEMPLATE |
| R-32 | PASS fokus opsi terpilih, navigasi panah dan Escape/restore focus diuji |
| R-33 | PASS source JS/JSX/CSS melalui patch; formatter hanya format |
| R-34 | PASS tidak menambah tema/toggle |
| R-35 | PASS build,8 E2E produksi dan2 E2E screenshot final lulus; gambar diperiksa |
| R-36 | PASS tidak membuat klaim keamanan/performa baru |
| R-37 | PASS arahan desktop Popover/mobile Drawer dan pemadatan berasal dari instruksi eksplisit |
| R-38 | PASS fixture hanya DB test; tidak menampilkan uang/histori buatan |
| R-39 | PASS Radix focus trap/return focus, listbox keyboard, label tetap stabil, mobile44–52px; sel desktop36px mengikuti permintaan compact |
| R-40 | PASS tanpa media/third-party script baru |
| Liveliness | PASS dials ENERGY2/RHYTHM2/MOTION1 tetap; fokus ke field/opsi, biru untuk selection, kalender/F sebagai identitas |
| Craftsmanship | PASS pemilih menyesuaikan perangkat, value/API tidak berubah, input tetap saat error, tidak menambah fitur di luar fase |

## Batas dan operasional

@radix-ui/react-popover1.1.15 dipasang kembali, lockfile dipin. npm install melaporkan12 vulnerabilities (9 moderate/3 high), bukan audit bersih. Node host26.13.0 berbeda dari target24; tidak mengubah engines. Tidak menguji ponsel fisik, keyboard virtual nyata, atau screen reader nyata. Suite integration terpisah tidak diulang karena service/schema/domain tidak berubah; E2E tetap melalui API dan PostgreSQL nyata. Phase02 tetap READY_FOR_REVIEW; Phase03 belum dimulai.

## Pemadatan kartu setelah screenshot pengguna

Panel ringkasan kini memiliki dua tombol mobile satu baris dengan label ringkas, tanpa kalimat pengantar berulang. Padding16px dan gap12px; jadwal/lokasi dua kolom dengan tanggal singkat. Kartu catatan/persiapan memakai padding16px, tanpa helper berulang dan jarak checklist12px. Nama aksesibel tautan tetap lengkap, target tombol44px dan nilai event tetap terlihat.

Verifikasi setelah pemadatan: lint PASS, build produksi PASS,8 E2E desktop/mobile PASS (27,1 detik), diff check PASS. Screenshot events-mobile.png dan events-desktop.png diperiksa visual: tombol sejajar pada360px, ringkasan dan kartu pendukung lebih pendek, tanpa teks/aksi terpotong. Screenshot full-page dapat menempatkan navigasi fixed di tengah gambar panjang; tidak menunjukkan posisi footer setelah scroll halaman sebenarnya. Tidak menambah tes yang hanya menyalin nilai padding; suite existing memeriksa alur nyata dan reflow.

Delivery Gate tambahan: R-03 PASS screenshot/reflow dan tidak ada page overflow; R-25 PASS palette sama; R-26/R-32 PASS tautan Duplikasi/Pengaturan tetap menjalankan route yang sama dan memiliki nama aksesibel lengkap; R-35 PASS build dan8 E2E; R-39 PASS target tombol44px; purpose/craftsmanship PASS jarak diperkecil sesuai screenshot pengguna tanpa menyembunyikan data event.
