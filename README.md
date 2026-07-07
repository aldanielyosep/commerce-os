# commerce-os

Commerce Operating System monorepo for ecommerce operations, finance, settlements, and storefront management.

---

## Monorepo Structure

- `apps/api` - Rails API service
- `apps/admin-web` - Internal web MVP application (Phase G)
- `apps/storefront` - Storefront application planned for this monorepo
- `packages/*` - Shared libraries and cross-module utilities

This repository uses a single root release flow for all current and future modules.

## Tooling

- Node.js 24
- pnpm workspace
- semantic-release for repository-wide releases
- Husky + commitlint for Conventional Commit validation

## Setup

Install root tooling:

```bash
corepack enable
corepack pnpm install
```

Reinstall Git hooks if needed:

```bash
corepack pnpm prepare
```

Module-specific setup lives in each module README.

## Commit Conventions

This repository uses Conventional Commits.

Format:

```text
<type>(<scope>): <subject>
```

Examples:

- `feat(api): add payout reconciliation endpoint`
- `fix(storefront): correct cart tax rounding`
- `ci(repo): add semantic release workflow`
- `docs(readme): document development workflow`

Commit messages are validated locally through Husky before a commit is created.

## Release Process

Releases are automated from `main` using semantic-release at the repository root.

That means:

- releases are generated from Conventional Commit history
- GitHub tags and release notes are created automatically
- the release process is shared by API, admin, storefront, and future shared packages

No manual version bumping is required.

## Pull Requests

Pull requests should follow the repository template at [pull_request_template.md](./.github/pull_request_template.md).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions, pull request expectations, and development standards.

## Module Documentation

API setup, Swagger generation, and coverage workflow are documented in [apps/api/README.md](./apps/api/README.md).

Phase 1 backend technical decisions (domain foundation status, Active Storage document handling, and phone validation strategy) are also maintained in [apps/api/README.md](./apps/api/README.md).

---