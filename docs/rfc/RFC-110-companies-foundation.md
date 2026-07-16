# RFC-110 Companies Foundation

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-110 |
| Module | Companies Foundation |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-110, RFC-100 |

---

## 1. Summary

RFC ini mendefinisikan implementasi teknis module Companies pada `api` dan `admin-web`.

Fokus utama:

- Company master (individual/cv/pt)
- Company location dengan map picker React Leaflet
- Company logo upload
- Company marketplace links

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-110 Companies Foundation
- TDD-100 HR API Contract
- RFC-100 HR Foundation Implementation
- RFC-101 Access Control and Role Matrix (HR)
- RFC-102 Employee Document Lifecycle

---

## 2. Design Principles

### 2.1 API as Source of Truth

- Seluruh operasi CRUD company dilakukan melalui API.
- Admin-web tidak menyimpan business rules kritikal sendiri.

### 2.2 Company Type Conditional Rules

- `individual` tidak menyimpan legal fields.
- `cv`/`pt` boleh menyimpan legal fields sesuai validasi.

### 2.3 Location by Map Pin

- Titik lokasi ditetapkan melalui map picker berbasis React Leaflet.
- Library frontend acuan: https://react-leaflet.js.org/
- `latitude` dan `longitude` selalu diperlakukan sebagai satu pasangan data.

---

## 3. Current State Mapping

### 3.1 API

- Model company sudah tersedia dengan validasi utama (`code`, `email`, `phone`, `website`, `latitude/longitude`).
- Soft delete sudah tersedia melalui `discard`.
- Logo upload menggunakan Active Storage.

### 3.2 Admin-Web

- Form Company sudah mencakup field company type, business info, coordinate fields, dan logo.
- Integrasi API list/detail/create/update sudah tersedia.

---

## 4. API Contract Baseline

### 4.1 Endpoints

- `GET /api/v1/companies`
- `GET /api/v1/companies/{id}`
- `POST /api/v1/companies`
- `PATCH /api/v1/companies/{id}`
- `DELETE /api/v1/companies/{id}`
- `POST /api/v1/companies/{id}/logo`
- `GET/POST/PATCH/DELETE /api/v1/companies/{id}/marketplaces`

### 4.2 Rules

- Semua endpoint wajib auth + authorization.
- Endpoint list wajib mendukung pagination/search/ordering.
- Soft delete untuk data yang perlu histori.

### 4.3 Coordinate Validation

- `latitude`: -90 sampai 90.
- `longitude`: -180 sampai 180.
- Keduanya harus dikirim bersamaan.

---

## 5. Admin-Web Implementation Rules

### 5.1 Company Form

- Field legal business tampil dinamis sesuai company type.
- Jika `individual`, legal fields disembunyikan dan tidak dikirim.

### 5.2 Map Picker

- Gunakan komponen React Leaflet sebagai input lokasi.
- User klik map untuk menaruh marker.
- Marker bisa drag and drop.
- Field `latitude` dan `longitude` bersifat read-only di form.
- Saat edit mode, marker harus diinisialisasi dari koordinat tersimpan.

### 5.3 Logo

- Preview logo sebelum submit.
- Replace dan remove logo didukung.

---

## 6. Security and Data Integrity

- Validasi input wajib di backend, bukan hanya frontend.
- URL marketplace dan website wajib https.
- Audit trail untuk create/update/delete company dan marketplace links.

---

## 7. Testing Strategy

### 7.1 API

- Model spec untuk validasi company dan marketplace link.
- Request spec untuk CRUD companies + logo + marketplace links.
- Policy spec untuk akses role.

### 7.2 Admin-Web

- Unit test form dynamic fields (individual vs cv/pt).
- Unit test flow map marker set/update coordinate.
- Unit test logo upload UI state.

### 7.3 Quality Gates

- Coverage per file >= 80%
- Coverage overall >= 90%
- Lint pass
- Security checks pass

---

## 8. Rollout Plan

1. Finalisasi contract endpoint Companies.
2. Finalisasi frontend map picker React Leaflet dan sinkron payload koordinat.
3. Lengkapi test coverage API/admin-web.
4. Deploy staging dan jalankan smoke test.
5. Promote production setelah gate hijau.

---

## 9. Open Questions

1. Apakah geocoding reverse lookup diperlukan di fase foundation?
2. Apakah legal fields CV/PT wajib semua di phase awal atau bertahap?
3. Apakah multi-company role scope (per company) masuk fase berikutnya?