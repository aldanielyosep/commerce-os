# commerce-os

Commerce Operating System for ecommerce operations, finance, settlements, and storefront management.

---

# Overview

`commerce-os` is a modular commerce operating system built for modern ecommerce businesses.

The system is designed to centralize:

* marketplace operations
* sales reporting
* settlement reconciliation
* operational finance
* ROI tracking
* cashflow visibility
* future storefront management

Initially focused on internal/self-use ecommerce operations with future support for managed commerce services and customizable storefronts.

---

# Core Philosophy

Most ecommerce systems focus only on sales.

`commerce-os` focuses on:

```text id="9n0prf"
Sales ≠ Profit ≠ Cashflow
```

The goal is to provide accurate operational and financial visibility across ecommerce activities.

---

# Main Features

## Commerce Operations

* Product management
* Marketplace order imports
* Settlement reconciliation
* Operational expense tracking
* ROI & profitability reporting
* Cashflow tracking

---

## Marketplace Integrations

Supported marketplaces:

* Shopee
* Tokopedia

### Phase 1

* CSV import based workflow

### Phase 2

* Marketplace Open API integrations

---

## Storefront Ready

Future-ready architecture for:

* customizable ecommerce storefronts
* theme-based seller websites
* headless commerce architecture

---

# Tech Stack

## Frontend

* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui

---

## Backend

* Ruby on Rails API

---

## Database

* PostgreSQL

---

## Background Jobs

* Redis
* Sidekiq

---

## File Storage

* Cloudflare R2

---

## Deployment

* Vercel
* Railway / Render
* AWS (future scaling)

---

# Monorepo Structure

```text
commerce-os/
├── apps/
│   ├── api/              # Rails API
│   ├── admin-web/        # Internal dashboard
│   ├── storefront/       # Ecommerce storefront
│   └── worker/           # Background jobs / workers
│
├── packages/
│   ├── ui/               # Shared UI components
│   ├── shared-types/     # Shared TypeScript types
│   ├── utils/            # Shared business utilities
│   └── configs/          # Shared configurations
│
├── docs/
├── scripts/
└── docker/
```

---

# Architecture Principles

## API First

All applications communicate through the backend API.

---

## Monorepo

Single repository for:

* shared development context
* reusable components
* shared business logic
* easier refactoring
* AI-assisted development workflows

---

## Modular Design

Features are separated logically while maintaining operational simplicity.

Avoiding premature complexity:

* no microservices (initially)
* no distributed architecture
* no event sourcing
* no multi-database setup

---

# Core Modules

## Product Management

Manage:

* products
* SKUs
* suppliers
* categories
* product assets

---

## Sales Management

Normalize marketplace data from:

* Shopee
* Tokopedia

---

## Settlement Engine

Track:

* admin fees
* service fees
* ads fees
* affiliate fees
* taxes
* refunds
* actual payouts

---

## Expense Management

Track operational expenses:

* packing supplies
* labels
* utilities
* salaries
* warehouse/ruko rent
* operational purchases

---

## ROI & Profitability

Calculate:

* net profit
* ROI
* margin
* profit per SKU
* profit per marketplace

---

## Cashflow

Track:

* money in
* money out
* payout flow
* account balances

---

# Development Setup

## Requirements

* Ruby
* Node.js
* PostgreSQL
* Redis
* pnpm
* Docker (optional)

---

## Install Dependencies

### Backend

```bash
cd apps/api
bundle install
```

### Frontend

```bash
pnpm install
```

---

# Roadmap

## Phase 1

* Internal commerce operations
* Finance reporting
* CSV imports
* ROI engine
* Dashboard

---

## Phase 2

* Marketplace API sync
* Inventory tracking
* Purchase orders
* Advanced reporting

---

## Phase 3

* Headless storefront
* Theme system
* Managed commerce services
* Multi-organization support

---

# Project Goals

`commerce-os` is designed to prioritize:

* operational visibility
* financial accuracy
* maintainable architecture
* scalable commerce workflows

over unnecessary infrastructure complexity.

---

# License

Private / Internal Use
