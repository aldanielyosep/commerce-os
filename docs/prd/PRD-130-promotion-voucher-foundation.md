# PRD-130 Promotion and Voucher Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-130 |
| Module | Promotion and Voucher Foundation |
| Platform | Admin Web + API |
| Status | Draft |
| Version | 1.0 |
| Owner | Product + Engineering |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-121, RFC-121 |

---

## 1. Objective

Membangun fondasi campaign penurunan harga dengan dua mode:

- Promotion (auto-apply, tanpa code)
- Voucher (code-based)

Keduanya berbagi tipe diskon yang sama: `percent`, `amount`, `special_price`.

---

## 2. Scope Boundary

### 2.1 In Scope

- Campaign discount berbasis Promotion dan Voucher.
- Tipe diskon: `percent`, `amount`, `special_price`.
- Eligibility rule baseline (company scope, product/category target, min purchase).
- Effective period (`effective_from`, `effective_to`).
- Optional quota untuk Promotion dan Voucher (limited/unlimited).
- Voucher code default auto-generated dengan opsi manual override.
- Redemption tracking dasar untuk Voucher.

### 2.2 Out of Scope

- Loyalty points engine.
- Gamification campaign.
- Multi-currency pricing strategy.
- Full experimentation platform (A/B testing campaign).

---

## 3. Business Model

### 3.1 Promotion

- Tidak perlu input code dari customer.
- Trigger berbasis rule otomatis.
- Cocok untuk campaign publik (contoh: diskon weekend).

### 3.2 Voucher

- Perlu input code voucher.
- Code default di-generate system.
- Admin boleh override code manual (contoh: `bungkusandHBD`) saat create/update.
- Cocok untuk campaign tertarget (member event, influencer, affiliate).

---

## 4. Discount Type Requirements

- `percent`: potongan berbasis persentase.
- `amount`: potongan nominal tetap.
- `special_price`: harga final fixed untuk item yang memenuhi syarat.

Guardrail baseline:

- Final harga tidak boleh negatif.
- Nilai discount harus valid terhadap harga dasar variant.

---

## 5. Quota Requirements

Keduanya (Promotion dan Voucher) mendukung:

- `unlimited` (tanpa batas kuota)
- `limited` (dengan `total_quota`)

Rule tambahan:

- Opsional `per_user_limit` untuk mencegah abuse.
- Quota consume harus atomic untuk menghindari race condition.

---

## 6. Eligibility Requirements

Rule minimum yang didukung:

- company scope
- status campaign active
- window waktu valid
- target product/category (opsional)
- min purchase (opsional)

---

## 7. Data Ownership and Pricing Boundary

- Harga dasar (`price`) tetap dimiliki Variant.
- Promotion/Voucher hanya layer adjustment saat preview/apply.
- Source of truth price/stock tidak berpindah dari domain Variant.

---

## 8. Acceptance Criteria

1. Admin dapat membuat Promotion dengan discount type `percent|amount|special_price`.
2. Admin dapat membuat Voucher dengan code auto-generated.
3. Admin dapat override voucher code manual jika diperlukan.
4. Quota Promotion dapat diset limited/unlimited.
5. Quota Voucher dapat diset limited/unlimited.
6. System mencegah penggunaan code voucher duplikat per company.
7. Perhitungan harga final konsisten dan tidak menghasilkan harga negatif.

---

## 9. Related Documents

- ARCH-000 Foundation Architecture
- PRD-121 Product Variant Foundation
- RFC-121 Product Variant and SKU Aggregate
- RFC-130 Promotion and Voucher Engine
- TDD-130 Promotion and Voucher API Contract
