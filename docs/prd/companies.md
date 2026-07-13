# PRD - Companies

## Document Information

| Item | Value |
|------|-------|
| Feature | Companies |
| Module | Master Data |
| Platform | Admin Web |
| API | Required |
| Priority | High |
| Status | Draft |

---

# 1. Overview

Modul **Companies** merupakan master data yang menyimpan informasi perusahaan atau pemilik usaha yang menggunakan sistem.

Data perusahaan akan digunakan sebagai identitas utama pada seluruh modul seperti:

- Product
- Order
- Inventory
- Marketplace
- Invoice
- Report
- Branding

Setiap perusahaan dapat memiliki satu atau lebih Marketplace yang terhubung.

Seluruh operasi pada Admin Web **wajib menggunakan API** sebagai source of truth.

---

# 2. Objectives

- Menyediakan master data perusahaan secara terpusat.
- Mendukung Personal Seller maupun Badan Usaha.
- Menjadi identitas perusahaan pada seluruh modul.
- Mendukung branding perusahaan melalui logo.
- Menyediakan data yang siap digunakan untuk integrasi Marketplace.
- Mendukung ekspansi ke Multi Company.

---

# 3. Scope

## In Scope

- CRUD Company
- Upload Logo
- Preview Logo
- Marketplace Links
- Company Status
- API Integration

## Out of Scope

- Marketplace OAuth
- User Management
- Subscription
- Billing
- Warehouse
- Tax Configuration

---

# 4. Company Type

Sistem mendukung tiga jenis perusahaan.

| Value | Label |
|---------|------------|
| individual | Personal Seller |
| cv | CV |
| pt | PT |

---

# 5. Data Model

## Companies

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | UUID | ✔ | Primary Key |
| code | String | ✔ | Unique Company Code |
| name | String | ✔ | Company / Store Name |
| owner_name | String | ✔ | Owner Name |
| company_type | Enum | ✔ | individual / cv / pt |
| email | String | ✔ | Company Email |
| phone | String | ✔ | Phone Number |
| website | String | | Official Website |
| description | Text | | Description |
| address | Text | | Company Address |
| province | String | | Province |
| city | String | | City |
| postal_code | String | | Postal Code |
| latitude | Numeric(10,8) | | Latitude Coordinate |
| longitude | Numeric(11,8) | | Longitude Coordinate |
| logo_url | String | | Generated after upload |
| status | Enum | ✔ | active / inactive |
| created_at | Timestamp | ✔ | |
| updated_at | Timestamp | ✔ | |
| discarded_at | Timestamp | | |

---

## Business Information

Business Information hanya berlaku untuk CV dan PT.

| Field | Type | Required |
|------|------|----------|
| company_registration_number | String | ✔ |
| nib | String | ✔ |
| siup | String | |
| deed_number | String | |
| pkp_number | String | |

---

## Marketplace Links

Satu perusahaan dapat memiliki banyak Marketplace.

| Field | Type | Required |
|------|------|----------|
| id | UUID | ✔ |
| company_id | UUID | ✔ |
| marketplace | Enum | ✔ |
| store_name | String | ✔ |
| store_url | String | ✔ |
| is_active | Boolean | ✔ |

Supported Marketplace (initial):

- Shopee
- Tokopedia
- TikTok Shop
- Lazada
- Blibli
- Shopify
- Website

---

# 6. UI Behaviour

## Company Type

### Individual

Apabila Company Type = **Personal Seller**, maka section berikut **tidak ditampilkan**.

- Company Registration Number
- NIB
- SIUP
- Deed Number
- PKP Number

API juga tidak menerima maupun menyimpan field tersebut.

---

### CV / PT

Apabila Company Type adalah **CV** atau **PT**, maka seluruh Business Information akan muncul pada form.

---

# 7. Upload Logo Brand

Logo perusahaan diunggah melalui file upload.

Admin **tidak menginput URL logo secara manual**.

---

## Supported Format

- PNG
- JPG
- JPEG
- WebP
- SVG (Optional)

---

## Maximum Size

2 MB

---

## Storage

Logo disimpan pada Object Storage.

Contoh:

- Amazon S3
- Google Cloud Storage
- MinIO

Field `logo_url` akan dihasilkan oleh API setelah upload berhasil.

---

# 8. Image Processing (API)

