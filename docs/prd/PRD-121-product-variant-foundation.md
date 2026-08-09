# PRD-121 Product Variant Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-121 |
| Module | Product Variant Foundation |
| Platform | Admin Web + API |
| Status | Draft |
| Version | 1.1 |
| Owner | Product + Engineering |
| Date | 2026-08-09 |
| Depends On | ARCH-000, PRD-120, PRD-110, RFC-120 |

---

## 1. Objective

Membangun fondasi Variant agar satu Product SPU dapat memiliki banyak kombinasi atribut jual (misalnya ukuran, warna, motif, type), dengan kepemilikan data komersial di level variant.

---

## 2. Scope Boundary

### 2.1 In Scope (Phase Now)

- Variant CRUD pada setiap Product SPU.
- Definisi atribut variant yang fleksibel (1 sampai N axis).
- Kombinasi atribut unik per product.
- Ownership data variant: SKU, barcode internal, harga, stock.
- Image fallback dari Product dengan opsi override di Variant.
- Mapping dasar varian ke channel listing key eksternal.

### 2.2 Out of Scope (Next RFC)

- Sinkronisasi penuh Open API marketplace (webhook orchestration, retry engine detail).
- Dynamic pricing engine lintas channel.
- Multi-warehouse advanced allocation.
- Bundling/kit composition lintas variant.

---

## 3. Product Hierarchy (Target)

Urutan hierarchy domain:

1. Company
2. Department
3. Category
4. Sub Category
5. Product Type
6. Product (SPU)
7. Variant Attributes (axis: ukuran/warna/motif/type, dll.)
8. Variant (kombinasi unik atribut)
9. Channel Mapping (item_id/model_id dan identifier channel lain)

### 3.1 Product Hierarchy Sample Data (Reference)

Contoh berikut dipakai sebagai referensi awal setup master hierarchy sebelum turun ke pembuatan Variant.

| Department Code | Department Name | Category | Sub Category | Product Type |
|------|-------|-------|-------|-------|
| BAG | Bags | Travel | Backpack | Laptop Backpack |
| BAG | Bags | Travel | Backpack | Hiking Backpack |
| BAG | Bags | Travel | Duffel | Gym Duffel |
| BAG | Bags | Packaging | Paper Bag | Kraft Paper Bag |
| BAG | Bags | Packaging | Paper Bag | Luxury Gift Paper Bag |

### 3.2 Real Store Sample (Bungkusand Snapshot)

Contoh ini diambil dari observasi listing toko Bungkusand pada screenshot storefront agar tim punya acuan realistis saat menurunkan Product Type ke desain axis variant.

| Department Code | Department Name | Category | Sub Category | Product Type | Product Name Example |
|------|-------|-------|-------|-------|-------|
| BAG | Bags | Packaging | Paper Bag | White Handle Paper Bag | PAPER BAG PUTIH LIST HITAM MODEL |
| BAG | Bags | Packaging | Drawstring Plastic Bag | Shopping Drawstring Plastic Bag | KANTONG PLASTIK SERUT SHOPPING BAG |
| BAG | Bags | Packaging | OPP Cookie Plastic | Cookie Wrap 7x7x3 cm | PLASTIK COOKIES 7x7x3CM |
| BAG | Bags | Packaging | Drawstring Plastic Bag | Goodie Bag Drawstring Plastic Bag | PLASTIK SERUT GOODIE BAG ULANG TAHUN |
| BAG | Bags | Packaging | Cupcake Box | Single Cupcake Box Window | BOX CUPCAKE SATUAN POLOS |
| BAG | Bags | Packaging | OPP Bread Plastic | OPP Bread Bag 15x18 cm | PLASTIK OPP ROTI 15X18CM |
| BAG | Bags | Packaging | Paper Box Souvenir | Dino Souvenir Paper Box | PAPER BOX BENTUK DINOSAURUS |
| BAG | Bags | Packaging | Candy Box | Birthday Candy Box | KOTAK PERMEN ULANG TAHUN |
| BAG | Bags | Packaging | Standing Pouch | Dry Food Standing Pouch | STANDING POUCH MAKANAN KERING |
| BAG | Bags | Packaging | Character Plastic Bag | Rabbit Bunny Plastic Bag | PLASTIK RABBIT BUNNY |

