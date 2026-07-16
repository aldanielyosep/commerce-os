# PRD-110 Companies Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-110 |
| Module | Companies Foundation |
| Platform | Admin Web + API |
| Status | Draft |
| Version | 1.0 |
| Owner | Product + Engineering |
| Date | 2026-07-16 |
| Depends On | ARCH-000 Foundation Architecture |

---

## 1. Objective

Membangun fondasi Companies sebagai master data identitas bisnis yang dipakai lintas modul, dengan kesiapan individual saat ini dan transisi mulus ke CV/PT.

---

## 2. Business Context

- Saat ini operasional utama masih individual.
- Sistem harus siap untuk CV/PT tanpa redesign skema inti.
- Data Companies menjadi anchor untuk Product, Inventory, Order, dan integrasi marketplace.

---

## 3. Scope

### 3.1 In Scope

- CRUD Company
- Company type: `individual`, `cv`, `pt`
- Dynamic business information rules (CV/PT vs individual)
- Upload logo company
- Marketplace links per company
- Map-based location picker untuk latitude/longitude
- API integration untuk seluruh operasi admin-web

### 3.2 Out of Scope

- Marketplace OAuth dan token lifecycle
- Subscription/billing
- Tax engine
- Warehouse management detail

---

## 4. Functional Requirements

### 4.1 Company Master

- Company wajib memiliki identitas utama (`code`, `name`, `owner_name`, `company_type`, `email`, `phone`, `status`).
- Company code harus unik.
- Website jika diisi wajib `https`.

### 4.2 Company Type Rules

- Jika `company_type=individual`, field business legal tidak ditampilkan dan tidak disimpan.
- Jika `company_type=cv|pt`, legal fields dapat diisi sesuai ketentuan validasi.

### 4.3 Address and Geo Location

- Admin dapat mengisi alamat (address, province, city, postal_code).
- Admin dapat menentukan lokasi menggunakan map picker berbasis React Leaflet.
- Library frontend yang digunakan: https://react-leaflet.js.org/
- Pengguna menaruh titik (pin) di peta untuk mengisi koordinat.
- Marker dapat dipindah (drag and drop).
- Latitude dan longitude ditampilkan read-only setelah dipilih dari peta.
- Latitude dan longitude harus dikirim berpasangan (tidak boleh salah satu saja).

### 4.4 Logo Management

- Logo diupload melalui file picker.
- URL logo dihasilkan API.
- Format logo mengikuti validasi backend (png/jpg/jpeg/webp/svg+xml).
- Batas ukuran file mengikuti validasi backend (maksimum 2 MB).

### 4.5 Marketplace Links

- Satu company dapat memiliki banyak marketplace link.
- Kombinasi marketplace dalam satu company tidak boleh duplikat.
- URL marketplace wajib https.

---

## 5. Data Model Baseline

### 5.1 Companies

Field inti:

- `code` (unique)
- `name`
- `owner_name`
- `company_type` (`individual|cv|pt`)
- `email`
- `phone`
- `website`
- `description`
- `address`, `province`, `city`, `postal_code`
- `latitude`, `longitude`
- `status` (`active|inactive`)
- `company_registration_number`, `nib`, `siup`, `deed_number`, `pkp_number`
- `discarded_at` (soft delete)

### 5.2 Marketplace Links

Field inti:

- `company_id`
- `marketplace`
- `store_name`
- `store_url`
- `is_active`

---

## 6. API Requirements

- Semua endpoint Companies wajib auth dan authorization.
- Endpoint list wajib support pagination, search, ordering.
- Soft delete dipakai untuk entitas yang butuh histori.

Endpoint minimum:

- `GET /api/v1/companies`
- `GET /api/v1/companies/{id}`
- `POST /api/v1/companies`
- `PATCH /api/v1/companies/{id}`
- `DELETE /api/v1/companies/{id}`
- `POST /api/v1/companies/{id}/logo`
- `GET/POST/PATCH/DELETE /api/v1/companies/{id}/marketplaces`

---

## 7. Admin Web Requirements

- Company list: search, filter, sort, pagination.
- Company form: dynamic fields based on company type.
- Map picker React Leaflet untuk set koordinat.
- Logo preview sebelum save.
- Marketplace links CRUD dari halaman company.

---

## 8. Validation Rules

### 8.1 General

- `code` unik.
- `name` wajib, max 100.
- `owner_name` wajib, max 100.
- `email` wajib, format valid.
- `phone` wajib, format valid.
- `website` optional, jika diisi wajib https.

### 8.2 Coordinates

- `latitude` rentang -90..90.
- `longitude` rentang -180..180.
- `latitude` dan `longitude` wajib berpasangan.

### 8.3 Company Type Conditional

- `individual`: legal fields tidak boleh tersimpan.
- `cv|pt`: legal fields diperbolehkan, `company_registration_number` dan `nib` mengikuti rule API.

---

## 9. Non-Functional Requirements

- Coverage minimal 80% per file, 90% overall.
- Lint wajib pass.
- Security checks wajib pass.
- API response konsisten dengan envelope standar aplikasi.

---

## 10. Acceptance Criteria

1. Admin dapat CRUD Company melalui API.
2. Rule individual vs cv/pt berjalan sesuai validasi.
3. Admin dapat menetapkan koordinat perusahaan lewat map picker React Leaflet.
4. Logo dapat diupload dan ditampilkan kembali.
5. Marketplace links dapat dikelola tanpa duplikasi.
6. Quality gates (test/coverage/lint/security) terpenuhi.

---

## 11. Related Documents

- ARCH-000 Foundation Architecture
- PRD-100 HR Foundation
- RFC-110 Companies Foundation
- RFC-100 HR Foundation Implementation
- RFC-101 Access Control and Role Matrix (HR)
- RFC-102 Employee Document Lifecycle

---

## 12. Open Questions

1. Apakah `company_registration_number` dan `nib` dibuat mandatory untuk CV/PT pada fase foundation, atau bertahap?
2. Apakah perlu geocoding reverse lookup (lat/long ke alamat) di fase ini, atau cukup map pin manual?
3. Apakah perlu multi-company role scoping di admin-web pada fase berikutnya?