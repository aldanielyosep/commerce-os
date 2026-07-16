# PRD-120 Product SPU Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-120 |
| Module | Product SPU Foundation |
| Platform | Admin Web + API |
| Status | Draft |
| Version | 1.0 |
| Owner | Product + Engineering |
| Date | 2026-07-16 |
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
- Product code tidak dapat diedit saat create maupun update.
- Product code tetap sama meskipun nama/kategori berubah.
- Admin dapat upload cover dan gallery dengan validasi extension/size.
- Sistem menolak image yang tidak sesuai aturan.
- Product hanya bisa diaktifkan jika syarat minimal terpenuhi (termasuk cover image).
- Semua endpoint product patuh auth, pagination/search/order untuk list, dan policy-based authorization.

---

## 8. Future Compatibility

- Struktur SPU harus kompatibel untuk penambahan Variant aggregate.
- Integrasi Open API marketplace nanti memerlukan mapping key `item_id` dan `model_id` di level variant.
- Desain fase ini tidak boleh mengunci implementasi variant-level image/barcode.
