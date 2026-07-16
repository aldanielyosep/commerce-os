# TODO: Railway Deployment and CI/CD Readiness

## Goal
Prepare this repository for Railway deployment (API + PostgreSQL + object storage) while keeping CI fully active before deploy credentials are available.

## Current State
- [x] Backend quality gates pass locally (lint, security, tests, coverage, rswag generation).
- [x] Frontend build passes locally (`@commerce-os/admin-web`).
- [ ] Railway account and project not created yet.
- [ ] Deployment secrets not configured in GitHub.

## Phase 1: Immediate (No Railway Account Yet)

### CI Hardening
- [ ] Add frontend build job to GitHub Actions CI:
  - [ ] `pnpm install --frozen-lockfile`
  - [ ] `pnpm --filter @commerce-os/admin-web build`
- [ ] Keep backend CI gates strict:
  - [ ] RuboCop
  - [ ] Brakeman
  - [ ] Bundler Audit
  - [ ] RSpec with coverage (`COVERAGE=true`)
- [ ] Keep OpenAPI generation check in CI (`RAILS_ENV=test bundle exec rake rswag:specs:swaggerize`).
- [ ] Optional: add guard to fail if request specs change but swagger file is stale.

### CD Scaffolding (Disabled by Missing Secrets)
- [ ] Add deploy workflow files with conditions that skip execution when required secrets are absent.
- [ ] Add separate jobs:
  - [ ] `deploy-staging` (on push to `main`)
  - [ ] `deploy-production` (manual approval gate)
- [ ] Add post-deploy health check (`/up`) in both staging and production jobs.

## Phase 2: Railway Account Setup

### Railway Project and Services
- [ ] Create Railway account.
- [ ] Create project for `commerce-os`.
- [ ] Create API service deployment target.
- [ ] Create PostgreSQL service.
- [ ] Choose storage approach:
  - [ ] Railway-compatible S3 provider (recommended)
  - [ ] Confirm bucket lifecycle and access policy

### Environment Variables (Railway)
- [ ] `DATABASE_URL`
- [ ] `DEVISE_JWT_SECRET_KEY`
- [ ] `CORS_ORIGINS`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_REGION`
- [ ] `AWS_BUCKET`
- [ ] `RAILS_MASTER_KEY` (if credentials are used)
- [ ] `RAILS_ENV=production`

## Phase 3: GitHub Secrets and Workflow Activation

### GitHub Repository Secrets
- [ ] `RAILWAY_TOKEN`
- [ ] `RAILWAY_PROJECT_ID`
- [ ] `RAILWAY_ENV_STAGING`
- [ ] `RAILWAY_ENV_PRODUCTION`

### Activate CD Jobs
- [ ] Remove or loosen skip guards once secrets exist.
- [ ] Validate staging auto-deploy from `main`.
- [ ] Keep production deploy manual and approval-gated.

## Phase 4: Release Readiness Gates Before Production

### Staging Verification
- [ ] Deploy to staging.
- [ ] Run migrations (`rails db:prepare` or equivalent).
- [ ] Verify health endpoint (`/up`).
- [ ] Run smoke workflows:
  - [ ] Auth login/sign out
  - [ ] Employee and department read/write flow
  - [ ] User admin role-protected flow
  - [ ] Salary/position timeline check
  - [ ] Document upload/download/archive check
  - [ ] Audit endpoint verification

### Production Promotion
- [ ] Confirm all staging smoke checks are green.
- [ ] Confirm no P2 modules are partially exposed in routes/UI.
- [ ] Trigger production deploy (manual approval).
- [ ] Re-run short post-deploy smoke.

## Phase 5: Post-Go-Live Improvements
- [ ] Add rollback playbook and runbook documentation.
- [ ] Add uptime monitor and alerting.
- [ ] Add periodic dependency and security scan schedule.
- [ ] Add release sign-off checklist artifact per deployment.

## Notes
- Production deploy should remain blocked until Phase 4 staging checks pass.
- CI should stay mandatory even while CD is not active.
