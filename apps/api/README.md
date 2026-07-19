# commerce-os API

Backend API for the `commerce-os` monorepo.

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

All protected API requests must send the JWT in the `Authorization` header using the `Bearer <token>` format. The same header is used in rswag request specs and by the future frontend API client.

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
AWS_DEFAULT_REGION=
AWS_ENDPOINT_URL=
AWS_PATH=
AWS_S3_BUCKET_NAME=

DEVISE_JWT_SECRET_KEY=
CORS_ORIGINS=http://localhost:5173
EMPLOYEE_ID_PREFIX=B
RSWAG_USERNAME=
RSWAG_PASSWORD=
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

Backfill company assignments for RFC-111 rollout:

```bash
bundle exec rake company_scope:backfill_assignments USER_IDS=1,2 COMPANY_IDS=10,11
```

Options:

```text
ALL_ADMINS=true            # assign selected companies to every admin user
ROLE_IN_COMPANY=manager    # optional metadata
```

Generate coverage reports locally:

```bash
RAILS_ENV=test COVERAGE=true bundle exec rspec
```

Coverage outputs:

```text
coverage/index.html
coverage/lcov.info
```

CI enforces a minimum of 90% suite coverage and 90% per-file coverage.

In CI, coverage is validated against those thresholds and a PR comment is posted from LCOV results.

---

# Linting

```bash id="t1k6wn"
bundle exec rubocop
```

---

# API Documentation

Generate OpenAPI docs with rswag:

```bash
RAILS_ENV=test bundle exec rake rswag:specs:swaggerize
```

Important:

* Only request specs that use rswag DSL (require "swagger_helper" and define path/response blocks) are exported into swagger JSON.
* If an endpoint is missing from swagger output, add or update its rswag request spec first, then rerun swaggerize.

Current Phase C API coverage includes departments CRUD, employees CRUD/list/filter/terminate, and nested employee department assignment endpoints.

Generated file:

```text
swagger/v1/swagger.json
```

Start the API server and open Swagger UI:

```bash
bin/rails server
```

```text
http://localhost:3000/api-docs
```

Routes used by rswag:

```text id="u9m3vr"
/api-docs
```

If `RSWAG_USERNAME` and `RSWAG_PASSWORD` are set, `/api-docs` is protected with HTTP Basic Auth.

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

* Active Storage
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

# Phase 1 Notes

## Current Phase Status

Phase A (domain foundation) is complete.
Phase B (security and API base) is complete.

Implemented in this phase:

* Core HR domain schema and models (employees, departments, assignments, position history, salary records, employee documents)
* User management fields for role/status and employee linkage
* Audited change tracking table and model audit hooks
* Active Storage tables and attachment-based document model
* JWT authentication baseline with Devise (`/api/v1/users/sign_in`, `/api/v1/users/sign_out`)
* Pundit policy matrix scaffolding for all Phase A domain models
* API v1 base controller with shared authentication and authorization concerns

## Document Handling

Employee documents now use Active Storage attachment (`has_one_attached :file`) instead of storing direct file path metadata columns.

Why:

* standardized Rails upload abstraction
* easier signed URL generation
* cleaner S3/local service switching by environment

## Phone Number Validation

Employee phone validation uses `phony_rails` for normalization and plausibility checking.

Why:

* stronger international number validation than regex-only checks
* consistent normalization before persistence

## Security Baseline

Authentication and authorization baseline for API v1:

* JWT dispatch on `POST /api/v1/users/sign_in`
* JWT revocation on `DELETE /api/v1/users/sign_out`
* User revocation strategy: Devise JTI matcher (`users.jti`)
* Pundit policy classes in place for Employee, Department, Assignment, Salary, Position, Document, User, and Audit access
* CORS enabled with `Authorization` response header exposure

---