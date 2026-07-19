# RFC-010 Product Aggregate

> Commerce OS Engineering RFC

---

# Document Information

| Item       | Value                                                                         |
| ---------- | ----------------------------------------------------------------------------- |
| RFC        | RFC-010                                                                       |
| Module     | Product Aggregate                                                             |
| Status     | Draft                                                                         |
| Version    | 1.1                                                                           |
| Owner      | Engineering Team                                                              |
| Depends On | STD-000 Engineering Standards, STD-001 Reference Data, ADR-001 Product Domain |

---

# 1. Executive Summary

## Overview

Product Aggregate merupakan inti dari Product Information Management (PIM) pada Commerce OS.

Module ini bertanggung jawab mengelola seluruh informasi dasar produk yang bersifat **Product (SPU)**.

Commerce OS menjadi **Single Source of Truth** untuk seluruh informasi produk pada level **Product (SPU)** sebelum dipublikasikan ke berbagai Sales Channel.

Batas fase saat ini: fokus hanya pada Product (SPU). Domain Variant, Barcode, Pricing, dan Inventory diimplementasikan pada RFC lanjutan.

Product Aggregate **tidak** mengelola:

* Inventory
* Stock
* Price
* Marketplace
* Order

Module tersebut akan dibahas pada RFC terpisah.

---

## Goals

RFC ini bertujuan membangun Product Aggregate yang:

* Independent terhadap Marketplace
* Mudah dikembangkan
* Mudah di-maintain
* Siap menjadi fondasi OMS
* Siap menjadi fondasi Marketplace Integration
* Mendukung AI Generated Content di masa depan
* Menggunakan workflow berbasis State Machine (AASM)

---

## Success Criteria

Setelah RFC ini selesai diimplementasikan, Commerce OS mampu:

* Mengelola Product sebagai SPU
* Mengelola Product Images
* Mengelola Product Description
* Mengelola Product Metadata
* Mendukung Duplicate Product
* Mendukung Archive Product
* Menjadi Source of Truth untuk module lain
* Mendukung Product Lifecycle menggunakan State Machine

---

# 2. Problem Statement

Saat ini sebagian besar marketplace memiliki struktur Product yang berbeda.

| Marketplace | Product Model     |
| ----------- | ----------------- |
| Shopee      | Product + Model   |
| Tokopedia   | Product + Variant |
| TikTok Shop | Product + SKU     |
| Shopify     | Product + Variant |

Jika Commerce OS mengikuti struktur marketplace tertentu, maka perubahan marketplace akan memengaruhi desain sistem.

Dampaknya:

* Coupling tinggi
* Sulit menambah marketplace baru
* Sulit melakukan migrasi
* Sulit mengembangkan fitur internal

Commerce OS harus memiliki Product Domain sendiri yang independen terhadap marketplace.

---

# 3. Design Principles

## 3.1 Marketplace Agnostic

Commerce OS tidak mengikuti struktur marketplace tertentu.

Marketplace hanya bertindak sebagai consumer.

```text
Commerce OS
        │
        ▼
Marketplace Adapter
        │
        ▼
Shopee / Tokopedia / TikTok / Storefront
```

---

## 3.2 Product is Source of Truth

Semua informasi Product berasal dari Commerce OS.

Marketplace tidak boleh menjadi sumber data utama.

---

## 3.3 Separation of Responsibility

Setiap Aggregate hanya bertanggung jawab terhadap satu domain.

| Aggregate   | Responsibility      |
| ----------- | ------------------- |
| Product     | Product Information |
| Variant     | SKU                 |
| Inventory   | Stock               |
| Marketplace | Publishing          |
| Order       | Transaction         |

---

## 3.4 Product First

Seluruh module bergantung pada Product.

```text
Product
      │
      ├── Variant
      ├── Marketplace
      ├── Inventory
      ├── Promotion
      └── Order
```

---

## 3.5 Workflow Driven

Entity yang memiliki lifecycle menggunakan **State Machine (AASM)**.

Reference Data tetap menggunakan Enum sederhana.

Seluruh perubahan state dilakukan melalui **Service Object**.

Contoh:

```ruby
Products::ActivateService.call(product)
Products::ArchiveService.call(product)
```

Tidak diperbolehkan:

```ruby
product.activate!
product.archive!
```

langsung dari Controller, Job, maupun Model lain.

---

# 4. Scope

## In Scope

### Product

* Create Product
* Update Product
* Detail Product
* Duplicate Product
* Activate Product
* Deactivate Product
* Archive Product
* Restore Product

---

### Product Images

* Upload Images
* Delete Images
* Reorder Images
* Set Cover Image

---

### Product Description

* Short Description
* Rich Text Description (JSON)

---

