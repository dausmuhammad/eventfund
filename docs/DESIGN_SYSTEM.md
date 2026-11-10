# Design System dan UX — EventFund v1.0

Tujuan: pengguna yang terbiasa Excel dapat menyusun RAB dengan cepat di desktop dan mencatat kas/iuran dengan nyaman di ponsel. Data, validasi, izin, dan perhitungan identik pada kedua tampilan. Dokumen ini menjadi kontrak UI, bukan screenshot aplikasi selesai.

## 1. Karakter visual dan bahasa

Tampilan ringan, jelas, fokus pada angka dan tindakan. Bahasa Indonesia sehari-hari yang rapi: “Simpan perubahan”, “Catat pembayaran”, “Sisa tagihan”, “Terima pemasukan”, “Balikkan transaksi”. Hindari kata “commit”, “idempotency”, “database”, dan “payload” dalam alur pengguna; istilah teknis hanya ada pada detail dukungan/error ID.

Tiga konsep ditampilkan terpisah: **Anggaran** adalah rencana; **Kas** adalah uang aktual; **Tagihan belum lunas** adalah uang yang belum diterima. Label “Saldo” selalu dilengkapi “kas”. Preview total harus diberi status belum tersimpan bila ada edit lokal.

## 2. Tokens

Pembaruan tampilan aktif atas instruksi pengguna pada10 November2026: palette dan komposisi akun/event mengikuti UI_TEMPLATE.md serta hasil audit UI_UX_AUDIT.md. Canvas #F3F5FA, foreground #18243B, muted #526078, primary #2854D8/hover #1D40B0, border permukaan #DCE3EE dan border kontrol #7D8BA2. Sidebar232 px #12213D; panel identitas event/auth #19345F. Font system Segoe UI dengan fallback lokal. Nilai tabel berikut merupakan baseline awal; override aktif ini dipakai untuk implementasi akun/event. Light content dan aturan aksesibilitas tetap berlaku. Instruksi terbaru: kalender desktop memakai Popover kompak yang berjangkar ke seluruh field, bukan panel inline; tanggal dan dropdown mobile memakai Drawer dari bawah dengan target minimal44 px. Popover desktop memakai sel hari36 px atas permintaan pemadatan. Field mandatory diberi * merah.

Gunakan CSS variables dan Tailwind theme yang sesuai versi terpilih. shadcn dikonfigurasi `tsx:false`/JavaScript sesuai CLI versi terpasang. Radix dipakai untuk primitive focus/accessibility. Jangan mencampur style komponen dari library lain tanpa kebutuhan.

| Token | Nilai awal | Penggunaan |
|---|---|---|
| background | #F8FAFC | Canvas |
| surface | #FFFFFF | Card, table, form |
| foreground | #0F172A | Teks utama |
| muted foreground | #475569 | Teks pendamping |
| border | #CBD5E1 | Garis tabel/input |
| primary | #1D4ED8 | Aksi utama; teks putih |
| primary hover | #1E40AF | Hover/focus action |
| success | #166534 | Teks/status diterima/lunas |
| success subtle | #F0FDF4 | Badge background |
| warning | #92400E | Teks overdue/overbudget |
| warning subtle | #FFFBEB | Warning surface |
| danger | #B91C1C | Error/reversal action |
| danger subtle | #FEF2F2 | Error surface |
| focus | #2563EB | Ring 2px, offset2px |

Verifikasi contrast WCAG AA pada kombinasi final; nilai awal bukan bukti lulus. Status menggunakan icon + teks, bukan warna saja. Grafik selalu menyertakan label atau tabel ringkas. Dark mode di luar v1 agar pengujian konsisten.

Font Geist atau Inter melalui pilihan yang legal dan tersedia lokal; gunakan system fallback tanpa ketergantungan download saat build bila jaringan terbatas. Body16px mobile,14px desktop dense; label14px; caption12px; heading24–28px; KPI28–32px. Angka tabular (`font-variant-numeric: tabular-nums`), nominal rata kanan, nama/deskripsi rata kiri. Spacing skala4/8/12/16/24/32; radius card12px, input8px; shadow tipis pada overlay saja. Jangan membuat tabel terlalu berjarak untuk input banyak baris.

