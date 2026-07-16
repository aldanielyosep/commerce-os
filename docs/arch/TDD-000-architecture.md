# TDD-000 architecture

## Technology Stack

### Backend

* Ruby on Rails 8 API Only
* Ruby 4.x
* PostgreSQL
* GoodJob
* Active Storage

### Authentication

* Devise
* JWT

### Authorization

* Pundit

### API Documentation

* Rswag (OpenAPI 3)

### JSON Presenter

* Blueprinter

### Background Jobs

* GoodJob

GoodJob digunakan sebagai standar background job pada Commerce OS.

Seluruh asynchronous process wajib menggunakan GoodJob, seperti:

* Marketplace Publish
* Marketplace Sync
* Image Processing
* Notification
* Import / Export
* Scheduled Job

---

# API Response

Semua response API menggunakan Blueprinter.

Contoh:

* ProductBlueprint
* ProductVariantBlueprint
* DepartmentBlueprint
* CategoryBlueprint

Blueprint tidak boleh mengandung business logic.

Blueprint hanya bertugas membentuk response JSON.

---

# Backend Testing Standard

Framework

* RSpec
* FactoryBot
* Faker

Coverage Requirement

* Minimum 80% coverage untuk setiap file yang dimodifikasi atau ditambahkan.
* Minimum 90% total project coverage.
* Pull Request tidak boleh menurunkan total coverage.

Setiap module minimal memiliki:

* Model Spec
* Request Spec
* Policy Spec
* Service Spec (jika terdapat business logic)
* Blueprint Spec (jika terdapat custom rendering)

---

# Frontend Testing Standard

Framework

* Nuxt 4
* Vitest
* Vue Test Utils
* Testing Library (jika diperlukan)

Coverage Requirement

* Minimum 80% coverage untuk setiap file yang dimodifikasi atau ditambahkan.
* Minimum 90% total project coverage.

Minimal test meliputi:

* Component Rendering
* User Interaction
* Composable
* Store (Pinia)
* Utility Function

---

# Definition of Done (Updated)

Backend

* Migration berhasil dijalankan.
* Model memiliki validation dan association.
* CRUD endpoint lengkap.
* Authorization menggunakan Pundit.
* Response menggunakan Blueprinter.
* Search, filter, sort, pagination tersedia.
* OpenAPI (Rswag) diperbarui.
* FactoryBot tersedia.
* Request Spec lulus.
* Coverage file minimal 80%.
* Total coverage minimal 90%.
* RuboCop lulus.
* Brakeman lulus.

Frontend

* Component selesai.
* Unit Test tersedia.
* Coverage file minimal 80%.
* Total coverage minimal 90%.
* ESLint lulus.
* TypeScript tidak memiliki error.
