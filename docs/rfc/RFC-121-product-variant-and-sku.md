# RFC-121 Product Variant and SKU Aggregate

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-121 |
| Module | Product Variant and SKU |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-121, RFC-120, RFC-111 |

---

## 1. Summary

RFC ini mendefinisikan implementasi teknis Variant sebagai turunan Product SPU agar data komersial operasional dikelola presisi per kombinasi atribut jual.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-121 Product Variant Foundation
- RFC-120 Product SPU Foundation
- RFC-111 Company-Scoped Authorization
- TDD-121 Product Variant API Contract
- RFC-122 Marketplace Data Ingestion (Pre-API Mode)
- TDD-122 Marketplace Ingestion Contract
- RFC-130 Promotion and Voucher Engine
- TDD-130 Promotion and Voucher API Contract

---

## 2. Design Principles

### 2.1 Variant as Commercial Unit

- Product SPU menyimpan data master produk.
- Variant menyimpan data komersial operasional (sku, barcode, price, stock).

### 2.2 Flexible Attribute Axis

- Variant mendukung 1..N axis atribut.
- Tidak hardcode ke pair size-color saja.

### 2.3 Deterministic Combination

- Satu kombinasi atribut hanya boleh ada sekali dalam satu product.
- Uniqueness kombinasi wajib ditegakkan di service + database.

---

## 3. Aggregate Structure

Hierarchy implementasi:

1. Product (SPU)
2. Variant Dimension (misal: ukuran, warna, motif, type)
3. Variant Option Value (misal: 19x20, Singa, White)
4. Variant (kombinasi option value)
5. Variant Image (opsional override)
6. Variant Commercial Data (sku, barcode, price, stock)

---

## 4. Data Ownership

### 4.1 Product Owns

- `product_code`, `product_name`, `slug`
- description canonical
- default images

### 4.2 Variant Owns

- kombinasi atribut
- `sku`
- `barcode` internal
- `status_variant`
- `price`
- `stock`
- image override opsional

### 4.3 Channel Mapping Owns

- external identifier per channel (`item_id`, `model_id`, dll.)
- sync metadata

---

## 5. SKU and Barcode Strategy

### 5.1 SKU

- SKU wajib unik per company.
- SKU bisa auto-generate dari pattern yang dikonfigurasi, dengan opsi manual override terbatas policy.
- SKU immutable setelah dipakai transaksi pertama.

### 5.2 Barcode Internal

- Barcode internal wajib unik per company.
- Pada fase awal, barcode default dapat auto-generate by system.
- Manual barcode diperbolehkan jika memenuhi validasi uniqueness.

---

## 6. Price and Stock Ownership

- Price berada di level variant.
- Stock berada di level variant.
- Product SPU tidak menyimpan price/stock operasional.

### 6.1 Price History Model

- Variant menyimpan `current_price` sebagai snapshot harga aktif.
- Perubahan harga dicatat ke `variant_price_histories` dengan:
	- `effective_from`
	- `effective_to` (nullable untuk active row)
	- `price`
	- `changed_by`
- Dalam satu waktu, hanya boleh ada satu baris harga aktif per variant.
- Effective period antar row tidak boleh overlap.

### 6.2 Stock Ledger Model

- Variant menyimpan `current_stock` sebagai snapshot stok aktif.
- Perubahan stok dicatat sebagai event immutable di `variant_stock_ledger`.
- Event minimum:
	- `adjustment_in`
	- `adjustment_out`
	- `sale_deduction`
	- `return_in`
- Snapshot `current_stock` harus konsisten dengan akumulasi ledger.

Future extension:

- multi-warehouse stock ledger
- channel price override

---

## 7. Variant Image Strategy

- Product image tetap menjadi fallback.
- Variant image override dipakai untuk visual spesifik varian.

Prioritas render:

1. variant cover image
2. product cover image

Validasi image mengikuti baseline RFC-120.

---

## 8. Authorization and Access

- Semua endpoint variant wajib auth.
- Access dibatasi policy per company scope.
- Operasi cross-company wajib ditolak (`403`).

---

## 9. Marketplace Compatibility

- Satu listing channel dapat memetakan banyak variant.
- Mapping transaksi order line harus menuju variant.
- Untuk channel seperti Shopee, key mapping utama di variant adalah `item_id + model_id`.
- Selama Open API masih review, ingestion awal mengikuti RFC-122 (CSV/manual pre-API mode).

---

## 10. Rollout Plan

1. Tambahkan model/tabel variant dan relasi ke product.
2. Implement uniqueness combinator dan validasi sku/barcode.
3. Implement API CRUD variant + price + stock + image override.
4. Implement admin-web variant matrix editor.
5. Lengkapi test, lint, security gates sebelum release.