## 3. Responsive shell

| Lebar | Shell | RAB | Entry kas/iuran |
|---|---|---|---|
| <768px | Header event sticky, bottom nav | Category accordion + item cards | Full-width page atau sheet yang dapat discroll |
| 768–1023px | Sidebar collapsible | Kartu atau tabel bila ruang mencukupi | Drawer/form |
| ≥1024px | Sidebar240px, content max1600px | Editable table | Side panel/detail dialog |

Jangan hanya menyembunyikan kolom tabel di mobile hingga konteks hilang. Mobile menampilkan card bernama, qty×harga, subtotal, status, tombol edit. Input transaksi tidak memerlukan horizontal scroll pada 360px. Bottom nav maksimal5 item: Ringkasan, RAB, Kas, Peserta, Lainnya. Reports/Settings di Lainnya. Safe-area inset diperhitungkan; sticky totals dan tombol tidak menutupi input saat keyboard terbuka.

Header selalu menampilkan nama event, status operasional, badge arsip, current revision, dan pilihan ganti event. Ketika ganti event dengan input belum disimpan, konfirmasi discard terlebih dahulu. Semua success toast menyebut event bila relevan untuk mencegah salah konteks.

## 4. Inventory komponen

| Komponen | Kebutuhan perilaku |
|---|---|
| EventSwitcher | Hanya event owner; search; archived terpisah |
| MoneyInput | Input teks decimal terkontrol, inputmode decimal; preview format; parser locale eksplisit |
| QuantityInput | Maks3 pecahan; unit terpisah; tidak pakai money parser |
| FinancialKpi | Label scope, nilai, tooltip formula, loading/empty/error |
| EditableBudgetTable | Draft state, validation per cell, save batch, keyboard, totals |
| BudgetItemCard | Qty/unit/price/subtotal, edit sheet, archive |
| StatusBadge | Label administratif terpisah settlement/overdue |
| PaymentForm | Sisa terbaru, amount, metode, tanggal, review, key bertahan saat retry |
| ReceiptPanel | Receipt ID, participant snapshot, amount, sisa saat transaksi, link latest charge |
| ReversalDialog | Original amount/date, alasan, efek kas/sisa, confirm |
| ConflictBanner | Error yang jelas, refresh/review tanpa kehilangan input |
| AttachmentList | Type/size/progress/error, authorized download, delete logical |
| EmptyState | Mengapa kosong + satu CTA relevan |
| ErrorSummary | Focusable; link ke input invalid; request ID untuk dukungan |

Gunakan Button, Input, Label, Textarea, Select, Dialog, AlertDialog, Sheet, Tabs, Table, Badge, DropdownMenu, Tooltip, Accordion dari shadcn/Radix sesuai kebutuhan. Jangan membuat spreadsheet engine generik, formula arbitrary, atau canvas grid custom untuk MVP.

## 5. Desktop RAB spreadsheet

Layout contoh:

```text
Event Perpisahan                    PLANNED · RAB revisi 2
RAB aktif  |  Baseline  |  Histori revisi
[Buat revisi] [Bandingkan] [Ekspor Excel]

Kategori Konsumsi                  [Tambah item] [Urutkan]
Nama            Qty       Satuan     Harga           Subtotal
Snack           41.000    pax        Rp25.000,00     Rp1.025.000,00
Makan siang     41.000    pax        Rp35.000,00     Rp1.435.000,00
Subtotal kategori                                  Rp2.460.000,00

Draft revisi · perubahan belum disimpan
[Batal perubahan] [Simpan draft] [Publikasikan revisi]
```

Sebelum baseline, label “RAB draft”; tombol “Tetapkan baseline” membuka ringkasan total dan konfirmasi. Sesudah baseline, tabel current read-only sampai pengguna membuka draft revisi. Editor draft mempunyai banner “Perubahan ini belum mengubah anggaran aktif” dan alasan revisi wajib sebelum publish.

Setiap cell editable memiliki label accessible dengan nama kolom dan item. Tab/Shift+Tab mengikuti input DOM; Enter menyelesaikan edit cell, Escape membatalkan perubahan cell yang belum dikonfirmasi. Panah tidak boleh merusak interaksi input angka/text native. Ctrl/Cmd+S memicu save batch saat fokus dalam editor. Reorder via tombol naik/turun; drag boleh sebagai tambahan, bukan satu-satunya cara.

