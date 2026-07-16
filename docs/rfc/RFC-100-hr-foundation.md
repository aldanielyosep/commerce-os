# RFC-100 HR Foundation Implementation

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-100 |
| Module | HR Foundation |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-100, TDD-100, RFC-101, RFC-102 |

---

## 1. Summary

RFC ini mendefinisikan implementasi teknis HR Foundation untuk `api` dan `admin-web`:

- Employee
- Employee documents
- Department assignment
- Career history
- Salary history
- Internal admin access

Implementasi wajib mengikuti baseline ARCH-000 (auth, pagination/search/order, soft delete, test/lint/security/coverage gates).

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-100 HR Foundation
- TDD-100 HR API Contract
- RFC-101 Access Control and Role Matrix (HR)
- RFC-102 Employee Document Lifecycle

Dokumen turunan yang wajib dirujuk untuk implementasi detail:

- RFC-101 Access Control and Role Matrix (HR)
- RFC-102 Employee Document Lifecycle

---

## 2. Current State Mapping

### 2.1 API Models Already Available

- `Employee`
- `Department`
- `EmployeeDepartment`
- `EmployeeDocument`
- `PositionHistory`
- `SalaryRecord`
- `User`

### 2.2 Existing Behaviors

- `Employee.employee_id` sudah auto generate via `EMPLOYEE_ID_PREFIX` env.
- Employee dan Department sudah menggunakan soft delete (`discard`).
- Employee documents sudah menggunakan Active Storage dan S3-compatible key strategy.
- User auth sudah berbasis Devise + JWT.
- Career history menggunakan `PositionHistory`.
- Salary history menggunakan `SalaryRecord` dengan validasi no-overlap rentang tanggal.

---

## 3. Domain Design

### 3.1 Employee

- Identity utama: `employee_id`.
- Auto generation saat create menggunakan env prefix:
  - `EMPLOYEE_ID_PREFIX`
- Sequence numeric di-generate oleh database sequence.

### 3.2 Department Assignment

- Relasi many-to-many via `EmployeeDepartment`.
- Satu employee boleh memiliki banyak department aktif.

### 3.3 Employee Documents

- Dokumen employee disimpan di object storage (S3-compatible).
- Tipe dokumen saat ini mencakup ID nasional, passport, tax ID, contract, dan lainnya.
- Kebutuhan tambahan: dukungan eksplisit untuk BPJS (to be implemented bila belum ada enum khusus).

### 3.4 Career and Salary

- Career history disimpan sebagai `PositionHistory` dengan effective date.
- Salary history disimpan sebagai `SalaryRecord` dan wajib mencegah overlap rentang.

### 3.5 Access Control

- Internal user mengakses admin-web menggunakan JWT.
- Authorization diputuskan di API policy layer.
- Role minimum saat ini: `super_admin`, `admin`.
- Aturan permission matrix detail mengikuti RFC-101.

---

## 4. API Rules for HR Endpoints

### 4.1 Auth and Authorization

- Semua endpoint HR wajib authenticated.
- Semua endpoint HR wajib melalui policy authorization.

### 4.2 List Behavior

- Endpoint list HR default mendukung pagination, search, order.
- Search minimal pada field identifier utama dan nama.

### 4.3 Soft Delete

- Employee, Department, EmployeeDocument wajib soft delete.
- Data histori (salary/career) tidak di-hard-delete tanpa alasan audit yang jelas.

### 4.4 Auditing

- Perubahan data kritis employee, department, documents, position history, salary records harus tercatat audit trail.

### 4.5 Cross-Reference

- Kontrak endpoint dan request/response baseline mengikuti TDD-100.
- Detail akses role/action mengikuti RFC-101.
- Detail lifecycle dokumen employee mengikuti RFC-102.

---

## 5. Admin-Web Requirements

- Halaman employee mendukung:
  - list + search + filter + pagination
  - create/update/terminate
  - assignment multi-department
- Halaman documents mendukung upload/download/archive.
- Halaman career dan salary menampilkan histori kronologis.
- Halaman users/access mendukung konfigurasi user internal dan role.

---

## 6. Company Readiness Constraint

- Fase sekarang: company dominan individual.
- System harus ready untuk CV/PT dengan kolom business data yang sudah disiapkan.
- HR module tidak boleh hard-code asumsi company hanya individual.

---

## 7. Testing and Quality Strategy

### 7.1 API

- Wajib:
  - model specs
  - request specs
  - policy specs
  - service specs (jika ada business logic service)

### 7.2 Frontend (admin-web)

- Wajib:
  - unit tests untuk halaman/komponen utama HR
  - interaction test untuk flow utama (create employee, assign department, upload document)

### 7.3 Gates

- Coverage per file >= 80%
- Coverage overall >= 90%
- Lint pass
- Security checks pass

---

## 8. Security and Performance

### 8.1 Security

- JWT mandatory untuk semua akses HR.
- Validasi upload dokumen (content type, size limit) wajib.
- Signed URL download dokumen harus memiliki TTL.

### 8.2 Performance

- Gunakan eager loading untuk relasi yang sering diakses.
- Bullet aktif di development/test untuk deteksi N+1.

---

## 9. Implementation Backlog (Delta)

1. Tambah dukungan tipe dokumen BPJS eksplisit jika belum ada di enum.
2. Standarkan pagination util lintas endpoint HR bila belum konsisten.
3. Tambahkan permission matrix granular jika role global belum cukup.
4. Validasi kesiapan multi-company untuk employee code sequence jika nanti diperlukan.

Backlog ini harus dikerjakan sinkron dengan RFC-101 dan RFC-102 agar tidak terjadi gap antara policy, API contract, dan dokumen lifecycle.

---

## 10. Rollout Plan

1. Stabilkan API HR endpoints + policy + tests.
2. Sinkronkan admin-web HR pages ke API contract final.
3. Jalankan quality gates (test/coverage/lint/security).
4. Deploy ke `stg`, lakukan smoke test flow HR end-to-end.
5. Promote ke `prd` setelah semua gate hijau.