# PRD - Product Master (Commerce OS)

## Document Information

| Item     | Value          |
| -------- | -------------- |
| Module   | Product Master |
| Platform | Admin Web      |
| Version  | 1.0            |
| Status   | Draft          |
| Owner    | Product Team   |

---

# 1. Objective

Membangun **Product Information Management (PIM)** sebagai **Single Source of Truth** untuk seluruh produk.

Product Master akan menjadi sumber data utama yang nantinya dapat dipublikasikan ke berbagai sales channel seperti:

* Shopee
* Tokopedia
* TikTok Shop
* Storefront
* Marketplace lainnya

Commerce OS **tidak menyimpan struktur data marketplace**, tetapi menyimpan data produk yang bersifat netral (channel agnostic). Proses publish dilakukan melalui adapter/integration service masing-masing marketplace.

---

# 2. Goals

* Centralized Product Master
* Mendukung multiple product images
* Mendukung multiple variants
* Mendukung marketplace publishing
* Mudah diintegrasikan dengan marketplace API
* Mudah dikembangkan menjadi OMS/PIM di masa depan

---

# 3. Product Hierarchy

```text
Department
    │
Category
    │
Sub Category
    │
Product Type
    │
Product (SPU)
    │
Variants (SKU)
```

Contoh:

```text
Packaging
    │
Gift & Souvenir
    │
Goodie Bag
    │
Goodie Bag
    │
Goodie Bag Dino
    │
15x20 Green
20x30 Green
15x20 Blue
20x30 Blue
```

---

# 4. Master Data

## 4.1 Department

Contoh:

* Packaging

---

## 4.2 Category

Contoh:

* Plastic Packaging
* Paper Packaging
* Gift & Souvenir
* Accessories

---

## 4.3 Sub Category

Contoh:

* Standing Pouch
* Goodie Bag
* Paper Bag
* Cake Box
* Sticker

---

## 4.4 Product Type

Digunakan untuk menentukan attribute yang muncul pada Product.

Contoh:

* Goodie Bag
* Standing Pouch
* Paper Bag
* Cake Box
* Cake Topper

---

# 5. Product (SPU)

## Product Information

| Field                   | Required      |
| ----------------------- | ------------- |
| Product Code            | ✅             |
| Product Name            | ✅             |
| Slug                    | Auto Generate |
| Department              | ✅             |
| Category                | ✅             |
| Sub Category            | ✅             |
| Product Type            | ✅             |
| Short Description       | Optional      |
| Description (Rich Text) | Optional      |
| Status                  | ✅             |

Product adalah representasi **SPU (Standard Product Unit)**.

Product tidak menyimpan ukuran, warna, maupun harga.

---

# 6. Product Images

Satu Product dapat memiliki banyak gambar.

Field:

* Image
* Position
* Is Primary
* Alt Text

Fitur:

* Upload Multiple Images
* Drag & Drop Sorting
* Set Cover Image

---

# 7. Variant (SKU)

Variant merupakan produk yang benar-benar dijual.

Contoh:

| SKU            | Size  | Color |
| -------------- | ----- | ----- |
| GB001-1520-GRN | 15x20 | Green |
| GB001-2030-GRN | 20x30 | Green |
| GB001-1520-BLU | 15x20 | Blue  |
| GB001-2030-BLU | 20x30 | Blue  |

Variant menyimpan:

* SKU
* Barcode
* Status

Harga dan stok disimpan terpisah agar mudah dikembangkan.

---

# 8. Variant Price

Field:

* Variant
* Price
* Special Price
* Start Date
* End Date

---

# 9. Variant Stock

Field:

* Variant
* Warehouse
* Stock
* Reserved Stock

Desain mendukung multiple warehouse.

---

# 10. Product Attributes

Commerce OS menggunakan konsep **Product Type**.

Setiap Product Type menentukan attribute apa saja yang muncul saat admin membuat produk.

Contoh:

## Standing Pouch

* Material
* Width
* Height
* Thickness
* Ziplock
* Food Grade

## Goodie Bag

* Material
* Width
* Height
* Handle Type
* Character
* Isi per Pack

Attribute disimpan dalam bentuk key-value sehingga tidak menambah kolom baru setiap kali muncul kebutuhan baru.

---

# 11. Variant Attributes

Attribute yang membedakan SKU.

Contoh:

* Size
* Color

Contoh:

