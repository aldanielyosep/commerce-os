# PRD-120 Product SPU Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-120 |
| Module | Product SPU Foundation |
| Platform | Admin Web + API |
| Status | Draft |
| Version | 1.1 |
| Owner | Product + Engineering |
| Date | 2026-08-09 |
| Depends On | ARCH-000, PRD-110 |

---

## 1. Objective

Membangun fondasi Product pada level SPU sebagai single source of truth internal Commerce OS, siap dikembangkan ke Variant dan marketplace sync pada fase berikutnya.

---

## 2. Scope Boundary

### 2.1 In Scope (Phase Now)

- Product SPU CRUD
- Product image management (cover + gallery)
- Product description (short + rich text)
- Product metadata dasar
- Product lifecycle state
- Product code auto-generate immutable
- Slug auto-generate

### 2.2 Out of Scope (Next RFC)

- Variant / SKU
- Barcode variant-level
- Price dan stock
- Marketplace publish/sync
- Channel-specific description override

---

## 3. Product Identity Rules

- `id`: internal primary key.
- `product_code`: business identifier.
- `slug`: URL identifier.

Rules:

- Product code di-generate otomatis oleh system saat create.
- Product code tidak bisa di-override user.
- Product code immutable setelah tersimpan.
- Product code unik per company.
- Prefix dan panjang numeric configurable (settings; env sebagai fallback).

Contoh format default:

- `P0000001`
- `P0000002`
- `P0000003`

---

## 4. Product Description Rules

- Rich text diperbolehkan dan menjadi source utama konten deskripsi.
- Simpan dalam format terstruktur yang dapat dirender konsisten.
- Sediakan output plain text turunan untuk kebutuhan search/indexing.
- Channel-specific override belum masuk fase ini.

---

## 5. Product Image Rules

### 5.1 Ownership (Phase Now)

- Image menempel di Product (SPU).
- Wajib ada satu cover image sebelum aktivasi.
- Variant image ditunda ke RFC Variant.

### 5.2 Validation

- Extension yang diizinkan: `jpg`, `jpeg`, `png`, `webp`.
- Maksimal ukuran file per image: 5 MB (configurable).
- File invalid harus ditolak dengan error validasi jelas.

### 5.3 Ecommerce Friendly Size

- Rasio utama: 1:1.
- Resolusi rekomendasi: 1200x1200 px.
- Minimum: 1000x1000 px.

---

## 6. Lifecycle and Status

Status product menggunakan state workflow:

- `draft`
- `active`
- `inactive`
- `archived`

Transisi dilakukan via service layer agar side effect dapat dikontrol (audit/event).

---

## 7. Acceptance Criteria

- Admin dapat membuat product SPU dengan product code auto-generated.
- Create payload menyertakan `company_id` dan harus berada dalam scope akses user.
- Product code tidak dapat diedit saat create maupun update.
- Product code tetap sama meskipun nama/kategori berubah.
- Admin dapat upload cover dan gallery dengan validasi extension/size.
- Sistem menolak image yang tidak sesuai aturan.
- Product hanya bisa diaktifkan jika syarat minimal terpenuhi (termasuk cover image).
- Semua endpoint product patuh auth, pagination/search/order untuk list (sorting memakai `order_by` + `order_dir`), dan policy-based authorization.
- Akses resource product di luar scope company wajib menghasilkan `403 Forbidden`.

---

## 8. Product Hierarchy Sample Data (Reference)

Contoh berikut dipakai sebagai referensi minimum setup master hierarchy sebelum tim operasional membuat Product SPU.

| Department Code | Department Name | Category | Sub Category | Product Type |
|------|-------|-------|-------|-------|
| BAG | Bags | Travel | Backpack | Laptop Backpack |
| BAG | Bags | Travel | Backpack | Hiking Backpack |
| BAG | Bags | Travel | Duffel | Gym Duffel |
| BAG | Bags | Packaging | Paper Bag | Kraft Paper Bag |
| BAG | Bags | Packaging | Paper Bag | Luxury Gift Paper Bag |

### 8.1 Real Store Sample (Bungkusand Snapshot)

Contoh ini diambil dari observasi listing toko Bungkusand pada screenshot storefront agar tim operasional punya referensi naming yang lebih real.

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

- Product Type dipilih setelah Department, Category, dan Sub Category ditentukan.
- Contoh ini adalah baseline referensi. Tim dapat menambah node baru tanpa mengubah aturan hierarchy.
- Khusus tabel real store sample, nama dapat dipakai sebagai referensi awal lalu dinormalisasi sesuai standar master data internal.

---

## 9. Future Compatibility

- Struktur SPU harus kompatibel untuk penambahan Variant aggregate.
- Integrasi Open API marketplace nanti memerlukan mapping key `item_id` dan `model_id` di level variant.
- Desain fase ini tidak boleh mengunci implementasi variant-level image/barcode.
