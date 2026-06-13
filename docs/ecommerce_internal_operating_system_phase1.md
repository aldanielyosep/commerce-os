# Ecommerce Internal Operating System — Draft Architecture Phase 1

## Objective

Membangun internal system untuk:
- Sales reporting
- Marketplace settlement tracking
- ROI simulation
- Expense tracking
- Cashflow reporting
- Product master data
- Basic operational finance

Marketplace:
- Shopee
- Tokopedia

Source data:
- CSV upload (Phase 1)
- Open API integration (Phase 2)

---

# High Level Architecture

```text
Frontend (Next.js)
    ↓
Backend API (Ruby on Rails)
    ↓
PostgreSQL Database
    ↓
Redis + Sidekiq (background jobs)
    ↓
Storage Buckets (image & file storage)
```

---

# Recommended Tech Stack

## Frontend
- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui

## Backend
- Ruby on Rails (API mode)

## Database
- PostgreSQL

## Background Job
- Redis
- Sidekiq

## Storage
- Railway Storage Buckets

## Deployment
### Initial
- Railway
- Render

### Future Scaling
- AWS ECS/Fargate
- RDS PostgreSQL
- Railway Storage Buckets

---

# System Modules

## 1. Authentication & User Management
Features:
- login
- role management
- admin/staff permission

---

## 2. Product Master Module

Tables:
- products
- product_images
- suppliers
- categories

Example fields:

```text
products
- id
- sku
- name
- brand
- supplier_id
- base_cost
- weight
- status
```

---

## 3. Marketplace Listing Module

Purpose:
Mapping internal product to marketplace listing.

```text
marketplace_listings
- product_id
- marketplace
- marketplace_sku
- marketplace_product_id
- selling_price
```

---

## 4. Sales Module

Source:
- Shopee CSV export
- Tokopedia CSV export

Tables:
- orders
- order_items

Important:
All marketplace data must be normalized into internal format.

---

## 5. Settlement Module

Purpose:
Track real payout from marketplace.

Need to track:
- admin fee
- service fee
- ads fee
- affiliate fee
- tax
- refund
- return
- shipping subsidy

Tables:
- settlements
- settlement_items

Example:

```text
order_total: 100000
admin_fee: 8000
ads_fee: 10000
tax: 1000

net_payout: 81000
```

---

## 6. Expense Module

Purpose:
Track operational expenses.

Tables:
- expenses
- expense_categories

Expense examples:
- packing
- bubble wrap
- lakban
- printer label
- listrik
- internet
- gaji
- sewa ruko
- transport
- operational supplies

---

## 7. Cashflow Module

Purpose:
Track money in/out.

Tables:
- accounts
- cash_transactions

Money IN:
- Shopee payout
- Tokopedia payout

Money OUT:
- supplier payment
- ads payment
- expense payment

---

## 8. ROI & Profitability Module

Formula:

```text
Selling Price
- Product Cost
- Import Shipping
- Marketplace Fee
- Ads Fee
- Tax
- Operational Allocation
=
Net Profit
```

Features:
- ROI percentage
- margin percentage
- break even simulation
- profit per SKU
- profit per marketplace

---

## 9. Reporting Dashboard

Dashboard examples:
- total sales
- net profit
- cashflow
- top products
- ads spend
- marketplace fee
- ROI per SKU
- operational expense summary

---

# CSV Import Strategy

## Phase 1
CSV upload only.

Supported import:
- Shopee orders
- Shopee settlement
- Shopee ads
- Tokopedia orders
- Tokopedia payout
- Tokopedia ads

---

# Open API Integration (Phase 2)

Integrate:
- Shopee Open API
- Tokopedia API

Recommendation:
Do NOT start with API integration.
Start with CSV import first.

---

# Suggested Development Phases

## Phase 1 — MVP
Target:
1–2 months

Features:
- login
- product master
- image upload
- CSV import
- settlement import
- expense tracking
- ROI simulation
- dashboard reporting

---

## Phase 2
Features:
- marketplace API sync
- inventory tracking
- purchase order
- stock movement
- supplier management
- scheduled reporting

---

## Phase 3
Features:
- warehouse management
- accounting integration
- advanced analytics
- forecasting
- multi-company support

---

# Important Architectural Notes

Avoid:
- microservices
- Kubernetes
- event-driven architecture
- multiple databases

Focus:
- accurate financial data
- clean reporting
- maintainable codebase
- fast iteration

---

# Recommended Final Stack

```text
Frontend
- Next.js

Backend
- Ruby on Rails API

Database
- PostgreSQL

Queue
- Redis + Sidekiq

Storage
- Cloudflare R2

Deploy
- Railway / Render
→ later migrate to AWS
```

---

# Core Principle

```text
Sales ≠ Profit ≠ Cashflow
```

System harus memisahkan:
- order data
- settlement data
- operational expenses
- payout/cashflow

agar laporan bisnis akurat.
