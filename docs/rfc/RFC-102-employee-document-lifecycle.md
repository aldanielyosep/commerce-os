# RFC-102 Employee Document Lifecycle

## Document Information

| Item | Value |
|------|-------|
| RFC | RFC-102 |
| Module | Employee Documents |
| Status | Draft |
| Version | 1.0 |
| Owner | Engineering Team |
| Date | 2026-07-16 |
| Depends On | ARCH-000, RFC-100, RFC-110, TDD-100, PRD-110 |

---

## 1. Summary

Mendefinisikan lifecycle dokumen employee dari upload sampai archive dengan storage S3-compatible.

## Related Documents

- ARCH-000 Foundation Architecture
- PRD-100 HR Foundation
- PRD-110 Companies Foundation
- TDD-100 HR API Contract
- RFC-100 HR Foundation Implementation
- RFC-101 Access Control and Role Matrix (HR)
- RFC-110 Companies Foundation

---

## 2. Scope

### In Scope

- Upload dokumen employee
- List dokumen employee
- Download dokumen via signed URL
- Archive dokumen via soft delete
- Audit metadata perubahan dokumen

### Out of Scope

- OCR/extraction konten dokumen
- Workflow approval dokumen berjenjang
- Public sharing link tanpa auth

---

## 3. Document Types

Target enum:

- `national_id` (KTP)
- `tax_id` (NPWP)
- `bpjs_kesehatan`
- `bpjs_ketenagakerjaan`
- `employment_contract`
- `passport`
- `driver_license`
- `education_certificate`
- `other`

Catatan: enum aktif saat ini perlu delta implementasi untuk tipe BPJS eksplisit.

---

## 4. File Rules

- Allowed: PDF, JPG, PNG, DOCX.
- Max size: 20 MB.
- File wajib attached saat create.
- Storage key mengikuti standar employee + sequence.

Contoh storage key:

```text
documents/B0001/national_id_001.pdf
```

---

## 5. Lifecycle

1. Upload -> validate -> save blob -> save metadata.
2. List -> tampil metadata dokumen.
3. Download -> signed URL dengan TTL.
4. Archive -> soft delete record.

---

## 6. Security and Audit

- Semua endpoint dokumen wajib auth.
- Download harus policy-protected.
- Signed URL tidak permanen.
- Simpan audit trail (`uploaded_by`, perubahan metadata, archive action).

---

## 7. API Contract Notes

- `GET /api/v1/employees/:employee_id/documents`
- `POST /api/v1/employees/:employee_id/documents`
- `GET /api/v1/employees/:employee_id/documents/:id/download`
- `POST /api/v1/employees/:employee_id/documents/:id/archive`

Download response minimum:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://signed-url",
    "expires_at": "2026-07-16T10:00:00Z"
  },
  "meta": {}
}
```

---

## 8. Testing and Gates

- Model specs untuk validasi type/size.
- Request specs untuk upload/download/archive.
- Policy specs untuk role access dokumen.
- Coverage per file >= 80%.
- Coverage overall >= 90%.
- Lint pass.
- Security checks pass.
