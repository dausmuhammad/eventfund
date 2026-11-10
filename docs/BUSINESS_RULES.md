# Business Rules — EventFund v1.0

Dokumen ini adalah kontrak perilaku server. UI, API, query laporan, dan test wajib memakai definisi yang sama. Nama tabel/field mengacu ke [DATABASE](DATABASE.md). Scope produk mengacu ke [PRD](PRD.md).

## 1. Istilah dan representasi

- **RAB aktif/current**: working budget yang cocok dengan snapshot PUBLISHED terbaru; sebelum baseline, working draft event.
- **Baseline**: snapshot PUBLISHED revision_no 1; tidak berubah ketika revisi berikutnya diterbitkan.
- **Posted**: income RECEIVED, expense PAID, atau contribution payment entry yang sudah commit. Posting mengakui arus kas; bukan sekadar janji.
- **Reversal**: entri pembalik penuh, amount positif dengan kind REVERSAL; efek finansial negatif. Original tetap tercatat.
- **Komitmen**: expense PENDING sederhana. Tidak ada pembayaran sebagian vendor pada v1.
- **Piutang iuran**: sisa tagihan ISSUED; bukan uang tersedia. Tidak memperkenalkan modul piutang umum.

BR-M01: currency event IDR, tidak dapat diubah. Amount NUMERIC(18,2), quantity NUMERIC(14,3), unit price NUMERIC(18,2). JSON memakai string desimal seperti `"310000.00"`; pemisah ribuan hanya di tampilan. Input lokal `310.000,50` dinormalisasi oleh parser yang eksplisit; request kanonis tetap titik desimal tanpa pemisah ribuan. Tolak notasi eksponen, NaN, Infinity, negatif yang tidak diperbolehkan, precision berlebih, dan overflow. Jangan diam-diam memotong sen/pecahan.

BR-M02: subtotal item = round_half_up(quantity × unit_price, 2). Total RAB = sum(subtotal per item aktif), bukan pembulatan satu kali setelah sum perkalian mentah. Harga nol sah; qty harus >0. Total hasil agregasi harus masih dapat direpresentasikan NUMERIC(18,2); validasi sebelum commit. Contoh: 1.125 × 10.10 = 11.3625 → 11.36; 0.005 × 1.00 = 0.005 → 0.01. Uji batas numerik, jangan menggunakan hasil float JS sebagai expected value.

BR-M03: server memakai Decimal dari Prisma atau library Decimal yang kompatibel. Serializer mengubah seluruh Decimal menjadi string. Preview client tidak authoritative. Excel boleh memakai angka numerik setelah pemeriksaan presisi; aturan export di §12.

BR-T01: timestamps disimpan UTC TIMESTAMPTZ, ditampilkan timezone event, default Asia/Jakarta. due_date dan tanggal event memakai DATE. Overdue berarti today pada timezone event **lebih besar** dari due_date dan outstanding >0. Pada tanggal jatuh tempo belum overdue. Posting memilih waktu efektif received_at/paid_at; server menyimpan created_at terpisah. Tolak tanggal efektif masa depan dan reversal yang mendahului original. Backdate diperbolehkan saat event terbuka dan tetap tampak di audit.

## 2. Authentication dan authorization

BR-A01: registrasi lokal dengan email trim/lowercase, nama 1–120 karakter, password 12–128 karakter; spasi pada password dipertahankan. Email format valid dan unik case-insensitive. Password di-hash Argon2id; tidak dikirim kembali, tidak dicatat di audit. Duplicate register memakai pesan generik yang tidak membeberkan data akun.

BR-A02: Auth.js Credentials + JWT session. User disimpan aplikasi melalui Prisma, bukan mengandalkan Credentials untuk provisioning. Token memuat user ID dan session_version; setiap akses terlindungi memeriksa user aktif serta versi token terhadap DB. Logout menghapus session client; perubahan password/penonaktifan menaikkan session_version. Password change dapat ditunda UI-nya, tetapi invalidation helper harus tersedia. Session maksimum 8 jam; tidak ada remember-me pada v1.

BR-A03: login dibatasi 5 percobaan gagal per kombinasi hash email dan IP dalam 15 menit, serta 30 per IP dalam 15 menit; registrasi 5 per IP per jam. Balas 429 dengan Retry-After. Simpan limiter dalam DB agar tidak bergantung proses tunggal. Jangan mengunci akun permanen. Generic invalid credentials sama untuk email tidak ditemukan dan password salah; gunakan dummy hash verification agar tidak membedakan jalur dengan jelas.

