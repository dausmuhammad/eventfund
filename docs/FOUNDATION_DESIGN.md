# Arah desain Phase 01

Sumber arah: DESIGN_SYSTEM.md dan PRD, tanpa perubahan cakupan. Mode antislop `during` dipilih pengguna pada sesi 10 November 2026.

Pembacaan desain: aplikasi keuangan event untuk bendahara, bahasa visual tenang dan berorientasi form, ENERGY 1 / RHYTHM 1 / MOTION 1.

- Biru #1D4ED8 menandai aksi utama dan tautan; mengikuti token proyek yang sudah ditetapkan.
- Canvas #F8FAFC dan permukaan putih memisahkan form dari konteks tanpa dekorasi tambahan.
- Arial/Helvetica/system sans dipakai sebagai fallback lokal, agar teks dan angka tetap terbaca tanpa unduhan font saat build.
- Desktop membagi pengantar dan form; mobile menumpuk keduanya supaya field tetap penuh dan target sentuh minimal 44 px.
- Card hanya membungkus unit tugas: form akun dan penjelasan ruang kerja kosong.
- Tanda titik pada nama produk adalah teks, bukan logo/aset grafis baru.
- Tidak ada ikon dekoratif, ilustrasi, angka keuangan contoh, grafik, testimonial, atau navigasi modul yang belum berjalan.
- Shadow dipakai pada overlay untuk menandai elevasi; dialog menjadi sheet bawah pada mobile dan dialog tengah pada desktop.
- Motion sebatas perubahan warna kontrol; prefers-reduced-motion mematikan transisi.
- Label shell menyebut fondasi akun agar pengguna tidak mengira modul event sudah tersedia.

Rasio kontras dihitung dengan formula WCAG pada script Node, bukan perkiraan visual: teks pendamping #475569/putih 7.578:1; foreground/canvas 17.063:1; biru/putih 6.702:1; border kontrol #64748B/putih 4.759:1; focus/canvas 4.940:1; error/red-50 5.915:1; success/green-50 6.812:1. Python alias host tidak dapat dipakai, sehingga formula dipakai langsung.