### Product Metadata

* Theme
* Occasion
* Collection

---

## Out of Scope

* Variant
* SKU
* Barcode
* Price
* Stock
* Warehouse
* Marketplace
* Publish
* Search Engine
* SEO
* AI Generated Description
* Import / Export
* Channel-specific description override (akan dibahas di RFC Marketplace Integration)

---

# 5. Business Context

Commerce OS menggunakan konsep **Product (SPU)**.

Contoh:

```text
Goodie Bag Dino
```

Product memiliki:

* Product Code
* Product Name
* Description
* Images
* Theme
* Occasion
* Collection

Product tidak memiliki:

* SKU
* Barcode
* Stock
* Price

Seluruh informasi tersebut dimiliki oleh Product Variant.

---

# 6. Product Lifecycle

Product menggunakan **AASM** sebagai workflow engine.

State Diagram

```text
                 activate
 Draft ----------------------► Active
   │                             │
   │ archive                     │ deactivate
   ▼                             ▼
Archived ◄-------------------- Inactive
      ▲
      │ restore
      └────────────────────────────
```

## Supported States

| State    | Description                           |
| -------- | ------------------------------------- |
| Draft    | Initial State                         |
| Active   | Product siap digunakan                |
| Inactive | Product dihentikan sementara          |
| Archived | Product dihentikan dan di-soft delete |

Future workflow (di RFC lain):

```text
Draft
   │
   ▼
Pending Review
   │
   ▼
Approved
   │
   ▼
Publishing
   │
   ▼
Published
```

---

# 7. State Transition Rules

## Activate

Allowed From

* Draft

Validation:

* Product Code tersedia
* Product Name tersedia
* Department dipilih
* Category dipilih
* Product Type dipilih
* Minimal satu Cover Image tersedia

Jika salah satu validasi gagal maka Product tidak dapat diaktifkan.

---

## Deactivate

Allowed From

* Active

Product tidak dapat digunakan untuk transaksi baru.

---

## Archive

Allowed From

* Draft
* Active
* Inactive

Archive menggunakan **Discard** (soft delete).

---

## Restore

Allowed From

* Archived

Restore mengubah state menjadi **Inactive**.

Product harus direview kembali sebelum diaktifkan.

---

# 8. Product Ownership

Product merupakan **Aggregate Root**.

```text
Product
│
├── Images
├── Description
├── Theme
├── Occasion
└── Collection
```

Product bertanggung jawab terhadap konsistensi seluruh entity tersebut beserta lifecycle-nya.

---

# 9. Domain Model

```text
Department
      │
Category
      │
Sub Category
      │
Product Type
      │
      ▼
+----------------------+
|      Product         |
+----------------------+
| Product Code         |
| Product Name         |
| Slug                 |
| Description          |
| Status (AASM)        |
+----------------------+
      │
      ├──────────────┐
      │              │
      ▼              ▼
 Images         Metadata
                     │
         ┌───────────┼────────────┐
         ▼           ▼            ▼
      Theme      Occasion    Collection
```

---

# 10. Business Rules

## Product

- Product Name wajib diisi.
- Product Code wajib unik dalam satu Company (Tenant).
- Product Code tidak dapat diubah setelah Product berhasil dibuat.
- Slug dihasilkan otomatis dari Product Name.
- Slug dapat berubah apabila Product Name berubah.
- Description menggunakan Rich Text JSON sebagai Source of Truth.
- Product minimal memiliki satu Cover Image sebelum dapat diaktifkan.
- Product dapat di-Duplicate.
- Product dapat di-Archive.
- Product dapat di-Restore.

---

## Images

- Product minimal memiliki satu gambar.
- Product hanya memiliki satu Cover Image.
- Cover Image dapat diubah.
- Urutan gambar dapat diubah (drag & drop).
- Seluruh gambar disimpan menggunakan Active Storage.
- Validasi extension wajib: `jpg`, `jpeg`, `png`, `webp`.
- Maksimal ukuran file image per upload: 5 MB (configurable).
- File yang tidak lolos validasi extension/size harus ditolak dengan error validasi yang jelas.
- Standar rasio utama gambar produk: 1:1 (square) agar kompatibel lintas marketplace.
- Resolusi rekomendasi gambar utama: 1200x1200 px (minimum 1000x1000 px).

---

## Metadata

Product dapat memiliki:

- Banyak Theme
- Banyak Occasion
- Banyak Collection

Metadata tidak memengaruhi Product Code maupun Product Variant.

---

## Lifecycle

Product menggunakan workflow berbasis **AASM**.

Perubahan state hanya boleh dilakukan melalui Service Object.

State yang didukung pada RFC ini:

- Draft
- Active
- Inactive
- Archived

---