BR-A04: MVP hanya `events.owner_id`. Daftar selalu filter owner; detail query `id AND owner_id`; mutasi mengecek ulang di dalam transaksi setelah lock. Non-owner mendapat 404; unauthenticated 401. Lampiran dan receipt menggunakan aturan sama. Tidak ada endpoint yang mempercayai owner_id dari body.

| Operasi | Owner event | User lain | Fitur role masa depan |
|---|---|---|---|
| Baca event/RAB/kas/participant/export/bukti | Ya | Tidak | Viewer bisa baca jika kelak diaktifkan |
| Edit RAB, default, peserta, kas, bayar/reverse | Ya jika event terbuka | Tidak | Treasurer dapat diberi hak kemudian |
| Baseline, close/reopen/cancel/archive, duplikasi | Ya sesuai status | Tidak | Tetap owner |
| Mengundang anggota/transfer ownership | Tidak tersedia v1 | Tidak | Butuh spesifikasi lanjutan |

BR-A05: setiap Route Handler, Server Action, dan Server Component yang membaca data memanggil guard. Middleware/redirect layout hanya kenyamanan navigasi. Custom mutating APIs wajib pemeriksaan origin terhadap APP_ORIGIN dan anti-CSRF token yang terikat session; Auth.js endpoints mengikuti proteksi Auth.js. Non-GET tidak boleh menerima cross-origin request dengan credential; GET tidak pernah mengubah data.

## 3. Lifecycle event dan penguncian

BR-E01: archived_at adalah atribut terpisah; bukan enum status. Lifecycle:

| Dari | Ke | Prasyarat |
|---|---|---|
| Baru | DRAFT | Metadata valid, owner dari session |
| DRAFT | PLANNED | Publish baseline dalam transaksi yang sama |
| PLANNED | ACTIVE | Aksi owner eksplisit |
| PLANNED/ACTIVE | COMPLETED | Tidak ada open draft/pending; konfirmasi saldo/tunggakan |
| COMPLETED | ACTIVE | Reopen dengan alasan; tidak archived |
| DRAFT/PLANNED/ACTIVE | CANCELLED | Tidak ada open draft/pending; alasan; bila ada posted cash konfirmasi histori dipertahankan |
| COMPLETED/CANCELLED | Arsip | archived_at diisi; tidak mengubah status |
| Arsip | Unarchive | Owner; status operasional tetap |

Tidak ada reset PLANNED/ACTIVE menjadi DRAFT atau reopen CANCELLED pada v1. Untuk koreksi setelah COMPLETED, unarchive bila perlu lalu reopen. Cancel event tidak otomatis membalik kas atau menghapus tunggakan; ini status operasional, bukan refund. UI mengingatkan agar koreksi kas dilakukan sebelum cancel jika diperlukan.

BR-E02: DRAFT menerima metadata, RAB, settings, peserta, charge DRAFT, income/expense DRAFT/PENDING, tetapi tidak issue charge atau post cash. PLANNED/ACTIVE menerima operasi tersebut plus issue, payment, posting, reversal, dan RAB draft revision. COMPLETED/CANCELLED/archived read-only untuk seluruh data operasional termasuk upload. Exceptions terbatas: read/export, unarchive, dan reopen COMPLETED. Tidak boleh bypass dengan direct route.

BR-E03: close/cancel menolak bila ada income DRAFT/PENDING, expense DRAFT/PENDING, charge DRAFT, atau budget revision DRAFT. UI menampilkan daftar yang perlu diselesaikan/discard/cancel. Tagihan ISSUED yang belum lunas **bukan** blocker; owner harus mengakui jumlah outstanding dalam close confirmation. Saldo kas tidak harus nol atau positif. Close tidak membuat write-off. Tagihan dan saldo historis tetap tampil.

BR-E04: seluruh mutasi data event mengambil `SELECT ... FROM events WHERE id=? FOR UPDATE` di transaction, kemudian verifikasi ownership, archived_at, status, dan expected version. Urutan: event → charge(s) → posted entry bila dibutuhkan. Operasi banyak event seperti duplikasi mengunci sumber; event tujuan baru tidak bersaing. Strategi ini sengaja serial per event untuk MVP dan menghindari payment masuk bersamaan dengan close.

## 4. RAB, baseline, dan revisi