Simpan **eksplisit per batch** untuk MVP, bukan autosave diam-diam. Tampilkan dirty count dan error baris; subtotal preview langsung tetapi official total baru diperbarui setelah server response. Batch atomic: jika satu baris invalid, tidak ada baris tersimpan. Konflik version menampilkan snapshot terbaru dan opsi muat ulang; jangan auto-overwrite atau merge angka tanpa tinjauan.

Tambah baris memberi fokus nama item. Archive item butuh konfirmasi bila ada transaksi; jelaskan realisasi historis tetap tercatat. Header dan total dapat sticky dalam area tabel; page tidak memiliki dua scrollbar horizontal yang membingungkan. Copy teks cell native tetap tersedia; multi-cell paste/import/formula Excel di luar v1.

## 6. Mobile RAB dan input

```text
< Event Perpisahan        PLANNED
RAB aktif · revisi 2
Total anggaran Rp12.595.000,00

Konsumsi                         v
Snack
41 pax × Rp25.000,00
Rp1.025.000,00               [Edit]

[Tambah item]
```

Tap edit membuka form Nama, Kategori, Qty, Satuan, Harga satuan, Catatan. Subtotal besar di bawah harga. Sticky save area memiliki ruang scroll dan safe-area. Jika event sudah baseline dan belum ada draft, CTA “Buat revisi untuk mengubah” membuka alur revisi; jangan memberi kesan mengedit current langsung.

Nominal input tidak memformat ulang kursor pada setiap ketikan secara agresif. Tampilkan contoh `310000,00` dan format rupiah pada blur/preview. Error terlihat di bawah field dan di summary. Tidak mengandalkan numeric keyboard menolak karakter invalid; server tetap memvalidasi.

## 7. Pembayaran maksimal empat langkah

1. Pilih peserta melalui search/filter UNPAID/PARTIAL/PAID dan OVERDUE tambahan.
2. Lihat tagihan final, total diterima net, sisa terbaru, due date, dan histori; tap “Catat pembayaran”.
3. Masukkan amount, metode, waktu terima, catatan; shortcut “Bayar seluruh sisa” hanya mengisi nilai saat ini.
4. Review participant/event/amount/sisa setelah bayar; simpan dan tampilkan committed receipt.

Form membuat satu key untuk satu intent pembayaran, menyimpan key dan normalized payload selama hasil belum diketahui. Tombol disabled selama request, spinner dan teks “Menyimpan pembayaran…”. Network timeout menampilkan “Hasil pembayaran belum diketahui. Coba periksa atau kirim ulang.” Retry memakai key sama. Mengubah amount saat hasil belum diketahui harus memeriksa hasil lama lebih dahulu agar pengguna tidak membuat dua intent tanpa sadar.

409 sisa tidak cukup: tampilkan “Sisa tagihan berubah menjadi Rp…”, refresh charge, pertahankan input sebagai referensi, minta review amount baru. Jangan diam-diam memotong amount. Success receipt menampilkan sisa **sesudah pembayaran ini** dan tombol lihat kondisi terbaru. Lampiran dapat diunggah setelah receipt sukses; gagal upload memberi retry tanpa mengulang payment.

Charge detail menampilkan badge administratif DRAFT/ISSUED/VOID, badge settlement bila ISSUED, badge OVERDUE tambahan. Tagihan nol menampilkan “Lunas — tidak ada pembayaran yang diperlukan” dan menyembunyikan tombol bayar. Form adjustment menawarkan Tanpa penyesuaian / Diskon atau subsidi / Tambahan, magnitude dan alasan, preview base→final.

## 8. Kas, warning, dan koreksi

Daftar income dan expense memakai tab terpisah; filter tanggal/status/sumber atau item. Baris posted menampilkan nominal, tanggal efektif, metode, sumber/item, status, original/reversal badge. Aksi edit hanya untuk DRAFT/PENDING. Posted menyediakan lihat detail dan “Balikkan transaksi”; original yang sudah direversal menampilkan link companion.

