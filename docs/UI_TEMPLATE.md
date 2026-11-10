# Template UI EventFund

Penyempurnaan Phase 02 atas instruksi pengguna pada 10 November 2026. Cakupan: tampilan dan validasi fitur akun/event yang sudah tersedia. Tidak menambah modul keuangan fase berikutnya.

## Arah visual

Ruang kerja bendahara yang terang, rapi, dan lebih mudah dipindai. ENERGY 2 / RHYTHM 2 / MOTION 1. Token warna fondasi dipertahankan: biru untuk tindakan, slate untuk konteks, putih untuk unit kerja. Font lokal tidak mengunduh aset baru. Motif kalender, metadata kegiatan, dan status event menghubungkan identitas produk dengan pekerjaan pengguna.

- Sidebar desktop 240 px mempertahankan orientasi ruang kerja. Mobile memakai Radix Sheet dan navigasi bawah tiga tujuan yang sudah berfungsi; safe area dan ruang bawah diperhitungkan.
- Header, page heading, card, badge, dan field dipakai ulang. Jumlah event berasal dari data pemilik, bukan contoh. Tidak ada KPI kas/RAB fiktif.
- List memakai pencarian nama dan Select status; filter aktif/arsip terpisah. Empty state membedakan belum ada data dengan pencarian yang tidak cocok.
- Ringkasan event mengutamakan nama/status, detail waktu/tempat, dan kelengkapan persiapan. Aksi pengaturan/duplikasi berada dekat konteksnya. Dialog switcher menyediakan pencarian dan fokus keyboard.
- Form memakai kelompok informasi kegiatan serta waktu/tempat. Konteks status/mata uang/zona waktu tersedia di samping desktop dan menumpuk di mobile.
- Login/registrasi memiliki pengantar produk di desktop; mobile merangkum pengantar agar form lebih cepat dijangkau. Semua klaim mengacu fitur yang tersedia.
- Ikon Radix dipilih berdasarkan fungsi: kalender untuk kegiatan, arsip untuk penyimpanan, plus untuk pembuatan, pengaturan/duplikasi untuk tindakan, mata untuk visibilitas sandi. Tidak ada ilustrasi, foto profil buatan, gradient atau glow. Shadow hanya pada overlay.

## Komponen JavaScript

Konfigurasi shadcn `new-york`, `tsx:false` dipertahankan. Komponen dimiliki source aplikasi pada src/components/ui, mengikuti pola komposisi shadcn/Radix dan memakai Tailwind. Tidak memakai komponen library lain atau output TypeScript.

| Kebutuhan | Komponen |
|---|---|
| Teks/angka/tanggal | Input shadcn, input native yang dibungkus komponen |
| Deskripsi/alasan | Textarea shadcn |
| Label dan pesan field | Field, Radix Label, aria-invalid/describedby |
| Pilihan status/tindakan | Radix Select melalui Select/Trigger/Content/Item |
| Pengakuan pembatalan | Radix Checkbox |
| Konfirmasi lifecycle/discard | Radix AlertDialog melalui ConfirmationDialog |
| Navigasi mobile | Radix Dialog melalui Sheet |
| Pergantian event | Radix Dialog dengan input pencarian |
| Surface/status/loading | Card, Badge, Alert, Skeleton |
| Error summary | FormFeedback dengan fokus dan tautan ke field |

Versi tambahan: @radix-ui/react-alert-dialog 1.2.1, react-checkbox 1.4.1, react-select 2.4.1, react-dropdown-menu 2.2.1, react-icons 1.3.2. Versi lain tetap. Lockfile dipin. Install melaporkan 12 temuan dependency (9 moderate, 3 high), sama jumlahnya dengan catatan fondasi; bukan klaim audit keamanan bersih.

## Kontrak validasi

Zod dipakai bersama di client dan server. Submit custom menampilkan summary dan error field berbahasa Indonesia, bukan hanya tooltip browser. Field yang telah dikunjungi divalidasi pada blur. Server tetap sumber kebenaran untuk ownership, lifecycle, optimistic version dan session.

- Event: nama wajib 1–200 setelah trim, deskripsi maksimal 4.000, lokasi maksimal 250, tanggal kalender valid, tanggal selesai tidak mendahului mulai. Field opsional ditandai.
- Akun: nama 1–120, email dinormalisasi/format valid/maksimal 254, kata sandi 12–128 tanpa memangkas spasi. Registrasi meminta konfirmasi sandi yang sama; field konfirmasi tidak dikirim ke endpoint akun. Tombol mata memiliki nama aksesibel dan aria-pressed.
- Lifecycle: alasan 5–1.000 untuk pembatalan/reopen, pengakuan wajib untuk pembatalan. Server memeriksa syarat yang sama. Dialog menyebut event dan akibat tindakan sebelum write.
- Input tetap tersedia ketika validasi, koneksi, atau server gagal; error server membawa field dan request ID. Konflik versi tidak menimpa data otomatis. Key lifecycle dipertahankan untuk retry intent yang sama.
- Form metadata memberi konfirmasi saat tautan akan meninggalkan perubahan serta peringatan native saat reload/menutup halaman. Tombol submit disabled sebelum hydration/saat pending. Dialog memerangkap fokus, Escape dan pengembalian fokus ditangani.
- Batas JSON khusus API event 32 KiB agar seluruh kombinasi field valid dapat terkirim, termasuk deskripsi 4.000 karakter. Batas default 4 KiB registrasi tidak diubah; panjang field tetap dibatasi schema.

Tidak ada migration atau perubahan perhitungan uang dalam penyempurnaan ini. Baseline/clone RAB dan close penuh tetap mengikuti batas fase.
