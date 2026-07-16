# TDD-130 Promotion and Voucher API Contract

## Document Information

| Item | Value |
|------|-------|
| Document | TDD-130 |
| Title | Promotion and Voucher API Contract |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-130, RFC-130, RFC-121, RFC-111 |

---

## 1. Purpose

Mendefinisikan kontrak API Promotion dan Voucher agar admin-web dan API sinkron pada skenario campaign penurunan harga.

---

## 2. Global Contract Rules

- Semua endpoint wajib auth (JWT).
- Endpoint management campaign wajib `super_admin`.
- Endpoint runtime checkout (`discounts/preview`, `vouchers/redeem`) mengikuti auth domain caller (admin/storefront) sesuai konteks transaksi.
- List endpoint wajib pagination, search, ordering bila relevan.
- Kalkulasi diskon memakai type `percent|amount|special_price`.
- Base price mengacu ke active price variant.

### 2.1 Cross-Reference

- Strategi domain campaign mengikuti RFC-130.
- Boundary price ownership mengacu RFC-121 dan TDD-121.

---

## 3. Response Envelope Baseline

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["field is required"]
}
```

---

## 4. Endpoints

### 4.1 Promotion

- `GET /api/v1/promotions`
- `GET /api/v1/promotions/:id`
- `POST /api/v1/promotions`
- `PATCH /api/v1/promotions/:id`
- `DELETE /api/v1/promotions/:id`

### 4.2 Voucher

- `GET /api/v1/vouchers`
- `GET /api/v1/vouchers/:id`
- `POST /api/v1/vouchers`
- `PATCH /api/v1/vouchers/:id`
- `DELETE /api/v1/vouchers/:id`

### 4.3 Validate and Redeem

- `POST /api/v1/discounts/preview`
- `POST /api/v1/vouchers/redeem`

### 4.4 Access Contract per Endpoint Group

- Management endpoints (`/promotions`, `/vouchers`):
  - `super_admin`: allow
  - role selain `super_admin`: deny (`403`)
- Runtime endpoints (`/discounts/preview`, `/vouchers/redeem`):
  - admin internal dan storefront auth domain boleh akses sesuai policy transaksi
  - endpoint runtime tidak memberi hak management campaign

---

## 5. Payload Contract

### 5.1 Promotion Create Payload

```json
{
  "promotion": {
    "name": "Promo Weekend",
    "status": "active",
    "discount_type": "percent",
    "discount_value": 10,
    "max_discount_amount": 15000,
    "min_purchase_amount": 50000,
    "effective_from": "2026-07-20T00:00:00Z",
    "effective_to": "2026-07-31T23:59:59Z",
    "quota_mode": "limited",
    "total_quota": 1000,
    "per_user_limit": 1
  }
}
```

### 5.2 Voucher Create Payload

`code` bersifat optional:

- jika tidak dikirim/empty -> system generate code unik
- jika dikirim -> dipakai sebagai manual override

```json
{
  "voucher": {
    "name": "Ulang Tahun Member",
    "code": "bungkusandHBD",
    "status": "active",
    "discount_type": "amount",
    "discount_value": 20000,
    "min_purchase_amount": 100000,
    "effective_from": "2026-07-20T00:00:00Z",
    "effective_to": "2026-08-20T23:59:59Z",
    "quota_mode": "unlimited"
  }
}
```

### 5.3 Discount Preview Payload

```json
{
  "request": {
    "variant_id": 1201,
    "qty": 2,
    "base_price": 95000,
    "voucher_code": "bungkusandHBD"
  }
}
```

Preview response minimum:

```json
{
  "success": true,
  "data": {
    "base_subtotal": 190000,
    "discount_amount": 20000,
    "final_subtotal": 170000,
    "applied_source": "voucher",
    "applied_discount_type": "amount"
  },
  "meta": {}
}
```

### 5.4 Voucher Redeem Payload

```json
{
  "request": {
    "voucher_code": "bungkusandHBD",
    "customer_id": 501,
    "order_reference": "SO-20260716-001"
  }
}
```

---

## 6. Validation Rules

### 6.1 Discount Rule

- `discount_type` wajib enum `percent|amount|special_price`.
- `discount_value` > 0.
- jika `discount_type=percent`, nilai maksimal 100.
- jika `discount_type=special_price`, nilai harus <= base price variant saat apply.

### 6.2 Voucher Code

- `code` unik per company.
- `code` optional pada create/update.
- Jika `code` tidak diisi, system wajib generate code unik.
- Jika `code` diisi, simpan sebagai manual override.

### 6.3 Quota

- `quota_mode` wajib `limited|unlimited`.
- jika `quota_mode=limited`, `total_quota` wajib > 0.
- `per_user_limit` jika diisi wajib > 0.

### 6.4 Effective Period

- `effective_from` wajib <= `effective_to`.

---

## 7. Error Semantics

- `401 Unauthorized`: token invalid/tidak ada.
- `403 Forbidden`: tidak punya scope akses.
- `404 Not Found`: resource tidak ditemukan/di luar scope.
- `422 Unprocessable Entity`: validation errors.

Domain errors:

- `invalid_code`
- `duplicate_code`
- `expired`
- `quota_exhausted`
- `not_eligible`
- `already_redeemed`

Access errors:

- `forbidden_sensitive_module`

Example duplicate code:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["code has already been taken"],
  "error_code": "duplicate_code"
}
```

---

## 8. Testing and Quality Gates

### 8.1 Request Specs

- CRUD promotion.
- CRUD voucher.
- Voucher create with auto-generated code.
- Voucher create with manual override code.
- Discount preview success and failure scenarios.
- Voucher redeem with quota consume.

### 8.2 Concurrency Specs

- Quota consume harus aman pada request paralel.
- Tidak boleh ada negative remaining quota.

### 8.3 Policy Specs

- Management campaign allow untuk `super_admin`.
- Management campaign deny untuk `admin_company` dan `admin_storefront_ops`.
- Runtime checkout endpoint tetap berjalan untuk caller valid di auth domain masing-masing.

### 8.4 Quality Gates

- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