API bertanggung jawab melakukan seluruh proses pengolahan gambar sebelum disimpan.

Processing meliputi:

- Validasi format file
- Validasi ukuran file
- Auto Resize
- Auto Rotate (EXIF)
- Compress Image
- Optimize Image

Ukuran yang direkomendasikan:

| Variant | Size |
|---------|------|
| Original | Original |
| Large | 256x256 |
| Medium | 128x128 |
| Small | 64x64 |

---

## Rails Recommendation

Disarankan menggunakan:

- Active Storage
- ImageProcessing
- libvips

Alasan:

- Lebih cepat dibanding ImageMagick
- Memory lebih kecil
- Mendukung Variant bawaan Rails

---

# 9. Admin Web

## Company List

Kolom:

| Column |
|---------|
| Logo |
| Company Name |
| Owner |
| Company Type |
| City |
| Email |
| Phone |
| Status |
| Updated At |
| Action |

---

## Logo

Logo ditampilkan dalam bentuk **Circle Avatar**.

Jika logo belum tersedia:

- tampilkan inisial nama perusahaan.

Contoh:

```
+------+---------------------+
| LOGO | Company             |
+------+---------------------+
|  KL  | Kawan Lama          |
|  DS  | Daniel Store        |
| Logo | ABC Fashion         |
+------+---------------------+
```

---

## Company Detail

Section:

### Basic Information

- Logo
- Company Name
- Owner Name
- Company Type
- Description

---

### Contact

- Email
- Phone
- Website

---

### Address Information

- Address
- Province
- City
- Postal Code
- Company Location (Google Maps)

---

### Business Information

(Hanya muncul untuk CV/PT)

- Company Registration Number
- NIB
- SIUP
- Deed Number
- PKP Number

---

### Marketplace

Menampilkan seluruh Marketplace.

Contoh:

| Marketplace | Store | URL |
|-------------|-------|-----|
| Shopee | ABC Official | https://... |
| Tokopedia | ABC Official | https://... |

---

# 10. Create / Edit Form

Field:

## Basic Information

- Upload Logo
- Company Name
- Owner Name
- Company Type
- Email
- Phone
- Website
- Description
- Status

---

## Address Information

- Address (Textarea)
- Province
- City
- Postal Code
- Search Location (Google Maps)
- Latitude *(Read Only)*
- Longitude *(Read Only)*

Business Information akan tampil dinamis sesuai Company Type.

---

# 11. Logo Preview

Sebelum data disimpan, Admin dapat melihat preview logo.

Flow:

1. Upload image.
2. Preview muncul.
3. Preview menggunakan **Circle Avatar**.
4. Admin dapat Replace.
5. Admin dapat Remove.
6. Save.

Preview menggunakan ukuran yang sama seperti pada Company List sehingga hasil yang dilihat Admin sesuai dengan tampilan sebenarnya.

---

## Company Location Preview

Admin dapat menentukan lokasi perusahaan menggunakan **Google Maps**.

Flow:

1. Admin mencari lokasi melalui Google Maps Search Box.
2. Memilih lokasi dari hasil pencarian.
3. Marker otomatis muncul pada peta.
4. Marker dapat dipindahkan (*drag & drop*) untuk menyesuaikan posisi.
5. Latitude dan Longitude otomatis diperbarui.
6. Nilai Latitude dan Longitude ditampilkan sebagai **read-only**.

Contoh UI:

```text
Address
-------------------------------------------------------
Jl. Raya Serpong No.88
-------------------------------------------------------

Province
[Banten ▼]

City
[Tangerang Selatan ▼]

Postal Code
15345

Search Location
-------------------------------------------------------
Golden Park 3
-------------------------------------------------------

+------------------------------------------------------+
|                                                      |
|                  Google Maps                         |
|                                                      |
|                        📍                            |
|                                                      |
+------------------------------------------------------+

Latitude
-6.34681830

Longitude
106.64035350
```

---

# 12. Validation

## Company

- Company Name wajib diisi.
- Maksimal 100 karakter.
- Company Code unik.
- Email valid.
- Phone valid.
- Website optional.
- Logo maksimal 2 MB.

---

## Address

- Address bersifat opsional.
- Province bersifat opsional.
- City bersifat opsional.
- Postal Code bersifat opsional.
- Latitude harus berada pada rentang **-90** hingga **90**.
- Longitude harus berada pada rentang **-180** hingga **180**.
- Latitude dan Longitude harus dikirim secara bersamaan (tidak boleh hanya salah satu).

