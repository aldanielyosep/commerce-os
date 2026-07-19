# commerce-os API

Backend API for the `commerce-os` monorepo.

This application powers:

* ecommerce operations
* marketplace integrations
* settlement reconciliation
* finance reporting
* ROI calculations
* operational expense tracking
* future storefront integrations

Built with:

* Ruby on Rails 8
* PostgreSQL
* GoodJob
* Solid Cache
* Solid Cable

---

# Tech Stack

## Backend

* Ruby on Rails 8 API

## Database

* PostgreSQL

## Background Jobs

* GoodJob

## Cache

* Solid Cache

## Realtime

* Solid Cable

## Authentication

* Devise
* devise-jwt

## Authorization

* Pundit

## Serialization

* Blueprinter

## API Documentation

* Rswag

---

# Requirements

* Ruby 4.x
* PostgreSQL 15+
* Node.js
* pnpm
* Docker (optional)

---

# Setup

## Install dependencies

```bash id="h9x2vl"
bundle install
```

---

# Environment Variables

Create:

```text id="n4m7pw"
.env
```

Example:

```env id="r6q1jk"
DATABASE_URL=postgresql://localhost/commerce_os_development

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET=

DEVISE_JWT_SECRET_KEY=
```

---

# Database Setup

## Create database

```bash id="p3z8wt"
bin/rails db:create
```

---

## Run migrations

```bash id="k5v1rx"
bin/rails db:migrate
```

---

# Running the Application

## Start Rails server

```bash id="d8n2qk"
bin/rails server
```

Application runs at:

```text id="f7m4zs"
http://localhost:3000
```

---

# Running Background Jobs

Using GoodJob.

Start worker:

```bash id="m2q7xt"
bin/jobs
```

---

# Running Tests

```bash id="j4v8pc"
bundle exec rspec
```

---

# Linting

```bash id="t1k6wn"
bundle exec rubocop
```

---

# API Documentation

Rswag/OpenAPI documentation:

```text id="u9m3vr"
/api-docs
```

---

# Core Gems

## Authentication

* devise
* devise-jwt

## Authorization

* pundit

## Finance

* money-rails

## Auditing

* audited

## Soft Delete

* discard

## File Storage

* aws-sdk-s3

## Spreadsheet Import

* roo

---

# Architecture Notes

This application follows:

* API-first architecture
* service object pattern
* modular business domains
* finance-first design

The application intentionally avoids:

* microservices
* distributed architecture
* unnecessary infrastructure complexity

---

# Main Domains

## Products

Product master management.

---

## Orders

Marketplace order ingestion and normalization.

---

## Settlements

Marketplace payout and fee reconciliation.

---

## Expenses

Operational expense tracking.

---

## ROI

Profitability and margin calculations.

---

## Cashflow

Money in/out tracking.

---

# Folder Structure

```text id="p8n4lw"
app/
├── controllers/
├── models/
├── policies/
├── serializers/
├── services/
├── jobs/
└── queries/
```

---

# Development Principles

The system prioritizes:

* financial accuracy
* maintainable business logic
* operational simplicity
* scalable architecture

over premature optimization.

---

# Future Plans

* Marketplace Open API integrations
* Inventory tracking
* Purchase orders
* Storefront integration
* Multi-organization support

---

# License

Private / Internal Use