BR-B01: nama kategori/item tidak di-hardcode. Nama kategori unik case-insensitive per event termasuk yang diarsipkan agar referensi tidak ambigu; restore kategori lama bila perlu. Item boleh bernama sama. Qty >0, unit 1–30, price ≥0, item name 1–200, category name 1–120. sort_order integer ≥0; tie diurutkan id. Kategori dan item memiliki archived_at, version.

BR-B02: sebelum baseline, batch perubahan RAB memakai event budget_version optimistic locking. Satu batch gagal seluruhnya jika ada baris invalid. Setelah baseline, endpoint working edit menolak; perubahan hanya dalam revision draft. Gunakan satu draft revision per event. Draft revision menyimpan **snapshot lengkap**, schema_version, base_revision_no, version, alasan; item baru sudah mendapat UUID server. Draft boleh diedit/discard tetapi tidak memengaruhi budget aktif.

BR-B03: baseline menyimpan snapshot revision 1 (kind BASELINE, state PUBLISHED) dan mengubah event ke PLANNED. Publish revision berikutnya memvalidasi base_revision_no masih latest, snapshot, FK/UUID ownership, total, dan expected version. Kenaikan revision_no, penerapan snapshot ke working categories/items, archived item yang dihilangkan, update budget_version, dan audit satu transaction. Draft revision berubah menjadi PUBLISHED lalu immutable. Budget lama tetap berlaku jika publish rollback.

BR-B04: snapshot mencakup seluruh kategori/item termasuk archived flag, stable ID, name, qty string, unit, price string, sort_order, subtotal string, total string, currency, schema_version. Snapshot tidak menerima subtotal client tanpa menghitung ulang. PUBLISHED tidak diupdate/delete. Item yang pernah digunakan transaksi tidak pernah dihapus; archive item menjaga actual tetap masuk event total, di kelompok item nonaktif pada perbandingan.

BR-B05: actual terhadap item adalah net PAID expense linked ke stable item ID; expense menyimpan budget_label_snapshot saat posting agar nama lama bisa ditampilkan. Pengeluaran tanpa item berada di “Tak teranggarkan”, bukan kategori RAB buatan diam-diam. Persentase penggunaan saat budget=0 adalah null/“—”; jika actual>0 tampil warning tanpa membagi nol. Negative variance diperbolehkan.

## 5. Income dan expense

BR-C01: semua amount entry >0. `kind=NORMAL` berefek +amount pada domainnya; `kind=REVERSAL` berefek −amount. Kas = signed income − signed expense. Reversal tidak diberi amount negatif dan tidak mengubah status original.

| Jenis | State | Efek kas | Transisi |
|---|---|---|---|
| Income NORMAL | DRAFT | 0 | PENDING, RECEIVED, CANCELLED |
| Income NORMAL | PENDING | 0 | DRAFT, RECEIVED, CANCELLED |
| Income NORMAL | RECEIVED | +amount | Immutable; koreksi lewat companion REVERSAL |
| Income NORMAL | CANCELLED | 0 | Terminal |
| Income REVERSAL | RECEIVED | −amount | Terminal immutable |
| Expense NORMAL | DRAFT | 0 | PENDING, PAID, CANCELLED |
| Expense NORMAL | PENDING | 0 | DRAFT, PAID, CANCELLED |
| Expense NORMAL | PAID | −amount | Immutable; koreksi lewat companion REVERSAL |
| Expense NORMAL | CANCELLED | 0 | Terminal |
| Expense REVERSAL | PAID | +amount | Terminal immutable |

BR-C02: posted but reversed original tetap RECEIVED/PAID. UI menambahkan badge computed “Dibalik”; bukan status DB baru. Laporan menjumlah original dan reversal bertanda. Jangan sekaligus mengecualikan original yang telah direversal karena akan mengurangi dua kali. Reversal atas reversal tidak tersedia; jika reversal keliru buat transaksi normal baru yang tercatat.

BR-C03: satu expense terhubung maksimal satu budget item. Tanpa item, unbudgeted_reason wajib. Amount tidak dibatasi nilai budget atau saldo kas. Posting dengan overbudget atau saldo proyeksi negatif memerlukan acknowledgement flags; server menghitung warning dalam transaction. Jika flag belum ada, kembalikan 409 WARNING_CONFIRMATION_REQUIRED tanpa write, berikut detail nilai untuk konfirmasi. Client mengonfirmasi lalu mengirim dengan key baru karena payload berubah.

BR-C04: sumber income dinamis; terdapat tepat satu source kind CONTRIBUTION per event yang dibuat sistem, tidak bisa diedit/diarsipkan atau dipakai generic income endpoint. Source lain kind GENERAL. Pembayaran iuran tidak boleh dibuat sebagai generic income. Transaksi donation/sponsor manual adalah GENERAL; tidak ada pencocokan otomatis antar nominal atau nama.