Reversal dialog menyebut jumlah penuh, tanggal reversal, alasan, dan efek: “Kas akan berkurang Rp150.000,00 dan sisa tagihan bertambah Rp150.000,00”. Tombol destructive teks lengkap “Konfirmasi pembalikan”. Tidak memakai teks “Hapus pembayaran” yang menyiratkan histori hilang. Reversal bukan tombol transfer dana otomatis.

Expense no-item menampilkan field alasan tak teranggarkan. Warning overbudget/negative cash menampilkan angka sebelum/sesudah serta checkbox pengakuan; warning tidak menutup akses mencatat kejadian nyata. Kas negatif memakai tanda minus dan label jelas. Komitmen belum dibayar ditampilkan terpisah dari kas keluar.

## 9. Dashboard, laporan, dan lifecycle

Urutan KPI: current RAB, realisasi net, saldo kas, tagihan belum lunas. Baris sekunder: pending expense, projected remaining budget, pending GENERAL income, funding gap. Tooltips menjelaskan actual vs projection. Grafik pemakaian boleh melewati100% dengan label overbudget; jangan clamp angka sehingga kelebihan tersembunyi. Baseline/current toggle tidak mengubah actual.

Reports menampilkan event, range cash period opsional, timezone, batas baris, dan deskripsi sheets. Label “Posisi saat snapshot” pada current RAB/receivable tetap ada ketika memilih range cash lama. Download button tidak menampilkan keberhasilan sampai response file valid; bila gagal tampilkan pesan dan filter tetap tersimpan.

Close dialog mencantumkan blockers draft/pending, jumlah sisa tagihan, kas, dan note konfirmasi. Jika ada blockers, berikan link menuju daftar. Close berhasil mengubah UI read-only; banner menyebut cara reopen. Event CANCELLED tidak menawarkan reopen. Arsip hanya untuk COMPLETED/CANCELLED, dan unarchive tidak otomatis membuka transaksi.

## 10. States dan accessibility

Setiap halaman memiliki loading skeleton, empty state, error/retry, dan unauthorized fallback. List kosong karena filter berbeda dari belum ada data; CTA “Hapus filter” sesuai konteks. Mutasi gagal mempertahankan input, fokus ke error summary. Toast sukses memakai aria-live polite; error penting inline persisten. Dialog focus trap dan restore focus; Esc menutup dialog non-destructive dengan dirty-check bila perlu.

Semua kontrol memiliki visible label, help text terkait aria-describedby, invalid state aria-invalid, dan focus ring. Icon-only button memiliki accessible name. Target touch44×44px; body font minimal16px pada form mobile. Respect prefers-reduced-motion; animasi100–180ms tidak menghalangi interaksi. Tabel memakai header scope dan caption; jangan memberi role grid jika keyboard grid pattern belum benar-benar diimplementasikan.

Verifikasi dengan keyboard-only, zoom200%, lebar360/768/1440, screen-reader labels dasar, serta contrast checker. Pemilik satu akun pun harus mendapat pesan 404 non-owner yang sama seperti ID tidak ditemukan.

## 11. UX acceptance checklist

- [ ] Event context selalu terlihat saat entry kas/pembayaran.
- [ ] Desktop dapat menambah/edit/simpan RAB tanpa mouse untuk alur utama.
- [ ] Mobile tidak membutuhkan scroll horizontal untuk form dan card RAB.
- [ ] Draft revisi dan current RAB jelas dibedakan.
- [ ] Input nominal tidak kehilangan sen dan sesuai parser locale yang terdokumentasi.
- [ ] Retry pembayaran tidak membuat receipt/income kedua.
- [ ] Konflik memperlihatkan sisa baru tanpa menimpa input diam-diam.
- [ ] Badge administratif, settlement, overdue tampil terpisah.
- [ ] Reversal memaparkan efek kas dan outstanding sebelum konfirmasi.
- [ ] Close/locked event menonaktifkan aksi dan server tetap menolak direct request.
- [ ] Loading/error/empty state dan focus dialog terverifikasi.
- [ ] Dashboard dan Excel menyebut scope waktu dan status proyeksi dengan jelas.
