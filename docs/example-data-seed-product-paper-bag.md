# Example Data Seed: Paper Bag Product

Dokumen ini berisi contoh data seed untuk product master dan product variants berdasarkan contoh produk marketplace: paper bag putih list hitam dengan pilihan ukuran S, M, L, dan XL.

## Product Master

| Field | Value |
|---|---|
| Product Name | Paper Bag Putih List Hitam Classic White Paperbag |
| Company | Bungkusand |
| Product Department | ACC - Accessories |
| Category | Packing |
| Sub Category | Paper Bag |
| Product Type | Paper Bag / Gift Bag |
| Status | active |

## Short Description

Paper bag putih list hitam premium dengan desain classic dan elegan untuk kemasan kado, souvenir, hampers, dan kebutuhan packaging toko.

## Description

Paper Bag Putih List Hitam Classic White Paperbag adalah tas kemasan premium dengan desain minimalis, elegan, dan cocok untuk berbagai kebutuhan packaging.

Produk ini dapat digunakan sebagai kemasan kado, goodie bag, souvenir, hampers, shopping bag, dan packaging produk retail. Tampilan putih dengan list hitam memberi kesan bersih, modern, dan profesional.

Spesifikasi produk:

- Material ivory tebal
- Full laminasi
- Water resistant
- Sudah termasuk tali jinjing
- Sudah termasuk alas/tatakan dalam
- Cocok untuk kemasan produk ringan hingga sedang

Pilihan ukuran:

- S: 28 x 20 x 10 cm
- M: 32 x 25 x 11 cm
- L: 35 x 26 x 13 cm
- XL: 43 x 32 x 14 cm

Kegunaan:

- Packaging toko
- Tas kado
- Goodie bag
- Souvenir event
- Hampers
- Tas belanja retail

## Spesifikasi Produk

| Spesifikasi | Detail |
|---|---|
| Stok | TERSEDIA |
| Merek | - |
| Acara | Ulang Tahun |
| Asal Produk | Negara Lain |
| Produk Custom | Tidak |
| Dimensi | Sesuai varian |
| Dikirim Dari | KAB. TANGERANG |

## Fitur Produk

- Material ivory tebal
- Full laminasi
- Water resistant
- Sudah termasuk tali jinjing
- Sudah termasuk alas / tatakan dalam
- Desain elegan dan awet
- Cocok untuk produk ringan hingga sedang

## Kegunaan

- Packaging toko
- Tas kado
- Goodie bag
- Souvenir event
- Hampers
- Tas belanja retail
- Kemasan produk fashion, aksesoris, dan beauty product

## Product Variants

Ukuran dan dimensi disimpan sebagai variant attributes, bukan sebagai product master terpisah.

| SKU | Barcode | Ukuran | Dimensi | Price | Stock | Status | Attributes |
|---|---|---:|---|---:|---:|---|---|
| PAPERBAG-WHTBLK-S | PB-WHTBLK-S | S | 28x20x10 cm | 11.811 | 100 | active | ukuran:S;dimensi:28x20x10 cm |
| PAPERBAG-WHTBLK-M | PB-WHTBLK-M | M | 32x25x11 cm | 12.500 | 100 | active | ukuran:M;dimensi:32x25x11 cm |
| PAPERBAG-WHTBLK-L | PB-WHTBLK-L | L | 35x26x13 cm | 14.000 | 100 | active | ukuran:L;dimensi:35x26x13 cm |
| PAPERBAG-WHTBLK-XL | PB-WHTBLK-XL | XL | 43x32x14 cm | 15.500 | 100 | active | ukuran:XL;dimensi:43x32x14 cm |

## Example Product Payload

```json
{
  "product": {
    "company_id": 1,
    "product_name": "Paper Bag Putih List Hitam Classic White Paperbag",
    "department_id": 10,
    "category_id": 21,
    "sub_category_id": 31,
    "product_type_id": 41,
    "short_description": "Paper bag putih list hitam premium dengan desain classic dan elegan untuk kemasan kado, souvenir, hampers, dan kebutuhan packaging toko.",
    "description_richtext": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Paper Bag Putih List Hitam Classic White Paperbag adalah tas kemasan premium dengan desain minimalis, elegan, dan cocok untuk berbagai kebutuhan packaging."
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Produk ini dapat digunakan sebagai kemasan kado, goodie bag, souvenir, hampers, shopping bag, dan packaging produk retail. Tampilan putih dengan list hitam memberi kesan bersih, modern, dan profesional."
            }
          ]
        }
      ]
    },
    "status": "active"
  }
}
```

## Example Variant Payloads

```json
[
  {
    "variant": {
      "sku": "PAPERBAG-WHTBLK-S",
      "barcode": "PB-WHTBLK-S",
      "status": "active",
      "current_price": 11811,
      "current_stock": 100,
      "attributes": [
        { "name": "ukuran", "value": "S" },
        { "name": "dimensi", "value": "28x20x10 cm" }
      ]
    }
  },
  {
    "variant": {
      "sku": "PAPERBAG-WHTBLK-M",
      "barcode": "PB-WHTBLK-M",
      "status": "active",
      "current_price": 12500,
      "current_stock": 100,
      "attributes": [
        { "name": "ukuran", "value": "M" },
        { "name": "dimensi", "value": "32x25x11 cm" }
      ]
    }
  },
  {
    "variant": {
      "sku": "PAPERBAG-WHTBLK-L",
      "barcode": "PB-WHTBLK-L",
      "status": "active",
      "current_price": 14000,
      "current_stock": 100,
      "attributes": [
        { "name": "ukuran", "value": "L" },
        { "name": "dimensi", "value": "35x26x13 cm" }
      ]
    }
  },
  {
    "variant": {
      "sku": "PAPERBAG-WHTBLK-XL",
      "barcode": "PB-WHTBLK-XL",
      "status": "active",
      "current_price": 15500,
      "current_stock": 100,
      "attributes": [
        { "name": "ukuran", "value": "XL" },
        { "name": "dimensi", "value": "43x32x14 cm" }
      ]
    }
  }
]
```

## Notes

- Product master mewakili produk induk / SPU.
- Variasi ukuran, dimensi, harga, dan stok disimpan di product variants.
- Format harga di UI dapat ditulis dengan separator Indonesia, contoh `11.811` atau `10.500,50`, tetapi payload API tetap menggunakan angka mentah seperti `11811` atau `10500.5`.
- `Product Type` sebaiknya memakai nilai seperti `Paper Bag`, `Gift Bag`, atau `Shopping Bag`. Nilai seperti `ukuran` lebih cocok dipakai sebagai variant attribute.