BR-C05: posted immutable termasuk amount, tanggal, metode, source/item, description, linkage, creator. Catatan koreksi diberikan dalam reversal atau audit, bukan update posted row. Lampiran boleh ditambah/dihapus secara logis pada event terbuka dengan audit, tanpa mengubah angka. DRAFT/PENDING dapat diupdate dengan version; tidak boleh posting dengan version stale. Tidak ada delete fisik transaksi pada API.

BR-C06: reversal penuh harus amount, source/item, charge bila terkait, dan event sama dengan original. Waktu efektif ≥ original dan ≤ waktu sekarang; original posted NORMAL; belum punya reversal. Wajib reason 5–1000 karakter. Untuk generic income tanpa payment buat companion income; expense buat companion expense. Income yang terhubung contribution_payment **hanya** direversal dari payment service. Tidak ada route umum yang membaliknya sendiri.

## 6. Peserta dan settings default

BR-P01: peserta punya nama 1–150, identifier opsional 1–80 unik per event case-insensitive bila diisi, kontak opsional maks 200, notes maks 2000. Nama boleh sama. Identifier kosong menjadi NULL. Peserta yang diarsipkan tetap ada dalam histori/export. Tidak ada hard delete peserta yang sudah punya tagihan.

BR-P02: default_amount event ≥0; due date opsional. Pengaturan baru hanya memengaruhi pembuatan draft baru. Generate tagihan membaca default dengan event lock dan menyalin snapshot. Draft existing hanya berubah lewat aksi “Gunakan default terbaru” eksplisit; preview old/new dan expected version wajib. Tidak ada recalculation otomatis setelah default diubah.

BR-P03: archive participant ditolak jika ada charge DRAFT, ISSUED outstanding>0, atau net payment>0. Participant dengan ISSUED zero charge atau paid yang sudah seluruhnya direversal dan tagihan di-VOID dapat diarsipkan. Nama/kontak boleh diperbarui saat event terbuka; bukti pembayaran menyimpan participant_name_snapshot sehingga receipt historis tidak berubah.

## 7. Tagihan dan settlement

BR-Q01: satu charge non-VOID per participant; charge history boleh banyak. DRAFT → ISSUED atau VOID. ISSUED → VOID hanya net paid=0; VOID terminal. Tidak ada transisi ISSUED → DRAFT. Amount dan due_date immutable setelah issue. Charge DRAFT selalu net paid=0. participant harus aktif saat create/issue. Nominal akhir tidak negatif.

| adjustment_type | adjustment_amount | final_amount | reason |
|---|---:|---|---|
| NONE | 0 | base_amount | NULL/empty |
| DISCOUNT | >0 dan ≤base | base − adjustment | Wajib 5–1000 karakter |
| SURCHARGE | >0 | base + adjustment | Wajib 5–1000 karakter |

BR-Q02: due_date wajib valid DATE bila diisi; boleh sebelum tanggal issue untuk pencatatan tagihan lama, dengan peringatan UI. Penerbitan tidak menghasilkan cash. `base_amount`, `adjustment_amount`, dan `final_amount` ditetapkan server. `issued_at`, actor, description, participant_name_snapshot disimpan. Perubahan default tidak mengubah tagihan issued.

BR-Q03: untuk ISSUED, net_paid = Σ signed payment entries. Outstanding = final_amount − net_paid. Invariant 0≤net_paid≤final_amount. Settlement computed:

- final_amount=0 → PAID dengan net_paid=0.
- final_amount>0 dan net_paid=0 → UNPAID.
- 0<net_paid<final_amount → PARTIAL.
- net_paid=final_amount → PAID.

Untuk DRAFT/VOID settlement dan overdue bernilai null/false, tidak dimasukkan receivable. OVERDUE adalah badge tambahan (`outstanding>0 AND today>due_date`), bukan enum administratif atau settlement. Tidak menyimpan settlement/outstanding sebagai kolom mutable.

BR-Q04: koreksi ISSUED: reversal semua payment NORMAL yang masih aktif → pastikan net_paid=0 → VOID dengan alasan → draft pengganti dan issue. Tidak mengubah amount tagihan yang pernah dibayar. Reversal harus menggambarkan koreksi penerimaan atau pengembalian penuh yang benar-benar dilakukan; aplikasi tidak mengeksekusi transfer bank. Pengembalian sebagian dan pemindahan kredit tidak tersedia.