## Validation Before Activation

Product hanya dapat diaktifkan apabila memenuhi seluruh syarat berikut:

- Product Code tersedia.
- Product Name tersedia.
- Department dipilih.
- Category dipilih.
- Product Type dipilih.
- Minimal satu Cover Image tersedia.

Jika salah satu syarat tidak terpenuhi maka proses Activate ditolak.

---

# 11. Technical Decisions

## 11.1 Product Identifier

Commerce OS menggunakan tiga jenis identifier.

| Field | Purpose | Editable |
|------|----------|----------|
| id | Internal Primary Key | ❌ |
| product_code | Business Identifier | ✅ Sebelum Create |
| slug | URL Identifier | Auto Generate |

### ID

- Menggunakan bigint (default Rails).
- Digunakan untuk seluruh relasi database.
- Tidak pernah ditampilkan kepada user.

---

## 11.2 Product Code Strategy

Commerce OS menggunakan strategi **Hybrid Product Code**.

### Create Flow

```text
Create Product
      │
      ▼
Generate Product Code
      │
      ▼
Admin May Edit
      │
      ▼
Save Product
      │
      ▼
Product Code Locked
```

### Rules

- Product Code dihasilkan otomatis ketika halaman Create Product dibuka.
- Admin dapat mengubah Product Code sebelum Product pertama kali disimpan.
- Setelah Product berhasil dibuat, Product Code menjadi immutable.
- Product Code digunakan sebagai Business Identifier.
- Product Code tidak boleh mengandung informasi Category, Product Type, maupun Product Name.

Contoh:

```text
BGS000001
BGS000002
BGS000003
```

---

## 11.3 Sequence Strategy

Running Number menggunakan sequence per Company.

Contoh:

Company

```text
Bungkusand
```

Sequence

```text
BGS000001
BGS000002
BGS000003
```

Company lain

```text
ABC000001
ABC000002
```

Sequence antar Company saling independen.

---

## 11.4 Product Code Format

Format default:

```text
<CompanyPrefix><RunningNumber>
```

Contoh:

```text
BGS000001
BGS000002
BGS000003
```

Running Number menggunakan minimal enam digit dengan padding nol.

---

## 11.5 Sequence Storage

Sequence tidak menggunakan:

```sql
MAX(product_code)
```

Sequence disimpan pada tabel khusus.

Contoh:

| Column | Description |
|---------|-------------|
| id | Primary Key |
| company_id | Company |
| name | Sequence Name |
| prefix | Product Prefix |
| next_number | Next Running Number |

Contoh data:

| company_id | name | prefix | next_number |
|------------|------|--------|------------:|
| 1 | product_code | BGS | 153 |

Flow:

```text
Generate
    │
    ▼
BGS000153
    │
    ▼
Increment Sequence
    │
    ▼
154
```

Pendekatan ini aman terhadap race condition dan concurrent request.

---

## 11.6 Product Code Immutability

Setelah Product berhasil dibuat:

- Product Code tidak dapat diubah.
- Product Code tetap digunakan walaupun:
  - Product Name berubah.
  - Category berubah.
  - Product Type berubah.

Hal ini menjaga konsistensi terhadap:

- Product Variant
- Marketplace Mapping
- Inventory
- Order
- Reporting
- External Integration

---

## 11.7 Slug Strategy

Slug digunakan untuk URL.

Contoh:

```text
goodie-bag-dino
standing-pouch-pastel
```

Rules:

- Slug dibuat otomatis dari Product Name.
- Slug dapat berubah ketika Product Name berubah.
- Slug bukan Business Identifier.
- Slug harus unik.

---

## 11.8 Description Strategy

Commerce OS menyimpan Description dalam format Rich Text JSON.

Rich Text JSON menjadi Source of Truth.

Output dapat dirender menjadi:

- HTML (Storefront)
- HTML (Marketplace)
- PDF (Future)

HTML tidak disimpan sebagai Source of Truth.

---

## 11.9 Image Strategy

Commerce OS mendukung:

- Cover Image
- Gallery Image
- Image Ordering

Validation baseline:

- Extension yang diizinkan: `jpg`, `jpeg`, `png`, `webp`.
- Batas ukuran file default: 5 MB per file (dapat dikonfigurasi).

Standar ukuran untuk kompatibilitas ecommerce umum:

| Type | Aspect Ratio | Recommended | Minimum |
|------|--------------|-------------|---------|
| Product Main Image | 1:1 | 1200x1200 px | 1000x1000 px |
| Product Gallery Image | 1:1 | 1200x1200 px | 1000x1000 px |

Normalisasi image:

- Simpan file original.
- Generate turunan web-optimized untuk delivery frontend/marketplace adapter.
- Jangan melakukan crop destruktif otomatis tanpa kontrol user.

