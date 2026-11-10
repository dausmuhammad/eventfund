# Template UI EventFund

Penyempurnaan Phase 02 atas instruksi pengguna pada 10 November 2026. Cakupan: tampilan dan validasi fitur akun/event yang sudah tersedia. Tidak menambah modul keuangan fase berikutnya.

## Arah visual

Ruang kerja bendahara dengan navigasi navy dan konten terang. ENERGY 2 / RHYTHM 2 / MOTION 1. Pembaruan audit penuh atas instruksi pengguna menggantikan tampilan sidebar/kalender sebelumnya. Biru untuk tindakan, slate untuk konteks, putih untuk unit kerja. Font system Segoe UI/-apple-system/BlinkMacSystemFont/Arial tidak mengunduh aset. Motif kalender, metadata kegiatan, dan status event menghubungkan identitas produk dengan pekerjaan pengguna.

- Sidebar desktop 232 px berwarna navy #12213D, navigasi aktif #254681, canvas #F3F5FA dan primary #2854D8. Foreground #18243B, muted #526078, border permukaan #DCE3EE, border kontrol #7D8BA2. Header minimum64 px dapat membungkus pada pembesaran teks; padding kartu20 px dan jarak form16 px. Kontrol44–48 px; font input mobile16 px. Mobile memakai Radix Sheet dan navigasi bawah tiga tujuan dengan indikator halaman aktif dan safe area.
- Logo SVG kalender dengan huruf F menghubungkan jadwal dan pencatatan EventFund; dipakai pada sidebar, header mobile dan halaman akun. src/app/icon.svg memakai tanda yang sama sebagai favicon melalui konvensi metadata Next.js. Aset dibuat atas permintaan eksplisit pengguna.
- Header, page heading, card, badge, dan field dipakai ulang. Jumlah event berasal dari data pemilik, bukan contoh. Tidak ada KPI kas/RAB fiktif.
- List memakai tab navigasi aktif/arsip, pencarian nama dan Select status. Baris dalam satu surface menempatkan penanda tanggal, nama, catatan, metadata dan status secara konsisten; mobile menumpuk tanpa kehilangan konteks. Banner pemasaran besar dihapus agar data segera terlihat. Empty state membedakan belum ada data dengan pencarian yang tidak cocok.
- Ringkasan event memakai satu panel identitas #19345F berisi nama/status, pengaturan/duplikasi, jadwal dan tempat. Kartu catatan dan kelengkapan mengikuti di bawah. Progress0–4 berasal dari field event yang benar-benar terisi, bukan metrik finansial rekaan. Dialog switcher menyediakan pencarian dan fokus keyboard.
- Pemadatan sesuai screenshot pengguna: panel ringkasan padding16px mobile/20px desktop, gap12px, tanpa kalimat pengantar berulang. Tombol terlihat sebagai Duplikasi/Pengaturan dalam dua kolom mobile; nama aksesibel tetap lengkap. Jadwal/lokasi dua kolom dengan padding vertikal12px dan tanggal bulan singkat. Kartu catatan/persiapan padding16px, helper berulang dihapus, jarak checklist12px dan antarkartu16px. Tombol tetap44px; action grid membungkus ketika ruang menyempit/pembesaran teks.
- Form menyatukan informasi kegiatan serta waktu/tempat dalam satu kartu. Konteks status/mata uang/zona waktu tersedia di samping desktop dan menumpuk di mobile. Teks bantuan dipersingkat; error tetap field-level dan summary. Tindakan lifecycle terpisah di bawah.
- Login/registrasi memakai panel navy dan satu kartu form; mobile hanya menampilkan identitas singkat agar form cepat dijangkau. Semua klaim mengacu fitur yang tersedia.
- Ikon Radix dipilih berdasarkan fungsi: kalender untuk kegiatan, arsip untuk penyimpanan, plus untuk pembuatan, pengaturan/duplikasi untuk tindakan, mata untuk visibilitas sandi. Tidak ada ilustrasi, foto profil buatan, gradient atau glow. Shadow hanya pada overlay.

## Komponen JavaScript

Konfigurasi shadcn `new-york`, `tsx:false` dipertahankan. Komponen dimiliki source aplikasi pada src/components/ui, mengikuti pola komposisi shadcn/Radix dan memakai Tailwind. Tidak memakai komponen library lain atau output TypeScript.

| Kebutuhan | Komponen |
|---|---|
| Teks/angka/tanggal | Input shadcn, input native yang dibungkus komponen |
| Deskripsi/alasan | Textarea shadcn |
| Label dan pesan field | Field, Radix Label, aria-invalid/describedby |
| Pilihan status/tindakan | Radix Select melalui Select/Trigger/Content/Item |
| Tanggal event | Seluruh field menjadi pemicu Popover desktop / Drawer bawah mobile; pilih hari, navigasi bulan, Kosongkan, Hari ini dan mode Ketik tanggal YYYY-MM-DD |
| Pengakuan pembatalan | Radix Checkbox |
| Konfirmasi lifecycle/discard | Radix AlertDialog melalui ConfirmationDialog |
| Navigasi mobile | Radix Dialog melalui Sheet |
| Pergantian event | Radix Dialog dengan input pencarian |
| Surface/status/loading | Card, Badge, Alert, Skeleton |
| Error summary | FormFeedback dengan fokus dan tautan ke field |