BR-Q05: bulk generate maksimal 100 peserta per request, semua-atau-tidak-sama-sekali, pilih participant ID eksplisit. Jika ada non-VOID charge, balas conflict dengan daftar tersebut, jangan diam-diam overwrite. Bulk generate hanya DRAFT; issue batch dapat terpisah maksimal 100 dengan precondition yang sama dan event lock. Tidak ada retry yang membuat charge ganda karena unique partial index.

## 8. Pembayaran atomik, idempotency, dan concurrency

BR-Y01: pembayaran hanya event PLANNED/ACTIVE tidak archived, charge ISSUED dan participant aktif, amount>0 dan ≤outstanding, method CASH/BANK_TRANSFER/OTHER; OTHER membutuhkan method_note. Tidak ada payment DRAFT/PENDING; payment entry hanya NORMAL atau REVERSAL yang langsung posted. UI receipt berasal dari committed response.

BR-Y02: payment NORMAL membuat tepat satu income NORMAL RECEIVED dengan contribution_payment_id unique. Payment REVERSAL membuat tepat satu income REVERSAL RECEIVED yang merujuk original income. Event, amount, received_at, kind, method harus sama antar pasangan. Payment bukan tambahan kas di luar income. DB deferred constraint trigger menolak pasangan hilang/tidak cocok pada commit.

BR-I01: semua command posting/reversal, baseline/publish revision, dan lifecycle transition membawa `Idempotency-Key` 16–100 karakter ASCII terbatas `[A-Za-z0-9_-]`. Key UUID client disarankan. Scope unique `(event_id, actor_id, key)` melintasi operation; request_hash mencakup method, normalized path, operation, dan payload JSON kanonis. Pengiriman uang dinormalisasi dua desimal sebelum hash; idempotency key, CSRF token, request ID tidak masuk hash. Berbeda operation/payload dengan key yang sama →409 IDEMPOTENCY_CONFLICT. Hasil sukses disimpan sepanjang histori event; tidak dievikt secara periodik dalam v1.

BR-I02: otorisasi selalu diperiksa **sebelum** replay. Setelah event lock, cari key: bila ada hash sama return stored status/body (header Idempotency-Replayed: true), walaupun event sudah closed/archived; tidak melakukan mutasi. Bila tidak ada, validasi state dan command. Hanya hasil commit sukses dicatat. Validasi gagal/rollback tidak meninggalkan key; pengguna boleh mencoba ulang setelah koreksi tetapi gunakan key baru jika payload berbeda. Tidak ada IN_PROGRESS record persisten; event lock membuat request paralel menunggu sampai commit/rollback.

Normalisasi hash harus deterministik: hash hanya input kanonis dan default statis, bukan timestamp `now()` yang berubah saat retry. Waktu efektif pembayaran wajib dikirim client; untuk command dengan waktu server default, tetapkan setelah replay lookup dan simpan dalam response. Payload field tak dikenal ditolak oleh strict schema, bukan diabaikan dengan cara yang mengubah arti command.

BR-I03: transaction algorithm wajib:

```text
authenticate; parse shape + normalize payload; calculate hash
BEGIN (READ COMMITTED dengan explicit locks)
  lock event row; verify DB ownership/user validity
  load idempotency by event + actor + key
  if exists: compare hash; return exact stored committed result
  assert event allows command
  lock charge FOR UPDATE (untuk payment/reversal)
  read posted payment entries; compute net_paid and outstanding
  validate amount, original payment, timestamp, warnings
  insert payment NORMAL or REVERSAL
  insert matching income entry (and link original for reversal)
  append minimal audit
  insert idempotency response status/body including receipt IDs
COMMIT (deferred invariants validated)
return response; refresh summary after commit
```

Generic posting/reversal dan RAB publish memakai urutan serupa tanpa charge jika tidak diperlukan. Semua writer harus mengambil event lock **sebelum** memodifikasi data; jangan membaca outstanding sebelum lock lalu memakai hasil lama. Event row lock ditahan sampai commit. Dokumentasi PostgreSQL menjelaskan bahwa row lock memblokir writer/locker lain pada baris sama: [Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).

BR-I04: jika dua user/request mengirim payment 200000 dan 150000 pada outstanding 310000, satu commit; yang kedua melihat sisa baru lalu 409 INSUFFICIENT_OUTSTANDING. Dua payment 100000 dan 150000 boleh keduanya commit. Dua request key sama menghasilkan satu payment. Payment vs close: yang mendapat event lock dulu menentukan urutan; tidak ada posting setelah close berhasil.

