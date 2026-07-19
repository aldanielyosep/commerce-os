# TDD-110 Companies API Contract

## Document Information

| Item | Value |
|------|-------|
| Document | TDD-110 |
| Title | Companies API Contract |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-110, RFC-110, RFC-111 |

---

## 1. Purpose

Mendefinisikan kontrak API Companies agar admin-web dan API sinkron, termasuk aturan akses company-scoped.

---

## 2. Global Contract Rules

- Semua endpoint wajib auth (JWT).
- Semua endpoint list wajib mendukung pagination, search, dan ordering.
- Semua response error wajib menggunakan envelope konsisten.
- Soft delete wajib untuk entitas company.
- Audit trail wajib untuk create/update/delete data company dan marketplace link.

### 2.1 Cross-Reference

- Detail implementasi fitur Companies mengikuti RFC-110.
- Detail authorization company-scoped mengikuti RFC-111.

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

## 4. Endpoint Contract

### 4.1 Companies

- `GET /api/v1/companies`
- `GET /api/v1/companies/:id`
- `POST /api/v1/companies`
- `PATCH /api/v1/companies/:id`
- `DELETE /api/v1/companies/:id` (soft delete)

List query params:

- `page` (default 1)
- `per_page` (default 20)
- `q` (code/name/owner_name/email/phone)
- `status`
- `company_type`
- `order_by` (`created_at`, `name`, `code`, `status`)
- `order` (`asc`/`desc`)

Authorization behavior:

- `super_admin`: dapat mengakses semua company.
- `admin`: hanya dapat mengakses company yang ter-assign pada scope user.

### 4.2 Company Logo

- `POST /api/v1/companies/:id/logo`

Rules:

- Menerima multipart file upload.
- Tipe file wajib mengikuti validasi backend (png/jpg/jpeg/webp/svg+xml).
- Replace logo didukung.
- Remove logo bisa dilakukan via payload update company (`remove_logo=true`) atau endpoint setara yang didokumentasikan implementasinya.

### 4.3 Company Marketplaces

- `GET /api/v1/companies/:company_id/marketplaces`
- `POST /api/v1/companies/:company_id/marketplaces`
- `PATCH /api/v1/companies/:company_id/marketplaces/:id`
- `DELETE /api/v1/companies/:company_id/marketplaces/:id`

Rules:

- `store_url` wajib `https`.
- Enum `marketplace`: `shopee`, `tokopedia`, `tiktok_shop`, `lazada`, `blibli`, `shopify`, `website`.
- Duplikasi marketplace aktif dengan URL sama dalam satu company harus ditolak.

---

## 5. Payload Contract

### 5.1 Company Create/Update Payload

```json
{
  "company": {
    "code": "CMP-001",
    "name": "Contoh Niaga",
    "owner_name": "Budi",
    "company_type": "pt",
    "email": "ops@contoh.co.id",
    "phone": "+6281234567890",
    "website": "https://contoh.co.id",
    "description": "Distributor retail",
    "address": "Jl. Melati No. 10",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "postal_code": "12345",
    "latitude": -6.2297,
    "longitude": 106.8295,
    "status": "active",
    "company_registration_number": "AHU-001",
    "nib": "1234567890123",
    "siup": "SIUP-2026-01",
    "deed_number": "DEED-8899",
    "pkp_number": "PKP-7788"
  }
}
```

### 5.2 Conditional Validation

- Jika `company_type=individual`, legal fields (`company_registration_number`, `nib`, `siup`, `deed_number`, `pkp_number`) tidak boleh dipaksa wajib.
- Jika `company_type=cv|pt`, legal fields mengikuti rule validasi domain (wajib/opsional) yang dikonfigurasi backend.
- `latitude` dan `longitude` harus dikirim berpasangan; salah satu saja harus ditolak.

### 5.3 Marketplace Create/Update Payload

```json
{
  "marketplace": {
    "marketplace": "tokopedia",
    "store_name": "Contoh Official",
    "store_url": "https://www.tokopedia.com/contohofficial",
    "is_active": true
  }
}
```

---

## 6. Authorization Contract

Referensi utama: RFC-111.

Ringkasan:

- Semua endpoint Companies wajib policy-based authorization.
- Untuk role `admin`, policy harus memvalidasi membership user terhadap `company_id` target.
- Semua akses lintas company tanpa membership harus ditolak (`403`).

---

## 7. Error Semantics

- `401 Unauthorized`: token tidak valid atau tidak ada.
- `403 Forbidden`: user tidak memiliki scope company atau aksi tidak diizinkan.
- `404 Not Found`: data tidak ditemukan atau tidak berada dalam scope akses user.
- `422 Unprocessable Entity`: validasi payload gagal.

---

## 8. Testing and Quality Gates

### 8.1 API Request Specs

- CRUD companies + search/pagination/ordering.
- Upload/replace/remove logo.
- CRUD marketplaces.
- Company-scoped authorization checks untuk role `admin`.

### 8.2 Policy Specs

- Aksi list/show/create/update/delete untuk `super_admin`.
- Aksi list/show/create/update/delete untuk `admin` dengan dan tanpa assignment company.

### 8.3 Contract Tests (Admin-Web Integration)

- Pastikan payload frontend `CompanyPayload` dan `CompanyMarketplaceLinkPayload` konsisten dengan API.
- Pastikan enum marketplace sinkron dengan tipe frontend.

### 8.4 Quality Gates

- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
