# RFC-101 Access Control and Role Matrix (HR)

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-101 |
| Module | HR Access Control |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, RFC-100, TDD-100 |

---

## 1. Summary

Mendefinisikan matriks akses role `super_admin` dan `admin` agar policy API dan UI guard konsisten.

---

## 2. Roles

- `super_admin`: full access + sensitive actions.
- `admin`: operational access terbatas.

---

## 3. Permission Matrix

| Feature | Action | super_admin | admin |
|------|------|------|------|
| Employee | View/List | Allow | Allow |
| Employee | Create/Update | Allow | Allow |
| Employee | Terminate | Allow | Allow |
| Employee | Soft Delete | Allow | Deny |
| Department | CRUD | Allow | Allow |
| Department Assignment | Assign/Remove | Allow | Allow |
| Career History | Create/Update/View | Allow | Allow |
| Salary History | View | Allow | Allow |
| Salary History | Create/Update | Allow | Allow |
| Employee Documents | Upload/View/Download/Archive | Allow | Allow |
| Users | Create/Disable/Delete | Allow | Deny |
| Users | Role Change | Allow | Deny |
| Audit Logs | View | Allow | Deny |

---

## 4. Enforcement

- Enforcement utama di API (Pundit policy).
- UI guard di admin-web hanya sebagai layer tambahan.
- Semua akses ditolak harus return 401/403 sesuai konteks.

---

## 5. Security Notes

- Endpoint user management dibatasi ketat ke `super_admin`.
- Aksi sensitif (role change, delete user, delete employee) wajib audit log.

---

## 6. Testing Strategy

- Policy specs per role/action.
- Request specs untuk positive, forbidden, dan unauthorized cases.
- Regression tests untuk aksi sensitif.

---

## 7. Rollout

1. Finalisasi Pundit policy matrix per resource.
2. Sinkronkan guard role di admin-web pages.
3. Tambahkan test coverage untuk cases deny.
4. Review ulang permission matrix setelah UAT HR.
