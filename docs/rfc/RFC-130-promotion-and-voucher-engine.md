# RFC-130 Promotion and Voucher Engine

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-130 |
| Module | Promotion and Voucher Engine |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-130, RFC-121, RFC-111 |

---

## 1. Summary

RFC ini mendefinisikan arsitektur hybrid campaign:

- Promotion dan Voucher tetap entitas bisnis terpisah.
- Keduanya memakai shared discount calculation engine.

Pendekatan ini menjaga objective yang sama (menurunkan harga) tanpa mencampur trigger/lifecycle yang berbeda.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-130 Promotion and Voucher Foundation
- RFC-121 Product Variant and SKU Aggregate
- RFC-111 Company-Scoped Authorization
- TDD-130 Promotion and Voucher API Contract
- TDD-121 Product Variant API Contract

---

## 2. Design Principles

### 2.1 Separation of Trigger, Unification of Calculation

- Promotion: rule-driven auto apply.
- Voucher: code-driven apply/redeem.
- Kalkulasi discount disatukan agar konsisten lintas campaign.

### 2.2 Variant Price as Base Price

- Base price selalu dari variant active price.
- Engine hanya menghitung adjustment, tidak mengubah source of truth harga variant.

### 2.3 Deterministic and Auditable

- Setiap apply/redeem menghasilkan jejak rule yang terpakai.
- Quota consume dan redeem harus atomic.

### 2.4 Sensitive Access Segregation

- Modul campaign management (`promotion`, `voucher`) adalah modul sensitif.
- Create/update/delete campaign hanya untuk `super_admin`.
- Role operasional non-C-level tidak boleh mengakses menu dan endpoint management campaign.

---

## 3. Aggregate Structure

1. Discount Rule
2. Promotion
3. Voucher
4. Voucher Redemption
5. Campaign Usage Ledger

### 3.1 Discount Rule

Field inti:

- `discount_type` (`percent|amount|special_price`)
- `discount_value`
- `max_discount_amount` (opsional, khusus `percent`)
- `min_purchase_amount` (opsional)
- `effective_from`, `effective_to`

### 3.2 Promotion

Field inti:

- `name`, `status`
- relasi ke `discount_rule`
- target scope (product/category)
- quota mode (`limited|unlimited`)

### 3.3 Voucher

Field inti:

- `name`, `status`
- `code` (unik per company)
- `code_source` (`system_generated|manual_override`)
- relasi ke `discount_rule`
- quota mode (`limited|unlimited`)

---

## 4. Voucher Code Strategy

### 4.1 Default Generation

- Jika request tidak menyertakan code, system generate code unik.

### 4.2 Manual Override

- Admin boleh mengirim code manual saat create/update.
- Contoh valid business usage: `bungkusandHBD`.
- Code tetap wajib unik dalam scope company.

### 4.3 Normalization

- Code dinormalisasi di boundary API sebelum validasi uniqueness.
- Simpan metadata source agar audit jelas.

---

## 5. Quota and Consume Semantics

- `unlimited`: tidak ada batas total penggunaan.
- `limited`: wajib `total_quota` > 0.
- Opsional `per_user_limit` > 0.

Aturan consume:

- Counter usage di-update dalam transaksi atomic.
- Jika kuota habis pada saat consume, request ditolak.

---

## 6. Eligibility and Validation

Eligibility baseline:

- campaign status aktif
- within effective window
- company scope valid
- target product/category match (jika dikonfigurasi)
- min purchase terpenuhi (jika dikonfigurasi)

### 6.1 Access Boundary

- Admin-web internal:
	- campaign management (`promotions`, `vouchers`) => `super_admin` only
- Storefront/customer domain:
	- hanya memakai hasil evaluasi campaign saat checkout
	- tidak boleh mengakses endpoint management campaign

### 6.2 Order Operations Boundary

- Pada fase storefront awal, order management tetap dikelola di API yang sama.
- Operasional order dapat diakses role non-super-admin sesuai scope.
- Akses order tidak otomatis memberi akses ke `promotion`/`voucher` management.

---

## 7. Error Semantics Baseline

- `invalid_code`
- `duplicate_code`
- `expired`
- `quota_exhausted`
- `not_eligible`
- `already_redeemed`

---

## 8. Rollout Plan

1. Implement model Discount Rule + Promotion + Voucher.
2. Implement code generation dan manual override flow.
3. Implement quota consume atomic dan usage ledger.
4. Implement validate/apply/redeem API.
5. Implement policy `super_admin only` untuk campaign management.
6. Lengkapi request spec, policy spec, dan quality gates.
