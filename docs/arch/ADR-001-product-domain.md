# ADR-001 - Product Domain Model

## Document Information

| Item     | Value                |
| -------- | -------------------- |
| Document | ADR-001              |
| Title    | Product Domain Model |
| Status   | Accepted             |
| Version  | 1.0                  |
| Owner    | Engineering Team     |
| Date     | YYYY-MM-DD           |

---

# 1. Context

Commerce OS akan menjadi **Product Information Management (PIM)** sekaligus fondasi menuju **Order Management System (OMS)**.

Product yang dikelola harus dapat dipublikasikan ke berbagai sales channel seperti:

* Storefront
* Shopee
* Tokopedia
* TikTok Shop
* Marketplace lainnya

Masing-masing marketplace memiliki model data yang berbeda.

Oleh karena itu Commerce OS **tidak boleh mengikuti struktur marketplace tertentu**, tetapi harus memiliki model domain yang independen.

---

# 2. Decision

Commerce OS menggunakan model:

```text
Product (SPU)
        │
        ▼
Product Variant (SKU)
```

Product merupakan representasi barang secara umum.

Variant merupakan unit yang benar-benar dijual dan dikelola stoknya.

---

# 3. Domain Model

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
 Product (SPU)
      │
 ┌────┼──────────────────────────────────────┐
 │    │           │           │              │
 ▼    ▼           ▼           ▼              ▼
Images Description Theme Occasion Collection
      │
      ▼
Product Attributes
      │
      ▼
Product Variants (SKU)
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Price Stock Variant Attributes
      │
      ▼
Marketplace Listing
```

---

# 4. Product (SPU)

Product adalah representasi produk yang dilihat oleh customer.

Product memiliki informasi yang sama untuk seluruh variant.

Contoh:

```text
Goodie Bag Dino
```

Product memiliki:

* Product Code
* Product Name
* Slug
* Description
* Images
* Theme
* Occasion
* Collection
* Product Attributes

Product **tidak** memiliki:

* Price
* Stock
* Barcode

---

# 5. Product Variant (SKU)

Variant merupakan unit inventory yang dijual.

Setiap Variant memiliki:

* SKU
* Barcode
* Price
* Stock
* Variant Attributes
* Marketplace Mapping

Contoh:

| Product         | Variant     |
| --------------- | ----------- |
| Goodie Bag Dino | 15x20 Green |
| Goodie Bag Dino | 20x30 Green |
| Goodie Bag Dino | 15x20 Blue  |
| Goodie Bag Dino | 20x30 Blue  |

---

# 6. Product Code

Product memiliki Product Code yang bersifat permanen.

Contoh:

```text
GB001
PB001
BX001
```

Product Code merupakan identitas SPU.

Product Code tidak berubah walaupun Product Name berubah.

---

# 7. SKU

SKU merupakan identitas Variant.

Format standar:

```text
<ProductCode>-<Variant>
```

Contoh:

```text
GB001-1520-GRN
GB001-2030-GRN
GB001-1520-BLU
```

SKU dihasilkan otomatis oleh sistem.

Admin tidak menginput SKU secara manual.

---

# 8. Barcode

Barcode merupakan identitas untuk proses scanning.

Barcode dimiliki oleh Variant.

Product tidak memiliki barcode.

Jika supplier telah menyediakan barcode resmi, barcode tersebut digunakan.

Jika tidak tersedia, Commerce OS dapat menghasilkan barcode internal.

---

# 9. Slug

Slug digunakan untuk URL dan SEO.

Slug hanya dimiliki Product.

Variant tidak memiliki slug.

Contoh:

```text
goodie-bag-dino
```

---

# 10. Product Images

Product memiliki gallery image.

Contoh:

* Cover
* Gallery 1
* Gallery 2
* Gallery 3

Image digunakan oleh seluruh Variant.

Di masa depan Commerce OS dapat mendukung Variant Image.

Contoh:

```text
Green

↓

Green Image

Blue

↓