Future Roadmap:

- Variant Image (RFC-011)

---

## 11.10 State Machine Strategy

Product menggunakan AASM.

Supported State:

```text
Draft
   │
   ▼
Active
   │
   ▼
Inactive
   │
   ▼
Archived
```

Supported Event:

| Event | From | To |
|--------|------|----|
| activate | Draft | Active |
| deactivate | Active | Inactive |
| archive | Draft, Active, Inactive | Archived |
| restore | Archived | Inactive |

---

## 11.11 Service Object Rule

Seluruh perubahan state dilakukan melalui Service Object.

Contoh:

```ruby
Products::ActivateService.call(product)
Products::DeactivateService.call(product)
Products::ArchiveService.call(product)
Products::RestoreService.call(product)
```

Tidak diperbolehkan:

```ruby
product.activate!
product.archive!
```

langsung dari:

- Controller
- Job
- Model lain

Seluruh side effect seperti Audit Log, Event Publishing, Notification, maupun Background Job harus dipicu dari Service Object.

---

## 12. Technical Decisions

Dokumen ini menetapkan keputusan arsitektur yang wajib diikuti selama implementasi Product Aggregate.

---

## 12.1 Domain

- Product merupakan **Aggregate Root**.
- Product adalah representasi **SPU (Standard Product Unit)**.
- Product menjadi **Single Source of Truth**.
- Product tidak menyimpan informasi Price, Stock, maupun SKU.

---

## 12.2 State Management

- Product menggunakan **AASM** sebagai workflow engine.
- State awal adalah **Draft**.
- Seluruh perubahan state dilakukan melalui **Service Object**.
- Controller, Job, maupun Model lain tidak diperbolehkan memanggil event AASM secara langsung.

---

## 12.3 Soft Delete

- Soft Delete menggunakan **Discard**.
- Data tetap tersedia untuk kebutuhan audit dan histori.
- Restore dilakukan menggunakan `RestoreService`.

---

## 12.4 API Response

Seluruh response API menggunakan **Blueprinter**.

Blueprint minimal:

- ProductSummaryBlueprint
- ProductDetailBlueprint

Blueprint tidak boleh berisi business logic.

---

## 12.5 Authorization

Authorization menggunakan **Pundit**.

Minimal Policy:

- index?
- show?
- create?
- update?
- activate?
- deactivate?
- archive?
- restore?
- duplicate?

---

## 12.6 Background Job

Background Job menggunakan **GoodJob**.

RFC-010 belum membutuhkan Background Job.

Future:

- Generate Search Index
- Marketplace Sync
- AI Description Generation
- Notification

---

## 12.7 Query Strategy

Seluruh pencarian menggunakan **Query Object**.

Contoh:

```ruby
Products::SearchQuery
```

Controller tidak diperbolehkan berisi query ActiveRecord yang kompleks.

---

## 12.8 Business Logic

Seluruh business logic berada pada **Service Object**.

Contoh:

```ruby
Products::CreateService
Products::UpdateService
Products::DuplicateService
Products::ActivateService
Products::DeactivateService
Products::ArchiveService
Products::RestoreService
```

Model hanya bertanggung jawab terhadap:

- Association
- Validation
- Scope sederhana
- State Machine

---

## 12.9 Controller Responsibility

Controller hanya bertanggung jawab terhadap:

- Authentication
- Authorization
- Parameter Validation
- Memanggil Service Object
- Mengembalikan Response

Controller tidak boleh berisi:

- Business Logic
- Query Kompleks
- State Transition

---

## 12.10 Performance

Implementasi wajib memperhatikan:

- Eager Loading
- Pagination menggunakan Pagy
- Index pada kolom yang sering dicari
- N+1 Query Prevention

---

## 12.11 Multi Tenancy

Seluruh Product dimiliki oleh satu Company.

Semua query wajib dibatasi berdasarkan Company.

Product Code bersifat unik dalam satu Company.

---

## 12.12 Future Compatibility

Desain Product Aggregate harus kompatibel dengan:

- RFC-011 Product Variant
- RFC-012 Marketplace Integration
- RFC-013 Product Search
- RFC-014 Product Import & Export
- RFC-015 Product Approval Workflow
- RFC-020 Inventory Aggregate
- RFC-030 Order Aggregate

Implementasi pada RFC ini tidak boleh menghambat pengembangan RFC berikutnya.

---

# 13. Future Roadmap

RFC berikutnya:

* RFC-011 Product Variant
* RFC-012 Product Marketplace
* RFC-013 Product Search
* RFC-014 Product Import / Export
* RFC-015 Product Approval Workflow

Workflow Product akan berkembang tanpa mengubah Product Domain.
