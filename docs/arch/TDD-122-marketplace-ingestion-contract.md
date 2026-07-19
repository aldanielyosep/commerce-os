# TDD-122 Marketplace Ingestion Contract (Pre-API)

## Document Information

| Item | Value |
|------|-------|
| Document | TDD-122 |
| Title | Marketplace Ingestion Contract |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, RFC-122, RFC-121 |

---

## 1. Purpose

Mendefinisikan kontrak teknis ingestion data marketplace dalam mode CSV/manual sebelum Open API aktif.

---

## 2. Global Contract Rules

- Endpoint ingestion wajib auth (JWT).
- Endpoint ingestion wajib policy-based authorization by company scope.
- Import processing harus idempotent berdasarkan dedup key.
- Row invalid tidak memblok seluruh batch.

---

## 3. Endpoints

### 3.1 Import Batch

- `POST /api/v1/marketplace_ingestions`
- `GET /api/v1/marketplace_ingestions`
- `GET /api/v1/marketplace_ingestions/:id`
- `GET /api/v1/marketplace_ingestions/:id/errors`

### 3.2 Mapping Resolution

- `POST /api/v1/marketplace_ingestions/:id/resolve_unmapped`

---

## 4. Upload Payload Contract

Multipart form data:

- `channel` (required)
- `shop_identifier` (required)
- `source_type` (required: `csv` or `manual`)
- `file` (required for csv)
- `notes` (optional)

Success response:

```json
{
  "success": true,
  "data": {
    "id": 301,
    "status": "processing"
  }
}
```

---

## 5. Normalized Row Contract

Setelah parse, row canonical minimal:

```json
{
  "channel": "shopee",
  "shop_identifier": "bungkusand",
  "external_order_id": "230716ABC123",
  "external_order_line_id": "230716ABC123-1",
  "external_item_id": "17382920123",
  "external_model_id": "28400192311",
  "variant_id": null,
  "qty": 2,
  "gross_amount": 31000,
  "source_type": "csv",
  "import_batch_id": 301
}
```

---

## 6. Mapping and Dedup Rules

### 6.1 Mapping Priority

1. `external_item_id + external_model_id`
2. fallback SKU/label matching rule

### 6.2 Dedup Key

- `channel + shop_identifier + external_order_id + external_order_line_id`

Behavior:

- New key => insert.
- Existing key => update idempotent.

---

## 7. Validation Rules

- `channel` wajib enum valid.
- `shop_identifier` wajib ada.
- `external_order_id` wajib ada.
- `external_order_line_id` wajib ada.
- `qty` > 0.
- `gross_amount` >= 0.

---

## 8. Error Semantics

- `401 Unauthorized`: token invalid/tidak ada.
- `403 Forbidden`: di luar scope company.
- `422 Unprocessable Entity`: payload/file/schema invalid.

Example invalid schema:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["csv schema invalid: missing external_order_line_id column"]
}
```

Example row mapping failure:

```json
{
  "success": true,
  "data": {
    "id": 301,
    "status": "completed_with_errors",
    "failed_rows": 4,
    "unmapped_rows": 3
  }
}
```

---

## 9. Audit Contract

Setiap batch wajib menyimpan:

- actor user id
- channel
- shop identifier
- source type
- file name
- total rows
- success rows
- failed rows
- started_at
- finished_at

---

## 10. Testing and Quality Gates

### 10.1 Request Specs

- Upload batch ingestion.
- Parse and normalize rows.
- Dedup idempotent upsert.
- Unmapped resolution flow.
- Error reporting per row.

### 10.2 Policy Specs

- Access allow/deny by company scope.

### 10.3 Quality Gates

- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
