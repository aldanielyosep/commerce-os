# RFC-122 Marketplace Data Ingestion (Pre-API Mode)

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-122 |
| Module | Marketplace Data Ingestion |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-121, RFC-120, RFC-121 |

---

## 1. Summary

RFC ini mendefinisikan strategi ingestion data marketplace sebelum akses Open API disetujui. Data masuk melalui CSV/manual import namun tetap memakai model internal yang API-ready.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-121 Product Variant Foundation
- RFC-120 Product SPU Foundation
- RFC-121 Product Variant and SKU Aggregate
- TDD-122 Marketplace Ingestion Contract

---

## 2. Problem Statement

Open API marketplace masih under review sehingga sync realtime belum tersedia. Operasional tetap harus berjalan untuk:

- membaca penjualan per variant
- menjaga data order line konsisten
- menyiapkan migrasi mulus ke mode Open API

---

## 3. Design Principles

### 3.1 Integration-Ready, Not Integration-Dependent

- Sistem tetap operasional tanpa Open API.
- Struktur data tetap menyiapkan key eksternal channel.

### 3.2 Variant-Centric Mapping

- Ingestion transaksi harus dipetakan ke variant internal.
- SPU hanya context master, bukan unit transaksi final.

### 3.3 Idempotent Import

- Import ulang file yang sama tidak boleh menduplikasi data.
- Setiap row transaksi punya dedup key yang konsisten.

---

## 4. Source and Modes

### 4.1 Current Mode

- `source_type = csv`
- `source_type = manual`

### 4.2 Future Mode

- `source_type = api`

Mode API akan memakai flow yang sama dari layer normalisasi ke downstream domain.

---

## 5. Canonical Ingestion Model

Setiap record normalisasi minimal memuat:

- `channel` (shopee/tokopedia/dll)
- `shop_identifier`
- `external_order_id`
- `external_order_line_id`
- `external_item_id` (nullable)
- `external_model_id` (nullable)
- `variant_id` (nullable sebelum mapping selesai)
- `qty`
- `gross_amount`
- `source_type`
- `import_batch_id`

---

## 6. Mapping Strategy

### 6.1 Primary Matching

- Gunakan `external_item_id + external_model_id` bila tersedia.

### 6.2 Fallback Matching

- Jika external key tidak lengkap, gunakan strategi fallback berbasis SKU/option label yang dinormalisasi.

### 6.3 Unmapped Queue

- Row yang gagal mapping masuk antrean `unmapped_variant`.
- Admin menyelesaikan mapping manual via admin-web.

---

## 7. Idempotency and Dedup

Dedup key rekomendasi:

- `channel + shop_identifier + external_order_id + external_order_line_id`

Aturan:

- Insert jika dedup key belum ada.
- Update jika dedup key sudah ada dan payload baru lebih mutakhir.

---

## 8. Validation and Data Quality

- File wajib lolos schema validation sebelum normalisasi.
- Row invalid dipisah sebagai failed rows, tidak menghentikan semua batch.
- Error report per row wajib tersedia untuk perbaikan cepat.

---

## 9. Security and Audit

- Import endpoint wajib auth + authorization.
- Semua batch import dicatat actor, timestamp, source, dan ringkasan hasil.
- Perubahan mapping manual harus menyimpan audit trail.

---

## 10. Rollout Plan

1. Implement upload + parser CSV.
2. Implement normalizer ke canonical ingestion model.
3. Implement mapper ke variant + unmapped queue.
4. Implement idempotent upsert dengan dedup key.
5. Tambahkan dashboard import result dan failed rows.
6. Migrasi ke source_type `api` setelah Open API approved.