| Variant        | Attribute | Value |
| -------------- | --------- | ----- |
| GB001-1520-GRN | Size      | 15x20 |
| GB001-1520-GRN | Color     | Green |

---

# 12. Theme

Theme digunakan untuk mengelompokkan desain produk.

Contoh:

* Dino
* Frozen
* Pokemon
* Floral
* Minimalist
* Pastel

Satu Product dapat memiliki lebih dari satu Theme.

---

# 13. Occasion

Occasion digunakan untuk event atau musim.

Contoh:

* Ramadan
* Christmas
* Birthday
* Wedding
* Halloween

Satu Product dapat memiliki lebih dari satu Occasion.

---

# 14. Collection

Collection digunakan untuk kebutuhan marketing.

Contoh:

* New Arrival
* Best Seller
* Kids Collection
* Ramadan 2027
* Promo 12.12

Satu Product dapat masuk ke beberapa Collection.

---

# 15. Description

Description menggunakan Rich Text Editor.

Source of truth disimpan sebagai **JSON Rich Text**.

Output dapat dirender menjadi:

* HTML untuk Shopee
* HTML untuk Tokopedia
* HTML untuk TikTok Shop
* HTML untuk Storefront

Commerce OS tidak menyimpan HTML sebagai source utama.

---

# 16. Marketplace Publishing

Commerce OS menyimpan informasi publish per marketplace.

Field:

* Marketplace
* Publish Status
* External Product ID
* Product URL
* Sync Status
* Last Sync

Contoh Marketplace:

* Shopee
* Tokopedia
* TikTok Shop
* Storefront

---

# 17. SKU Standard

## Product Code

Format:

```text
GB001
PB001
SP001
BX001
```

Product Code adalah identitas Product (SPU) dan bersifat permanen.

---

## Variant SKU

Format:

```text
<ProductCode>-<Size>-<Color>
```

Contoh:

```text
GB001-1520-GRN
GB001-2030-GRN
GB001-1520-BLU
GB001-2030-BLU
```

Jika terdapat atribut tambahan:

```text
GB001-1520-GRN-OPP
```

SKU dihasilkan otomatis oleh sistem.

Admin tidak perlu mengetik SKU secara manual.

---

# 18. Barcode

Barcode bersifat opsional.

Jika supplier memiliki barcode resmi, gunakan barcode tersebut.

Jika tidak tersedia, Commerce OS dapat menghasilkan barcode internal.

Contoh:

```text
880000000001
880000000002
880000000003
```

---

# 19. Slug

Slug digunakan untuk URL dan SEO.

Contoh:

```text
goodie-bag-dino
standing-pouch-pastel
cake-box-ramadan
```

Slug hanya dimiliki Product (SPU).

Variant tidak memiliki slug.

---

# 20. Database Overview

```text
departments
    │
categories
    │
sub_categories
    │
product_types
    │
products
    ├── product_images
    ├── product_attribute_values
    ├── product_themes
    ├── product_occasions
    ├── product_collections
    ├── product_marketplaces
    │
    └── product_variants
            ├── variant_attribute_values
            ├── variant_prices
            ├── variant_stocks
            └── marketplace_variants
```

---

# 21. Out of Scope (Phase 1)

Fitur berikut tidak termasuk dalam MVP:

* Brand
* Manufacturer
* Bundle Product
* Product Kit
* Related Product
* SEO Metadata
* AI Generated Description
* AI Translation
* Approval Workflow
* Version History
* Audit Trail
* Bulk Import/Export
* Multi-language Product

---

# 22. Future Roadmap

## Phase 2

* Multi Warehouse
* Bundle Product
* Related Product
* SEO
* Schedule Publish
* Product Documents
* Product Videos

## Phase 3

* AI Description Generator
* AI SEO Generator
* AI Marketplace Title Generator
* Approval Workflow
* Product Versioning
* Audit History
* Bulk Marketplace Publish
* Omnichannel Publishing

---

# 23. Design Principles

* Commerce OS adalah **Source of Truth**.
* Struktur data tidak mengikuti marketplace tertentu.
* Semua marketplace menggunakan adapter/integration layer.
* Product (SPU) dipisahkan dari Variant (SKU).
* Description disimpan dalam Rich Text JSON.
* Theme, Occasion, dan Collection dipisahkan dari Category.
* Product Type menentukan atribut yang relevan untuk setiap jenis produk.
* Struktur harus mudah diperluas tanpa mengubah tabel inti.