BR-I05: transaksi singkat; tidak ada upload/network/Excel generation di dalam write transaction. Retry hanya transient serialization/deadlock/lock-timeout yang memang aman diulang, maksimal 3 attempt dengan jitter dan bounded timeout. Untuk Prisma Client API klasik, P2034 dapat menandai conflict; petakan berdasarkan **versi terpasang**, bukan menangkap semua exception sebagai retry. Sesudah timeout jaringan, client mempertahankan key semula; endpoint receipt/idempotency lookup terotorisasi membantu memastikan hasil. Setelah retry internal habis balas 503 RETRYABLE_CONFLICT; jangan membuat key baru otomatis.

BR-I06: optimistic version wajib untuk update draft/settings/metadata agar stale screen tidak menimpa. Server `UPDATE ... WHERE id AND event_id AND version=expected` lalu version+1; bila 0 rows →409 STALE_VERSION dengan nilai terkini yang aman. Idempotency mencegah duplikasi command; version mencegah lost update. Keduanya tidak saling menggantikan.

## 9. Reconciliation dan formula tunggal

Untuk horizon all-time pada snapshot yang sama:

| Metrik | Definisi |
|---|---|
| B: current RAB | Σ round(qty × price,2) item aktif dari current published working set |
| B0: baseline RAB | Total snapshot PUBLISHED revision 1 |
| I: net income | Σ signed income RECEIVED, termasuk iuran dan reversal |
| E: net actual expenses | Σ signed expense PAID, termasuk reversal |
| Cash | I − E |
| Remaining budget / variance | B − E |
| C: unpaid commitments | Σ amount expense NORMAL PENDING |
| Projected remaining budget | B − E − C |
| Q: issued charges | Σ final_amount charge ISSUED |
| P: contribution receipts net | Σ signed payment pada charge ISSUED; sama dengan linked income net |
| R: contribution receivable | Σ(final_amount − net_paid) charge ISSUED |
| N: non-contribution net income | Σ signed GENERAL source income RECEIVED |
| J: expected non-contribution income | Σ amount GENERAL income NORMAL PENDING |
| Projected income | I + R + J |
| Funding gap (rencana) | max(0, B − (I + R + J)) |
| Immediate cash shortfall | max(0, C − Cash) |
| Budget utilization | E / B ×100 bila B>0; selain itu null |

BR-F01: DRAFT, CANCELLED, VOID, dan draft RAB revision tidak masuk metrik uang aktual. PENDING income hanyalah proyeksi; UI memberi label “belum diterima”. Contribution receivable tidak dihitung lagi sebagai projected income selain R. Jangan memakai `Q + I`, karena receipt sudah bagian Q dan I. Ini bukan laporan laba/rugi akuntansi.

BR-F02: current event dashboard default all-time. Range report memakai received_at/paid_at sebagai tanggal efektif, bukan created_at. Range `[from local midnight, to+1 local midnight)` dikonversi UTC; boundary eksklusif atas. Reversal masuk di tanggal efektif reversal; original tetap di tanggal original. Opening cash = net cash sebelum from; movement = period income−period expense; closing = opening+movement. Jangan menyebut movement sebagai saldo akhir.

BR-F03: report range tidak mengubah RAB current atau snapshot charge current menjadi histori palsu. Sheet Summary memberi dua blok: **Arus kas periode** dan **Posisi saat snapshot**. Receivable, default, peserta, revision aktif, dan budget/actual all-time adalah posisi snapshot; diberi label eksplisit, tidak diklaim sebagai posisi historis pada tanggal `to`. Untuk all-time actual sampai snapshot, jangan gunakan tanggal `to` periode. Historical point-in-time budget/charge reconstruction di luar v1. Pending income/expense tidak difilter seolah posted; tetap posisi snapshot dan dilabeli.

BR-F04: read summary + detail untuk export dari satu REPEATABLE READ read-only transaction atau equivalent snapshot. Hitung/materialisasikan dataset konsisten dahulu, commit, kemudian render workbook di luar transaction. Dashboard API mengembalikan snapshot_at dan revision_no; UI tidak membandingkan hasil pada waktu berbeda sebagai bukti mismatch. Dashboard tidak menyimpan total keuangan sebagai kolom cache authoritative.

## 10. Bukti, audit, dan histori