Catatan penggunaan:

- Product Type menjadi anchor sebelum admin menyusun axis variant untuk Product SPU tertentu.
- Jika master hierarchy belum lengkap, flow pembuatan variant harus ditunda sampai node hierarchy tersedia.
- Khusus tabel real store sample, jadikan sebagai data referensi awal lalu lakukan normalisasi naming untuk konsistensi antar product family.

---

## 4. Variant Data Ownership

### 4.1 Product SPU Owns

- Product identity (`product_code`, `product_name`, `slug`).
- Product description canonical.
- Product default images (cover + gallery).

### 4.2 Variant Owns

- Kombinasi atribut jual.
- `sku`.
- `barcode` internal.
- `price`.
- `stock`.
- Variant image override (opsional).
- Status variant.

### 4.3 Channel Mapping Owns

- External keys per channel (contoh Shopee `item_id` + `model_id`).
- Sync state metadata.

---

## 5. Variant Attribute Model

### 5.1 Flexible Axis

Variant harus mendukung axis dinamis sesuai product:

- `ukuran`
- `warna`
- `motif`
- `type`
- axis lain sesuai Product Type

Tidak boleh hardcode hanya `size` dan `color`.

### 5.2 Combination Uniqueness

- Kombinasi nilai atribut variant harus unik dalam satu Product.
- Jika kombinasi sudah ada, create/update ditolak dengan error validasi.

---

## 6. Image Strategy for Variant

- Default image tetap dari Product SPU.
- Variant dapat memiliki image override jika visual berbeda.
- Prioritas render:
  1. Variant cover image (jika ada)
  2. Product cover image (fallback)

Validasi image mengikuti baseline Product SPU (`jpg/jpeg/png/webp`, max 5 MB, rekomendasi 1:1).

---

## 7. Business Rules

- Satu Product dapat memiliki 0..N Variant.
- Satu Variant wajib terikat ke tepat satu Product.
- Variant tanpa atribut diperbolehkan hanya untuk produk single-option (dikontrol policy product type).
- SKU wajib unik per company.
- Barcode internal wajib unik per company.
- Harga dan stok operasional dibaca dari Variant, bukan Product SPU.

---

## 8. Marketplace Alignment (Business Perspective)

- Untuk listing marketplace yang menampilkan 1 produk dengan banyak opsi, internal tetap memetakan order ke Variant.
- Kunci mapping transaksi channel diarahkan ke level variant agar penjualan per ukuran/motif/warna bisa terbaca akurat.

---

## 9. Sample Data (Shop Pattern)

### 9.1 Case A: Single Axis (Ukuran)

Product SPU: `Paper Bag Putih List Hitam`

Variants:

- `S 28x10x20`
- `M 32x25x11`
- `L 35x26x13`
- `XL 43x32x14`

### 9.2 Case B: Single Axis (Warna)

Product SPU: `Box Cupcake Satuan`

Variants:

- `White`
- `Pink`
- `Purple`
- `Gold`
- `Peach`

### 9.3 Case C: Multi Axis (Motif + Ukuran)

Product SPU: `Standing Pouch Karakter`

Variants:

- `Singa x 19x20`
- `Singa x 22x30`
- `Gajah x 19x20`
- `Gajah x 22x30`

---

## 10. Acceptance Criteria

- Admin dapat mendefinisikan axis variant per product.
- Admin dapat membuat kombinasi variant unik tanpa duplikasi.
- Sistem menolak kombinasi atribut yang duplikat.
- SKU/barcode/harga/stock dapat dikelola per variant.
- Product image fallback dan variant image override berjalan sesuai prioritas.
- Struktur data mendukung mapping external key channel di level variant.

---

## 11. Future Compatibility

- Siap untuk RFC marketplace sync penuh (webhook/pull) dengan idempotency di level order line.
- Siap untuk inventory module lanjutan (multi-warehouse).
- Siap untuk dynamic channel pricing tanpa mengubah fondasi ownership variant.
