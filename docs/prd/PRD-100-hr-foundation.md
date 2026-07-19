# PRD-100 HR Foundation

## Document Information

| Item | Value |
|------|-------|
| Document | PRD-100 |
| Module | HR Foundation |
| Status | Draft |
| Version | 1.0 |
| Owner | Product + Engineering |
| Date | 2026-07-16 |
| Depends On | ARCH-000 Foundation Architecture |

---

## 1. Objective

Membangun fondasi HR di `admin-web` dan `api` untuk kebutuhan internal operasional.

Scope fondasi mencakup:

- Employee master
- Employee documents (KTP, NPWP, BPJS, contract, dan dokumen terkait)
- Department assignment (many-to-many)
- Career history
- Salary history
- Admin access configuration untuk user internal

---

## 2. Business Context

- Saat ini company berjalan sebagai individual owner.
- Sistem harus siap untuk transisi ke CV/PT tanpa redesign besar.
- Data company untuk CV/PT disiapkan dari awal lewat kolom yang sudah ready, walau belum selalu dipakai pada fase individual.

---

## 3. Scope

### 3.1 In Scope

- CRUD employee
- Employee code auto generate berdasarkan prefix dari environment variable
- Upload dan pengelolaan employee documents
- Multi-department assignment per employee
- Career history management
- Salary history management
- User access configuration untuk admin-web (siapa yang bisa login dan role aksesnya)

### 3.2 Out of Scope

- Payroll engine dan komponen pajak otomatis
- Attendance dan leave
- Recruitment dan onboarding
- Employee self service

---

## 4. Functional Requirements

### 4.1 Employee Master

- System menyediakan employee profile lengkap.
- Employee code di-generate otomatis saat create.
- Prefix employee code diambil dari environment variable.
- Employee status lifecycle minimal: active, probation, resigned, terminated, retired.

### 4.2 Employee Documents

- Employee dapat memiliki banyak dokumen.
- Dokumen minimal mendukung:
  - KTP
  - NPWP
  - BPJS
  - Employment contract
  - Dokumen pendukung lainnya
- Dokumen dapat diupload, dilihat metadata-nya, diunduh, dan diarsipkan (soft delete).
- Penyimpanan file menggunakan S3 compatible object storage.

### 4.3 Department Assignment

- Satu employee dapat memiliki banyak department.
- Satu department dapat memiliki banyak employee.
- Contoh kasus valid: satu orang bisa berada di Admin dan CTO sekaligus.

### 4.4 Career History

- Menyimpan histori posisi employee berdasarkan effective date.
- Histori dapat dikaitkan ke department.
- Histori bersifat kronologis dan dapat diaudit.

### 4.5 Salary History

- Menyimpan histori salary berdasarkan periode efektif.
- Tidak boleh ada overlap rentang salary untuk employee yang sama.
- Histori salary dapat ditelusuri untuk audit perubahan kompensasi.

### 4.6 Admin Access Configuration

- Login admin-web hanya untuk user yang terdaftar di sistem internal.
- Role access minimal: super_admin dan admin.
- Hak akses di admin-web mengikuti authorization dari API (policy-based).

---

## 5. Non-Functional Requirements

- Semua endpoint HR wajib auth.
- Endpoint list wajib support pagination, search, ordering.
- Entitas yang memerlukan histori operasional wajib soft delete.
- Coverage: minimal 80% per file dan 90% overall.
- Lint wajib lulus untuk API dan admin-web.
- Security check wajib lulus untuk API dan admin-web.

---

## 6. Data and Readiness Notes

- Company type saat ini individual, tetapi struktur data company sudah disiapkan untuk CV/PT.
- Perubahan dari individual ke CV/PT tidak boleh mematahkan module HR.
- Relasi user internal ke employee harus menjaga integritas data audit.

---

## 7. Acceptance Criteria

1. Employee dapat dibuat dengan employee code auto generated dari prefix env.
2. Employee documents (termasuk KTP/NPWP/BPJS/contract) dapat diupload, diunduh, dan diarsipkan.
3. Satu employee dapat di-assign ke banyak department.
4. Career history dan salary history tersimpan dan dapat ditampilkan kronologis.
5. User admin-web dapat dikonfigurasi per role dan dibatasi aksesnya.
6. Semua gate kualitas dan keamanan (test, coverage, lint, security) terpenuhi.

---

## 8. Open Questions

1. Apakah BPJS dibagi menjadi BPJS Kesehatan dan BPJS Ketenagakerjaan sebagai tipe terpisah?
2. Apakah employee code perlu sequence terpisah per company saat multi-company aktif?
3. Apakah admin role perlu permission matrix granular selain role global (`super_admin`, `admin`)?