Versi tambahan: @radix-ui/react-alert-dialog 1.2.1, react-checkbox 1.4.1, react-select 2.4.1, react-dropdown-menu 2.2.1, react-icons 1.3.2. Versi lain tetap. Lockfile dipin. Install melaporkan 12 temuan dependency (9 moderate, 3 high), sama jumlahnya dengan catatan fondasi; bukan klaim audit keamanan bersih.

Instruksi pengguna berikutnya mengoreksi interpretasi kalender inline: desktop memakai Radix Popover yang berjangkar ke seluruh field, mobile memakai Drawer bawah berbasis Radix Dialog. Dependency @radix-ui/react-popover1.1.15 dipasang kembali dan dipin; react-day-picker9.11.1 tetap. Popover desktop lebar288 px, sel hari36 px, padding12 px dan footer ringkas. Tidak mengubah tinggi/posisi form; placement menyesuaikan ruang viewport dan tidak menutupi field pemicunya. Drawer mobile memiliki handle, overlay, focus trap, isi scrollable, tombol Selesai dan safe-area; tanggal mempertahankan target hari44 px. Animasi180/140ms mengikuti reduced-motion. Breakpoint mobile<768 px.

Select status event dan tindakan lifecycle memakai Radix Select di desktop; mobile memakai Drawer berisi listbox dengan tanda opsi terpilih, navigasi ArrowUp/ArrowDown/Home/End, Enter/Space native, dismiss/Escape dan fokus kembali ke field. Nilai tetap terkontrol dan FormData tetap memakai input hidden bila name disediakan. Memilih opsi langsung menutup drawer; Selesai menutup tanpa mengganti nilai.

Field wajib ditandai * merah; field opsional tetap berlabel Opsional. Asterisk berada di luar teks label yang terasosiasi supaya nama aksesibel field tetap stabil. Aturan required dan validasi server tetap dipertahankan. Pemilihan tanggal, Hari ini, Kosongkan, Selesai, tutup, Escape dan klik luar memakai mekanisme fokus/dismiss Radix. Mode Ketik tanggal mengganti kalender dengan input.

Input/textarea tetap memakai HTML semantik di balik komponen shadcn. Locale kalender Indonesia; tanggal tampil panjang Indonesia, FormData/API tetap YYYY-MM-DD melalui input hidden. Pemilihan menandai form berubah dan memperbarui error rentang tanggal. Tidak memakai popup browser atau konversi tanggal kalender menjadi timestamp UTC.

## Kontrak validasi

Zod dipakai bersama di client dan server. Submit custom menampilkan summary dan error field berbahasa Indonesia, bukan hanya tooltip browser. Field yang telah dikunjungi divalidasi pada blur. Server tetap sumber kebenaran untuk ownership, lifecycle, optimistic version dan session.

- Event: nama wajib 1–200 setelah trim, deskripsi maksimal 4.000, lokasi maksimal 250, tanggal kalender valid, tanggal selesai tidak mendahului mulai. Field opsional ditandai.
- Akun: nama 1–120, email dinormalisasi/format valid/maksimal 254, kata sandi 12–128 tanpa memangkas spasi. Registrasi meminta konfirmasi sandi yang sama; field konfirmasi tidak dikirim ke endpoint akun. Tombol mata memiliki nama aksesibel dan aria-pressed.
- Lifecycle: alasan 5–1.000 untuk pembatalan/reopen, pengakuan wajib untuk pembatalan. Server memeriksa syarat yang sama. Dialog menyebut event dan akibat tindakan sebelum write.
- Input tetap tersedia ketika validasi, koneksi, atau server gagal; error server membawa field dan request ID. Konflik versi tidak menimpa data otomatis. Key lifecycle dipertahankan untuk retry intent yang sama.
- Form metadata memberi konfirmasi saat tautan akan meninggalkan perubahan serta peringatan native saat reload/menutup halaman. Tombol submit disabled sebelum hydration/saat pending. Dialog memerangkap fokus, Escape dan pengembalian fokus ditangani.
- Batas JSON khusus API event 32 KiB agar seluruh kombinasi field valid dapat terkirim, termasuk deskripsi 4.000 karakter. Batas default 4 KiB registrasi tidak diubah; panjang field tetap dibatasi schema.

Tidak ada migration atau perubahan perhitungan uang dalam penyempurnaan ini. Baseline/clone RAB dan close penuh tetap mengikuti batas fase.
