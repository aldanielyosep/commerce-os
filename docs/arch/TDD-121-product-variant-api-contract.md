# TDD-121 Product Variant API Contract

## Document Information

| Item | Value |
|------|-------|
| Document | TDD-121 |
| Title | Product Variant API Contract |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-121, RFC-121, RFC-111 |

---

## 1. Purpose

Mendefinisikan kontrak API Variant agar API dan admin-web sinkron untuk use case katalog multi-attribute.

---

## 2. Global Contract Rules

- Semua endpoint wajib auth (JWT).
- Semua endpoint list wajib pagination, search, ordering jika relevan.
- Semua mutasi variant wajib policy-based authorization by company scope.
- Kombinasi atribut variant wajib unik per product.
- SKU dan barcode wajib unik per company.

### 2.1 Cross-Reference

- Detail strategi domain variant mengikuti RFC-121.
- Detail policy scope mengacu RFC-111.
- Detail campaign discount mengacu RFC-130/TDD-130.

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

## 4. Variant Endpoints

### 4.1 Variant CRUD

- `GET /api/v1/products/:product_id/variants`
- `GET /api/v1/products/:product_id/variants/:id`
- `POST /api/v1/products/:product_id/variants`
- `PATCH /api/v1/products/:product_id/variants/:id`
- `DELETE /api/v1/products/:product_id/variants/:id`

List query params:

- `page` (default 1)
- `per_page` (default 20)
- `q` (sku/barcode/option value)
- `status`
- `order_by` (`created_at`, `sku`, `status`)
- `order` (`asc`/`desc`)

### 4.2 Variant Commercial Data

- `PATCH /api/v1/products/:product_id/variants/:id/price`
- `PATCH /api/v1/products/:product_id/variants/:id/stock`
- `GET /api/v1/products/:product_id/variants/:id/price_histories`
- `GET /api/v1/products/:product_id/variants/:id/stock_ledger`

### 4.3 Variant Images

- `GET /api/v1/products/:product_id/variants/:id/images`
- `POST /api/v1/products/:product_id/variants/:id/images`
- `PATCH /api/v1/products/:product_id/variants/:id/images/:image_id`
- `DELETE /api/v1/products/:product_id/variants/:id/images/:image_id`

---

## 5. Payload Contract

### 5.1 Variant Create Payload

```json
{
  "variant": {
    "sku": "SP-SINGA-1920",
    "barcode": "8991234567001",
    "status": "active",
    "price": 950,
    "stock": 500,
    "attributes": [
      { "name": "motif", "value": "Singa" },
      { "name": "ukuran", "value": "19x20" }
    ]
  }
}
```

Catatan:

- `price` pada create menjadi `current_price` awal variant.
- `stock` pada create menjadi `current_stock` awal variant.

### 5.2 Variant Update Payload

```json
{
  "variant": {
    "status": "inactive",
    "attributes": [
      { "name": "motif", "value": "Singa" },
      { "name": "ukuran", "value": "22x30" }
    ]
  }
}
```

Catatan:

- Perubahan harga disarankan melalui endpoint `PATCH .../price` agar history tercatat konsisten.
- Perubahan stok disarankan melalui endpoint `PATCH .../stock` agar ledger event tercatat.

### 5.3 Price Update Payload

```json
{
  "price": {
    "value": 1200,
    "effective_from": "2026-07-20T00:00:00Z",
    "reason": "promo period adjustment"
  }
}
```

### 5.4 Stock Update Payload

```json
{
  "stock": {
    "delta": -150,
    "event_type": "adjustment_out",
    "reason": "manual stock correction"
  }
}
```

---

## 6. Validation Rules

### 6.1 Variant

- Variant wajib terikat ke satu product.
- `attributes` minimal 1 untuk product multi-axis.
- Kombinasi `attributes` harus unik per product.

### 6.2 SKU and Barcode

- `sku` unik per company.
- `barcode` unik per company.
- Format sku/barcode mengikuti kebijakan validasi domain.

### 6.3 Price and Stock

- `price` >= 0.
- `stock` >= 0.

### 6.4 Price History

- `effective_from` wajib ada pada perubahan harga.
- Hanya boleh satu harga aktif per variant pada satu waktu.
- Effective window antar price history tidak boleh overlap.

### 6.5 Stock Ledger

- `event_type` wajib enum valid.
- `delta` tidak boleh 0.
- Update stok wajib menghasilkan satu ledger event immutable.
- `current_stock` setelah apply event tidak boleh negatif.

### 6.6 Variant Images

- Allowed extension: `jpg`, `jpeg`, `png`, `webp`.
- Max file size: 5 MB.
- Recommended dimension: 1200x1200 px.

---

## 7. Validation Error Examples

Duplicate attribute combination:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["variant combination already exists for this product"]
}
```

Duplicate SKU:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["sku has already been taken"]
}
```

Duplicate barcode:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["barcode has already been taken"]
}
```

---

## 8. Authorization Contract

- Semua endpoint variant wajib policy-based authorization.
- Scope akses dibatasi ke company yang diizinkan.
- Akses out-of-scope wajib `403`.

---

## 9. Error Semantics

- `401 Unauthorized`: token invalid/tidak ada.
- `403 Forbidden`: tidak punya scope akses.
- `404 Not Found`: resource tidak ditemukan/di luar scope.
- `422 Unprocessable Entity`: validation errors.

---

## 10. Testing and Quality Gates

### 10.1 Request Specs

- CRUD variant.
- Update price/stock.
- Price history retrieval.
- Stock ledger retrieval.
- Variant image upload/update/delete.
- Search/pagination/ordering.
- Duplicate combination ditolak.
- Duplicate sku/barcode ditolak.
- Price history overlap ditolak.
- Concurrent stock update tidak menghasilkan stok negatif.

### 10.2 Policy Specs

- Access allow/deny per role dan company scope.

### 10.3 Quality Gates

- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
