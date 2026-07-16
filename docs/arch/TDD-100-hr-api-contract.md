# TDD-100 HR API Contract

## Document Information

| Item | Value |
|------|-------|
| Document | TDD-100 |
| Title | HR API Contract |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, PRD-100, RFC-100, RFC-101, RFC-102 |

---

## 1. Purpose

Mendefinisikan kontrak API HR agar admin-web dan API sinkron tanpa ambiguity.

---

## 2. Global Contract Rules

- Semua endpoint wajib auth (JWT).
- Semua endpoint list wajib mendukung pagination, search, dan ordering.
- Semua error menggunakan struktur konsisten.
- Soft delete wajib untuk entitas operasional yang membutuhkan histori.
- Audit trail wajib untuk perubahan data kritis.

### 2.1 Cross-Reference

- Detail access control role/action mengikuti RFC-101.
- Detail lifecycle dan governance dokumen employee mengikuti RFC-102.

---

## 3. Response Envelope Baseline

Semua endpoint API mengikuti pola response umum dari application controller.

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

## 4. HR Endpoints

### 4.1 Employees

- `GET /api/v1/employees`
- `GET /api/v1/employees/:id`
- `POST /api/v1/employees`
- `PATCH /api/v1/employees/:id`
- `DELETE /api/v1/employees/:id` (soft delete)
- `POST /api/v1/employees/:id/terminate`

List query params:

- `page` (default 1)
- `per_page` (default 20)
- `q` (employee_id/full_name/email)
- `status`
- `department_id`
- `order_by`
- `order`

### 4.2 Employee Departments

- `GET /api/v1/employees/:employee_id/departments`
- `POST /api/v1/employees/:employee_id/departments`
- `DELETE /api/v1/employees/:employee_id/departments/:id`

### 4.3 Position Histories

- `GET /api/v1/employees/:employee_id/position_histories`
- `POST /api/v1/employees/:employee_id/position_histories`
- `PATCH /api/v1/employees/:employee_id/position_histories/:id`

Create payload example:

```json
{
  "position_history": {
    "position": "Chief Technology Officer",
    "department_id": "uuid-department-cto",
    "effective_date": "2025-02-01",
    "notes": "Promoted from Tech Lead"
  }
}
```

### 4.4 Salary Records

- `GET /api/v1/employees/:employee_id/salary_records`
- `POST /api/v1/employees/:employee_id/salary_records`
- `PATCH /api/v1/employees/:employee_id/salary_records/:id`

Rule: salary period tidak boleh overlap per employee.

### 4.5 Employee Documents

- `GET /api/v1/employees/:employee_id/documents`
- `POST /api/v1/employees/:employee_id/documents`
- `GET /api/v1/employees/:employee_id/documents/:id/download`
- `POST /api/v1/employees/:employee_id/documents/:id/archive`

---

## 5. Career Sample Data

| employee_id | full_name | effective_date | end_date | position | department_code | employment_status | notes |
|------|------|------|------|------|------|------|------|
| B0001 | Aaron Daniel | 2024-01-10 | 2024-06-30 | Admin Operations | ADMIN | active | Initial assignment |
| B0001 | Aaron Daniel | 2024-07-01 | 2025-01-31 | CTO | CTO | active | Added technology leadership role |
| B0001 | Aaron Daniel | 2024-07-01 | null | Admin Operations | ADMIN | active | Dual role active with CTO |
| B0001 | Aaron Daniel | 2025-02-01 | null | Chief Technology Officer | CTO | active | Promotion title normalized |

---

## 6. Testing and Quality Gates

- API request specs untuk semua endpoint utama HR.
- Policy specs untuk semua aksi sensitif.
- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