Blue Image
```

---

# 11. Product Description

Description dimiliki oleh Product.

Description menggunakan Rich Text JSON.

Commerce OS menyimpan Rich Text sebagai source of truth.

Description akan dirender menjadi:

* HTML (Marketplace)
* HTML (Storefront)
* PDF (Opsional)

Commerce OS tidak menyimpan HTML sebagai source utama.

---

# 12. Product Attributes

Product Attribute merupakan attribute yang sama untuk seluruh Variant.

Contoh:

* Material
* Food Grade
* Thickness
* Ziplock
* Character

Perubahan Product Attribute tidak membuat SKU baru.

---

# 13. Variant Attributes

Variant Attribute merupakan attribute yang membedakan SKU.

Contoh:

* Size
* Color
* Length
* Volume

Setiap kombinasi Variant Attribute menghasilkan satu SKU.

---

# 14. Price

Price dimiliki oleh Variant.

Alasan:

* Harga dapat berbeda antar ukuran.
* Harga dapat berbeda antar warna.
* Marketplace biasanya mengelola harga pada level SKU.

Product tidak memiliki harga.

---

# 15. Stock

Stock dimiliki oleh Variant.

Alasan:

* Inventory disimpan berdasarkan SKU.
* Order menggunakan SKU.
* Marketplace melakukan update stock berdasarkan SKU.

Product tidak memiliki stock.

---

# 16. Marketplace

Commerce OS menggunakan konsep Channel Agnostic.

Commerce OS tidak mengikuti struktur marketplace tertentu.

Mapping dilakukan melalui layer Marketplace.

```text
Commerce Product
        │
        ▼
Marketplace Product
        │
        ▼
Marketplace Variant
```

Setiap marketplace memiliki:

* External Product ID
* External Variant ID
* Product URL
* Sync Status

---

# 17. Theme

Theme merupakan metadata produk.

Contoh:

* Dino
* Frozen
* Floral
* Pastel

Satu Product dapat memiliki lebih dari satu Theme.

Theme bukan Category.

---

# 18. Occasion

Occasion merupakan metadata event.

Contoh:

* Ramadan
* Christmas
* Birthday
* Wedding

Satu Product dapat memiliki lebih dari satu Occasion.

Occasion bukan Category.

---

# 19. Collection

Collection merupakan grouping untuk kebutuhan marketing.

Contoh:

* New Arrival
* Best Seller
* Promo 12.12
* Ramadan 2027

Collection bukan Category.

---

# 20. Category Hierarchy

Commerce OS menggunakan hierarchy berikut:

```text
Department
      │
Category
      │
Sub Category
      │
Product Type
      │
Product
```

Category digunakan untuk klasifikasi produk.

Theme, Occasion, dan Collection tidak memengaruhi hierarchy.

---

# 21. Marketplace Independence

Commerce OS tidak menyimpan struktur marketplace.

Contoh:

Shopee membutuhkan:

* Category ID
* Brand ID
* Attribute
* Logistics

Data tersebut akan dipetakan oleh Marketplace Adapter.

Perubahan struktur marketplace tidak boleh memengaruhi Product Domain.

---

# 22. Future Compatibility

Model ini dirancang agar mendukung:

* Multi Warehouse
* Bundle Product
* Product Kit
* Marketplace Publish
* Inventory Management
* Order Management
* Promotion Engine
* Recommendation Engine
* AI Product Generator

Tanpa mengubah struktur Product Domain.

---

# 23. Consequences

## Positive

* Product menjadi Source of Truth.
* Tidak bergantung pada marketplace tertentu.
* Mendukung multiple marketplace.
* Inventory menjadi sederhana karena berbasis SKU.
* Mudah dikembangkan menjadi OMS.

## Negative

* Jumlah tabel lebih banyak dibanding desain sederhana.
* Membutuhkan proses mapping saat publish ke marketplace.
* Memerlukan Marketplace Adapter.

Trade-off ini diterima karena memberikan fleksibilitas dan skalabilitas jangka panjang.

---

# 24. Related Documents

* TDD-000 Engineering Standards
* TDD-001 Reference Data Framework
* TDD-010 Product Aggregate (Upcoming)
* ADR-002 Marketplace Publishing Strategy (Planned)
