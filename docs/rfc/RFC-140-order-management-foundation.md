# RFC-140 Order Management Foundation

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-140 |
| Module | Order Management Foundation |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, RFC-101, RFC-111, RFC-130 |

---

## 1. Summary

RFC ini menetapkan keputusan fase awal order management saat storefront aktif:

- order management tetap di API monolith yang sama
- operasional order dilakukan melalui admin-web dengan role segregation ketat

Tujuan: delivery cepat, kontrol akses sensitif aman, dan evolusi arsitektur berbasis metrik nyata.

## Related Documents

- ARCH-000 Foundation Architecture
- RFC-101 Access Control and Role Matrix (HR)
- RFC-111 Company-Scoped Authorization
- RFC-130 Promotion and Voucher Engine

---

## 2. Context

Setelah storefront berjalan, user operasional akan bertambah dan tidak semua user internal boleh mengakses modul sensitif seperti salary/promotion/voucher.

Sistem membutuhkan:

- pemisahan akses berdasarkan role
- batas domain admin internal vs storefront domain
- keputusan pragmatis untuk penempatan order management

---

## 3. Decision

### 3.1 Order Management Placement

- Fase awal: order domain tetap di API existing.
- Admin-web tetap menjadi backoffice untuk manajemen order internal.
- Tidak membuat service terpisah pada fase awal.

### 3.2 Access Segregation

- `super_admin`: akses penuh termasuk modul sensitif.
- `admin_company` dan `admin_storefront_ops`: akses order operasional sesuai scope.
- Role non-super-admin tidak boleh mengakses `promotion`, `voucher`, `salary`.

### 3.3 Domain Boundary

- Auth domain admin internal terpisah dari auth domain storefront customer.
- Endpoint management campaign dan salary hanya untuk admin internal `super_admin`.

---

## 4. Why Not Split Service Now

- Beban operasional awal lebih membutuhkan kecepatan eksekusi fitur dibanding overhead service split.
- Satu API memudahkan konsistensi policy, audit, dan data integrity lintas product-inventory-order.
- Split terlalu dini menambah biaya integrasi, observability, dan deploy orchestration.

---

## 5. Service Split Triggers (Future)

Order service dipertimbangkan terpisah jika salah satu kondisi terpenuhi secara konsisten:

- throughput order tinggi dan stabil sehingga deployment domain lain mengganggu SLA order
- queue latency order processing mengganggu target bisnis
- kebutuhan failure isolation order meningkat
- cadence perubahan order jauh lebih cepat daripada domain lain
- kebutuhan scaling independen order terbukti dari metrik produksi

---

## 6. Rollout Plan

1. Finalisasi policy role segregation di API dan menu guard admin-web.
2. Implement order backoffice flows untuk role operasional scoped.
3. Pastikan modul sensitif tetap super_admin only.
4. Tambahkan observability baseline untuk metrik order throughput/latency/error.
5. Review trigger split service secara periodik.

---

## 7. Testing and Governance

- Policy tests wajib untuk akses order allowed/forbidden per role.
- Policy tests wajib memastikan deny ke modul sensitif untuk non-super-admin.
- Audit log wajib untuk aksi sensitif dan perubahan status order penting.
