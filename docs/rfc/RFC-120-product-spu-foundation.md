# RFC-120 Product SPU Foundation

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-120 |
| Module | Product SPU Foundation |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-120, PRD-110, RFC-111 |

---

## 1. Summary

RFC ini mendefinisikan implementasi teknis Product pada level SPU sebagai source of truth internal. Domain Variant/SKU dan marketplace publish tetap di fase lanjutan.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-120 Product SPU Foundation
- PRD-110 Companies Foundation
- RFC-111 Company-Scoped Authorization
- TDD-120 Product SPU API Contract
- PRD-121 Product Variant Foundation
- RFC-121 Product Variant and SKU Aggregate
- TDD-121 Product Variant API Contract

---

## 2. Design Principles

### 2.1 SPU First

- Product pada fase ini adalah SPU.
- Semua data penjualan detail varian ditunda ke RFC Variant.

### 2.2 Single Source of Truth

- Product SPU menjadi sumber utama data produk internal.
- Marketplace tidak boleh menjadi sumber data master.

### 2.3 Safe Identity

- Product code auto-generated, immutable, dan unik per company.
- User tidak diberi opsi override pada fase ini.

---

## 3. Product Code Strategy

### 3.1 Generation

- Product code dibuat saat create melalui service generator berbasis sequence.
- Sequence disimpan per company untuk menghindari collision lintas tenant.

### 3.2 Format

- Format default: `<prefix><zero-padded-number>`.
- Default awal: `P` + 7 digit (`P0000001`).
- Prefix dan panjang angka configurable melalui settings (env fallback).

### 3.3 Immutability

- Product code tidak bisa diubah setelah create berhasil.
- Update product harus menolak perubahan product code.

---

## 4. Description Strategy

- Admin-web menggunakan WYSIWYG editor untuk input description.
- Payload dari WYSIWYG disimpan sebagai `description_richtext` (structured JSON) dan menjadi canonical source.
- Sistem menghasilkan turunan `description_html` yang sudah disanitasi untuk rendering.
- Sistem menghasilkan turunan `description_text` untuk kebutuhan indexing/search.
- Sanitasi wajib memakai allowlist tag aman (`p`, `br`, `ul`, `ol`, `li`, `strong`, `em`, `a`).
- Tag/atribut berbahaya (`script`, `style`, inline event handler) wajib diblokir.
- Channel override description belum diaktifkan pada fase ini.

---

## 5. Image Strategy

### 5.1 Ownership

- Pada fase ini, image dimiliki Product (SPU).
- Satu product memiliki cover image dan gallery.
- Variant image akan ditambahkan pada RFC Variant.

### 5.2 Validation Baseline

- Extension: `jpg`, `jpeg`, `png`, `webp`.
- Max size: 5 MB per file (configurable).
- Invalid extension/size wajib `422` dengan pesan field-level.

### 5.3 Dimension Baseline

- Aspect ratio utama: 1:1.
- Recommended: 1200x1200 px.
- Minimum: 1000x1000 px.

### 5.4 Delivery

- Simpan original file.
- Generate turunan web-optimized.
- Tidak melakukan crop destruktif otomatis tanpa kontrol user.

---

## 6. State and Lifecycle

Product menggunakan state workflow:

- `draft`
- `active`
- `inactive`
- `archived`

Perubahan state melalui service object, bukan direct event call di controller.

---

## 7. Security and Access

- Semua endpoint wajib auth.
- Authorization policy-based mengikuti baseline RFC-111 (scoped access per company).
- Audit trail untuk create/update/archive/restore.

---

## 8. API Baseline

- Endpoint list wajib mendukung pagination/search/ordering.
- Response envelope mengikuti standard API envelope lintas domain.
- Soft delete untuk archive/restore behavior.

---

## 9. Future Compatibility

- Open API marketplace sync akan memakai key eksternal per channel di level variant (`item_id` + `model_id`).
- RFC ini menjaga SPU tetap netral dan tidak mengunci desain mapping variant.

---

## 10. Rollout Plan

1. Implement model + migration Product SPU.
2. Implement product code generator service + sequence storage.
3. Implement API CRUD + lifecycle + image upload.
4. Implement admin-web form sesuai contract.
5. Implement modul Variant sesuai PRD-121/RFC-121/TDD-121.
6. Lengkapi test, lint, security gates sebelum release.