BR-U01: upload hanya owner pada event terbuka; JPEG/PNG/PDF, max 5 MiB, max 5 per income/expense. Payment lampiran ditautkan ke generated income, bukan tabel payment terpisah. Server cek extension, MIME, file signature, ukuran, dan ownership target. Tolak SVG, executable, HTML; nama storage UUID dan original filename disanitasi. Simpan di LOCAL_UPLOAD_DIR di luar public. File dibuka melalui authorized streaming route dengan Content-Disposition attachment dan nosniff. Tidak memberi path filesystem ke client.

BR-U02: upload file sementara dulu, validasi, lalu metadata transaction terpisah setelah posting sudah commit. Jika metadata gagal, cleanup temp; jika proses mati, orphan cleanup berbasis metadata dan umur >24 jam. Penghapusan lampiran logical deleted_at + audit; file dapat dibersihkan operator sesuai kebijakan backup. Jangan membuat payment gagal hanya karena upload bukti terpisah gagal; UI memberi aksi retry upload.

BR-H01: minimal audit untuk event transitions, baseline/revision publish/discard, default change, charge issue/void, payment/reversal, income/expense posting/reversal, archive participant, attachment add/remove. before_json/after_json hanya field yang relevan dan redacted; tidak menyimpan password, token, full request, atau kontak yang tidak perlu. Catat actor_id, event_id, entity_type/id, action, reason, request_id, occurred_at. Audit write berada dalam transaksi bisnis yang sama; tidak boleh “best effort” di luar commit.

## 11. API contracts dan errors

JSON umum: `{ "data": ..., "meta": { "requestId": "...", "snapshotAt": "..." } }`; error `{ "error": { "code": "...", "message": "...", "fields": {}, "details": {} }, "requestId": "..." }`. Jangan membocorkan SQL atau stack. Decimal selalu string. ISO timestamps UTC; dates YYYY-MM-DD. List default limit 25, max100, cursor/order stabil `(created_at,id)`; filter/sort whitelist, tidak raw SQL dari user.

| HTTP | Code contoh | Tindakan UI |
|---|---|---|
| 400 | MALFORMED_REQUEST, IDEMPOTENCY_KEY_REQUIRED | Perbaiki request |
| 401 | UNAUTHENTICATED, SESSION_REVOKED | Login kembali; simpan input nonsecret |
| 403 | CSRF_FAILED | Muat ulang token; tidak retry diam-diam |
| 404 | RESOURCE_NOT_FOUND | Tidak tersedia; sama untuk non-owner |
| 409 | EVENT_LOCKED, STALE_VERSION, ACTIVE_CHARGE_EXISTS | Refresh dan tampilkan konflik |
| 409 | INSUFFICIENT_OUTSTANDING, ALREADY_REVERSED | Tampilkan sisa/histori terbaru |
| 409 | IDEMPOTENCY_CONFLICT, WARNING_CONFIRMATION_REQUIRED | Jangan retry key dengan payload berbeda |
| 422 | VALIDATION_FAILED, INVALID_TRANSITION | Tampilkan error field |
| 413 | FILE_TOO_LARGE, REPORT_LIMIT_EXCEEDED | Perkecil file/rentang |
| 415 | UNSUPPORTED_FILE_TYPE | Pilih tipe yang didukung |
| 429 | RATE_LIMITED | Tampilkan Retry-After |
| 503 | RETRYABLE_CONFLICT | Retry bounded dengan key yang sama |

`POST /api/events/:eventId/payments` body minimal:

```json
{
  "chargeId": "uuid",
  "amount": "100000.00",
  "paymentMethod": "BANK_TRANSFER",
  "receivedAt": "2026-11-10T03:00:00Z",
  "notes": "Cicilan pertama"
}
```

Response 201 menyimpan receiptId/paymentId/incomeId, chargeId, amount, netPaidAfter, outstandingAfter, settlementAfter, participantNameSnapshot, effectiveAt. Replay mengembalikan body/status yang sama, termasuk sisa **pada saat receipt dibuat**, bukan sisa terkini. UI memuat charge terbaru secara terpisah; receipt lama tidak berubah setelah payment berikutnya.

Mutation route catalog:

