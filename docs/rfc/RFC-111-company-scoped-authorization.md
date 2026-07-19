# RFC-111 Company-Scoped Authorization

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-111 |
| Module | Company-Scoped Authorization |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, RFC-101, RFC-110, PRD-110 |

---

## 1. Summary

RFC ini mendefinisikan authorization model berbasis scope company agar user internal hanya mengakses data company yang menjadi tanggung jawabnya.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-110 Companies Foundation
- RFC-101 Access Control and Role Matrix (HR)
- RFC-110 Companies Foundation
- TDD-110 Companies API Contract

---

## 2. Problem Statement

Model role global (`super_admin` dan `admin`) belum cukup untuk skenario multi-company.

Risiko tanpa scope:

- User `admin` dapat melihat atau mengubah data company yang bukan tanggung jawabnya.
- Kebocoran data lintas entitas bisnis.
- Sulit audit ownership per aksi.

---

## 3. Goals and Non-Goals

### 3.1 Goals

- Menambahkan pembatasan akses per company untuk role non-super-admin.
- Menjaga kompatibilitas dengan role matrix yang sudah ada.
- Menyediakan policy contract yang eksplisit untuk endpoint Companies dan turunannya.

### 3.2 Non-Goals

- Tidak membahas auth customer storefront.
- Tidak membahas billing/tenant isolation tingkat database.
- Tidak mengubah mekanisme login dasar JWT.

---

## 4. Proposed Authorization Model

### 4.1 Hybrid RBAC + Scope

- Tetap gunakan role global: `super_admin`, `admin`.
- Tambahkan scope company melalui relasi assignment user-company.
- Keputusan policy = role global + scope membership.

### 4.2 Scope Source of Truth

- API menyimpan assignment user terhadap company.
- Frontend hanya menampilkan data berdasarkan hasil policy API.
- Frontend tidak boleh menjadi enforcement utama.

### 4.3 Behavioral Rules

- `super_admin`: akses penuh seluruh company dan semua operasi.
- `admin`:
  - boleh list companies dalam scope assignment
  - boleh show/update company hanya jika company ada di scope assignment
  - boleh mengelola marketplace/logo hanya untuk company di scope assignment
  - tidak boleh delete company di luar scope assignment

---

## 5. Policy Contract

### 5.1 Companies Policy

Aksi minimal yang wajib didefinisikan:

- `index?`
- `show?`
- `create?`
- `update?`
- `destroy?`
- `upload_logo?`
- `manage_marketplaces?`

### 5.2 Policy Resolution Order

1. Validasi authentication.
2. Validasi role global.
3. Jika role bukan `super_admin`, validasi membership terhadap `company_id` target.
4. Tolak akses jika salah satu langkah gagal.

---

## 6. API Integration Impacts

- Endpoint list wajib mengembalikan hanya company dalam scope user (kecuali `super_admin`).
- Endpoint detail/mutasi wajib melakukan scope check sebelum operasi data.
- Error forbidden harus konsisten dengan envelope API.

---

## 7. Data and Migration Strategy

### 7.1 Data Model Requirement

Tambahkan relasi assignment user-company (nama final menyesuaikan codebase), minimal berisi:

- `user_id`
- `company_id`
- `role_in_company` (opsional untuk fase awal, disiapkan untuk ekspansi)
- timestamps

### 7.2 Rollout Strategy

1. Tambahkan tabel assignment + model/policy pendukung.
2. Backfill assignment awal untuk user admin eksisting.
3. Aktifkan enforcement di endpoint Companies.
4. Monitor forbidden rate di staging, lalu produksi.

---

## 8. Security and Audit

- Semua denial akses dicatat pada audit log keamanan.
- Perubahan assignment user-company harus tercatat actor dan timestamp.
- Endpoint assignment management hanya untuk `super_admin`.

---

## 9. Testing Strategy

### 9.1 Policy Specs

- `super_admin` dapat mengakses semua company.
- `admin` hanya dapat akses company dalam scope.
- `admin` ditolak untuk company di luar scope.

### 9.2 Request Specs

- Filter list berdasarkan scope.
- Show/update/delete/marketplace/logo ditolak jika out-of-scope.
- Forbidden menggunakan status `403` dan envelope error standar.

### 9.3 Regression Checks

- Endpoint HR existing tidak regress setelah penambahan scope di domain Companies.
- Auth flow login/refresh token tetap berjalan seperti sebelumnya.

---

## 10. Rollout Risk and Mitigation

- Risiko: assignment belum lengkap menyebabkan akses legitimate terblokir.
- Mitigasi: backfill + script verifikasi sebelum enforcement penuh.
- Risiko: policy leak menyebabkan data lintas company terlihat.
- Mitigasi: request spec negatif wajib untuk skenario out-of-scope.
