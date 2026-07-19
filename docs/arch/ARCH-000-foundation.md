# ARCH-000 Foundation Architecture

## Document Information

| Item | Value |
|------|-------|
| Document | ARCH-000 |
| Title | Foundation Architecture |
| Status | Accepted |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |

---

## 1. Purpose

Dokumen ini menjadi source of truth arsitektur fondasi Commerce OS untuk fase implementasi awal.

Fokus utama fase ini adalah menyelaraskan 3 sistem:

- admin-web (React)
- api (Rails API)
- storefront (React)

---

## 2. System Topology

```text
Admin Web (React) ----->
                         \
                          > API (Rails) -----> PostgreSQL
                         /                  \
Storefront (React) ---->                     -> S3 Compatible Object Storage (Railway Object)
                                              -> GoodJob Worker
```

### 2.1 System Roles

- admin-web: frontend internal untuk maintain data operasional (employee, product, dan domain internal lain).
- storefront: frontend penjualan untuk customer.
- api: core backend untuk admin-web dan storefront.

---

## 3. Technology Baseline

### 3.1 Frontend

- React untuk admin-web.
- React untuk storefront.

### 3.2 Backend

- Ruby on Rails API only.
- PostgreSQL sebagai database utama.
- GoodJob untuk background job.

### 3.3 File Storage

- Semua file dan media disimpan di S3 compatible object storage.
- Target awal: Railway Object (S3 compatible).

---

## 4. Security and Access Baseline

### 4.1 Authentication (Mandatory)

- Semua request admin-web ke API wajib authenticated.
- Semua request storefront ke API wajib authenticated.
- Strategi auth aktif saat ini: JWT access token (Bearer token).
- Refresh token flow bersifat mandatory untuk readiness production storefront dan harus diimplementasikan sebagai endpoint API dedicated.

### 4.2 Auth Domain Boundary

- Domain auth dipisah:
  - admin users (internal)
  - storefront customers (external)
- Pemisahan model, policy scope, dan lifecycle token untuk admin users vs storefront customers wajib dipertahankan saat implementasi storefront diaktifkan.

### 4.3 Authorization

- Authorization wajib diterapkan di API per role/policy.
- Endpoint tidak boleh mengandalkan validasi role di frontend saja.

---

## 5. API Baseline Rules

### 5.1 List Endpoint Defaults

Secara default, endpoint list harus mendukung:

- pagination
- search
- ordering

Kontrak minimum endpoint list:

- Query `page` (default: 1).
- Query `per_page` (default: 20, maksimum: 100).
- Query `q` untuk search bebas (jika domain relevan).
- Query `order_by` + `order_dir` (`asc|desc`) dengan whitelist field yang valid.
- Response `meta` harus memuat informasi pagination (minimal: `page`, `per_page`, `total_count`, `total_pages`).

### 5.2 Soft Delete

- Entitas operasional yang membutuhkan histori wajib menggunakan soft delete.
- Hard delete hanya diperbolehkan untuk kasus khusus yang terdokumentasi.

### 5.3 Response Envelope

- Standard response envelope tidak ditetapkan di ARCH ini.
- Detail response contract ditetapkan per RFC domain.

---

## 6. Quality Gates (All Apps)

Aturan ini wajib berlaku di API, admin-web, dan storefront.

### 6.1 Testing

- Unit test wajib.
- Untuk API, tambahkan request/integration test sesuai kebutuhan domain.

### 6.2 Coverage

- Minimum coverage per file: 80%.
- Minimum coverage overall: 90%.

### 6.3 Lint

- Lint wajib lulus di masing-masing aplikasi.

### 6.4 Security

- Security check wajib lulus di masing-masing aplikasi.

---

## 7. Performance and Data Integrity

### 7.1 N+1 Prevention

- Gunakan Bullet untuk mendeteksi N+1 query di API.
- Endpoint yang mengakses relasi harus menggunakan eager loading yang sesuai.
- Bullet wajib aktif minimal di environment development.
- Direkomendasikan aktif di test/CI untuk endpoint kritikal agar potensi N+1 terdeteksi sebelum merge.

### 7.2 Validation

- Validasi wajib ada di model dan request boundary.
- Gunakan gem/library validasi tambahan bila memberikan nilai nyata dan tetap menjaga maintainability.

---

## 8. Rails Gem Baseline Recommendation

Daftar ini adalah baseline awal, dapat disesuaikan per kebutuhan domain:

- `pundit` untuk authorization policy.
- `pagy` atau `kaminari` untuk pagination standard.
- `discard` (atau mekanisme soft delete setara) untuk soft delete.
- `bullet` untuk deteksi N+1 query.
- `rspec-rails`, `factory_bot_rails`, `faker` untuk testing.
- `brakeman` untuk static security scan.
- `bundler-audit` untuk dependency vulnerability check.

Catatan: pemilihan final gem per domain tetap didokumentasikan di RFC modul terkait.

---

## 9. Deployment Environments

- Staging (`stg`) untuk validasi integrasi dan QA.
- Production (`prd`) untuk traffic aktif.

Pipeline deploy mengikuti workflow CI/CD yang sudah ada di repository.

---

## 10. Out of Scope for This Document

- Detail domain contract per modul (ditulis di PRD/RFC domain).
- Detail response schema API per endpoint.
- Detail business rule Product Code (dibahas di RFC Product berikutnya).

---

## 11. Enforcement

Sebuah fitur dianggap siap merge hanya jika:

- memenuhi auth, pagination/search/ordering (jika endpoint list), dan soft delete (jika relevan)
- endpoint list mematuhi kontrak query/meta pagination yang ditetapkan di dokumen ini
- tidak ada temuan N+1 yang belum ditangani pada skenario endpoint yang ditambahkan/diubah
- lulus test + coverage gate (80% per file, 90% overall)
- lulus lint
- lulus security checks

Dokumen ini menjadi baseline untuk semua PRD/RFC domain berikutnya.