| Route di bawah `/api/events/:eventId` | Command |
|---|---|
| `/lifecycle`, `/archive`, `/unarchive`, `/duplicate` | Status, arsip, duplikasi |
| `/budget`, `/budget/baseline` | Edit DRAFT working budget, publish baseline |
| `/budget/revisions`, `/budget/revisions/:id`, `/:id/publish`, `/:id/discard` | Draft revisi, edit, publish, discard; suffix setelah `/budget/revisions` |
| `/incomes`, `/incomes/:id`, `/:id/post`, `/:id/reverse` | General income create/edit/post/reverse; suffix setelah `/incomes` |
| `/expenses`, `/expenses/:id`, `/:id/post`, `/:id/reverse` | Expense create/edit/post/reverse; suffix setelah `/expenses` |
| `/participants`, `/participants/:id`, `/:id/archive` | Peserta; suffix setelah `/participants` |
| `/contribution-settings` | Default snapshot untuk tagihan baru |
| `/charges`, `/charges/:id`, `/:id/issue`, `/:id/void` | Create/edit draft, issue, void; suffix setelah `/charges` |
| `/payments`, `/payments/:id/reverse` | Posted payment dan reversal |
| `/idempotency/:key`, `/dashboard`, `/reports/excel` | Lookup hasil, summary, export (GET) |
| `/attachments`, `/attachments/:id` | Upload, authorized GET, logical removal |

Create endpoints pakai POST; edit pakai PATCH dengan expectedVersion; command pakai POST; logical attachment removal pakai DELETE. Nonposted cancel adalah PATCH status dengan valid transition. Setiap detail ID divalidasi scoped, tidak cukup event ID pada URL. Endpoints baru harus mengikuti service contract yang sama.

## 12. Excel contract

BR-X01: sheet names tetap Summary, RAB, Budget_Revisions, Incomes, Expenses, Participants, Charges, Payments. Satu baris header, autofilter, freeze header, column widths, number formats IDR dua desimal, dates jelas. Summary menuliskan event, timezone, generated_at/snapshot_at, current revision, filter, opening/movement/closing, B/B0/E/C/R/J/funding gap dan scope setiap metrik. Export tidak berisi password/hash, idempotency payload, storage path, atau audit sensitif.

BR-X02: detail cash period memuat original dan reversal sebagai baris berbeda dengan original_id, kind, amount, signed_effect. Payments period untuk rekonsiliasi iuran; Charges/Participants posisi snapshot. RAB current termasuk item nonaktif yang masih punya actual, dan baris tak teranggarkan. Budget_Revisions menampilkan metadata semua PUBLISHED dan snapshot flattened per item (revision_no, kind, item ID, qty, price, subtotal, total); DRAFT tidak masuk report resmi.

BR-X03: string user ditulis sebagai **plain text cell**, jangan membuat objek formula/hyperlink dari input. Nilai dimulai `=`, `+`, `-`, `@` tetap string literal. Workbook dihitung server; tidak bergantung evaluator formula ExcelJS/Excel untuk total resmi. Untuk amount dengan >15 significant digits, tulis decimal text dan tandai kolom/sel “presisi penuh (teks)”; Summary totals juga decimal text jika tidak aman. Jangan diam-diam mengonversi NUMERIC(18,2) menjadi float yang kehilangan sen. Target data normal diekspor numeric dengan pemeriksaan roundtrip decimal-to-Excel yang diuji.

BR-X04: download GET authorized, no-store, content type xlsx, sanitized filename dengan event slug dan timestamp. Report limit dihitung sebelum render; jangan truncate diam-diam. UI menampilkan filter dan pesan progress/gagal; event tertutup tetap boleh export.

## 13. Fixture rekonsiliasi wajib

Fixture A: B=12595000; 41 ISSUED charges ×310000 →Q=12710000. Belum ada pembayaran: P=I=0, R=12710000, Cash=0, funding gap=0, projected surplus=115000. Total tagihan tidak boleh menambah cash.

Fixture B (terpisah): B=1000000, satu charge=310000; payment 100000+150000+60000; GENERAL received=500000; GENERAL pending=200000; expense PAID=400000; expense PENDING=100000. Hasil: P=310000, I=810000, E=400000, Cash=410000, remaining=600000, C=100000, projected remaining=500000, R=0, J=200000, projected income=1010000, funding gap=0. Reversal penuh payment 150000 →P=160000, I=660000, Cash=260000, R=150000; projected income tetap 1010000. Ini memperlihatkan reversal memindahkan kas ke receivable, bukan menciptakan pendapatan baru.

Fixture C: Original income 100000 pada 1 Nov; reversal 100000 pada 10 Nov. Report 10 Nov: opening=100000, income movement=−100000, closing=0. Original tetap muncul dalam periode 1 Nov; tidak dihapus akibat reversal kemudian. Gunakan fixture ini untuk memeriksa double subtraction dan batas waktu.