---

## Business Information

Untuk CV/PT

- Company Registration Number wajib.
- NIB wajib.

Untuk Individual

- Business Information tidak boleh dikirim.

---

## Marketplace

- Marketplace tidak boleh duplikat.
- URL wajib menggunakan HTTPS.
- Store Name wajib.

---

# 13. API

## Companies

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/companies |
| GET | /api/v1/companies/{id} |
| POST | /api/v1/companies |
| PATCH | /api/v1/companies/{id} |
| DELETE | /api/v1/companies/{id} |

Contoh request:

```json
{
  "name": "ABC Store",
  "company_type": "pt",
  "email": "admin@abc.com",
  "phone": "08123456789",
  "address": "Jl. Raya Serpong No.88",
  "province": "Banten",
  "city": "Tangerang Selatan",
  "postal_code": "15345",
  "latitude": -6.34681830,
  "longitude": 106.64035350
}
```

---

## Upload Logo

```
POST /api/v1/companies/{id}/logo
```

Request

```
multipart/form-data

file=<image>
```

Response

```json
{
  "logo_url": "https://storage.example.com/company/logo.png"
}
```

---

## Marketplace

| Method | Endpoint |
|---------|----------|
| GET | /api/v1/companies/{id}/marketplaces |
| POST | /api/v1/companies/{id}/marketplaces |
| PATCH | /api/v1/companies/{id}/marketplaces/{id} |
| DELETE | /api/v1/companies/{id}/marketplaces/{id} |

---

# 14. UI Requirements

## Company List

Features:

- Search

Search by:

- Company Name
- Owner Name
- Email

Filter:

- Company Type
- Status

Sorting:

- Company Name
- Updated At

Pagination:

- Required

---

## Company Detail

Features:

- Preview Logo
- Company Information
- Marketplace
- Edit
- Upload Logo

---

# 15. Acceptance Criteria

## Company

- Admin dapat membuat Company.
- Admin dapat mengubah Company.
- Admin dapat menghapus Company.
- Admin dapat mengaktifkan maupun menonaktifkan Company.
- Seluruh operasi menggunakan API.

---

## Company Type

- Individual tidak menampilkan Business Information.
- CV menampilkan Business Information.
- PT menampilkan Business Information.
- API hanya menyimpan Business Information untuk CV/PT.

---

## Address

- Admin dapat menyimpan Address.
- Admin dapat menyimpan Province.
- Admin dapat menyimpan City.
- Admin dapat menyimpan Postal Code.
- Informasi alamat tersedia melalui API.

---

## Company Location

- Admin dapat mencari lokasi menggunakan Google Maps.
- Admin dapat memilih lokasi melalui Google Maps.
- Marker dapat dipindahkan (*drag & drop*).
- Latitude dan Longitude diperbarui secara otomatis.
- Latitude dan Longitude ditampilkan sebagai read-only.
- Saat halaman Edit dibuka, marker akan otomatis berada pada koordinat yang telah tersimpan.
- Koordinat dikirim ke API saat proses Create maupun Update.

---

## Logo

- Logo diunggah melalui file upload.
- URL logo dihasilkan oleh API.
- API melakukan resize dan optimasi gambar menggunakan Active Storage Variant + libvips.
- Admin dapat melihat preview logo sebelum menyimpan.
- Logo tampil dalam bentuk Circle Avatar pada seluruh halaman.
- Jika logo belum tersedia, tampilkan avatar menggunakan inisial nama perusahaan.

---

## Marketplace

- Company dapat memiliki lebih dari satu Marketplace.
- Marketplace dapat ditambah.
- Marketplace dapat diubah.
- Marketplace dapat dihapus.
- Link Marketplace dapat dibuka langsung dari Admin Web.
- Marketplace tidak boleh duplikat dalam satu Company.

---

# 16. Future Enhancement

- Marketplace OAuth
- Marketplace Token Management
- Sinkronisasi Product
- Sinkronisasi Order
- Sinkronisasi Inventory
- Multiple Warehouse
- Multiple Brand
- Multiple Bank Account
- Dokumen Legal Upload
- Theme & Branding
- Company Color Palette
- Favicon
- Digital Signature
- QRIS Information
- Tax Configuration