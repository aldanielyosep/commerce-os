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
| Depends On | ARCH-000, RFC-100, RFC-110, TDD-100, PRD-110 |

---

## 1. Summary

Mendefinisikan matriks akses role internal agar policy API dan UI guard konsisten dengan prinsip least-privilege.

Modul sensitif bisnis (`salary`, `promotion`, `voucher`) dibatasi hanya untuk `super_admin` (C-level).

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-100 HR Foundation
- PRD-110 Companies Foundation
- TDD-100 HR API Contract
- RFC-100 HR Foundation Implementation
- RFC-102 Employee Document Lifecycle
- RFC-110 Companies Foundation

---

## 2. Roles

- `super_admin`: full access + sensitive actions (C-level only).
- `admin_company`: operasional company/product non-sensitif, berbasis company scope.
- `admin_storefront_ops`: operasional order/storefront non-sensitif.

Catatan transisi:

- Role `admin` legacy dipetakan bertahap ke `admin_company` atau `admin_storefront_ops`.

---

## 3. Permission Matrix

| Feature | Action | super_admin | admin_company | admin_storefront_ops |
|------|------|------|------|------|
| Employee | View/List | Allow | Allow | Deny |
| Employee | Create/Update | Allow | Allow | Deny |
| Employee | Terminate | Allow | Deny | Deny |
| Employee | Soft Delete | Allow | Deny | Deny |
| Department | CRUD | Allow | Allow | Deny |
| Department Assignment | Assign/Remove | Allow | Allow | Deny |
| Career History | Create/Update/View | Allow | Allow | Deny |
| Salary History | View | Allow | Deny | Deny |
| Salary History | Create/Update | Allow | Deny | Deny |
| Employee Documents | Upload/View/Download/Archive | Allow | Allow | Deny |
| Companies | CRUD | Allow | Allow (scoped) | Deny |
| Product SPU/Variant | CRUD | Allow | Allow (scoped) | Deny |
| Promotion | Create/Update/Delete | Allow | Deny | Deny |
| Promotion | View/List | Allow | Deny | Deny |
| Voucher | Create/Update/Delete | Allow | Deny | Deny |
| Voucher | View/List | Allow | Deny | Deny |
| Orders | View/List | Allow | Allow (scoped) | Allow (scoped) |
| Orders | Fulfillment/Status Update | Allow | Allow (scoped) | Allow (scoped) |
| Users | Create/Disable/Delete | Allow | Deny | Deny |
| Users | Role Change | Allow | Deny | Deny |
| Audit Logs | View | Allow | Deny | Deny |

---

## 4. Enforcement

- Enforcement utama di API (Pundit policy).
- UI guard di admin-web hanya sebagai layer tambahan.
- Semua akses ditolak harus return 401/403 sesuai konteks.
- Role non-super-admin wajib lolos company scope check untuk resource scoped.

---

## 5. Security Notes

- Endpoint user management dibatasi ketat ke `super_admin`.
- Modul sensitif (`salary`, `promotion`, `voucher`) dibatasi ketat ke `super_admin`.
- Aksi sensitif (role change, campaign mutation, salary mutation, delete user, delete employee) wajib audit log.

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
4. Migrasi role `admin` legacy ke `admin_company` atau `admin_storefront_ops`.
5. Review ulang permission matrix setelah UAT HR dan storefront ops.
