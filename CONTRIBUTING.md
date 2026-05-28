# Contributing

This document defines commit conventions, pull request expectations, and development standards for the commerce-os monorepo.

## Commit Conventions

We use Conventional Commits so semantic-release can determine versioning and GitHub release notes automatically.

Format:

```text
<type>(<scope>): <subject>
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `chore`
- `ci`
- `revert`

Recommended scopes:

- `api`
- `admin`
- `storefront`
- `packages`
- `repo`
- `deps`
- `readme`
- `ci`

Guidelines:

- use imperative mood
- keep the subject concise
- avoid a trailing period
- use a scope when it clarifies the affected module

Examples:

- `feat(api): add payout reconciliation endpoint`
- `fix(admin): correct settlement summary filter`
- `docs(readme): explain release workflow`
- `ci(repo): add semantic release automation`

Local commit validation runs through Husky and commitlint.

## Pull Request Guidelines

Use the repository template at [.github/pull_request_template.md](./.github/pull_request_template.md).

Expectations:

- explain the purpose of the change clearly
- list major code or configuration changes
- mark the affected modules accurately
- document database or migration impact
- describe local verification performed
- update documentation when commands, workflows, or behavior change

For changes that affect finance or settlement flows, include business impact notes in the PR body.

## Development Standards

Repository-wide standards:

- prefer focused changes over broad unrelated refactors
- fix root causes instead of patching symptoms when practical
- keep secrets, tokens, and local environment files out of git
- add or update tests for behavior changes
- keep CI green before merge
- update module-level README files when setup or workflows change

Monorepo standards:

- keep module-specific code under the correct app or package
- prefer shared packages only when logic is truly reused across modules
- keep root tooling generic so future modules can reuse the same workflows

## Release Model

This repository uses a single root semantic-release workflow.

That means:

- releases are created from commits merged into `main`
- the release stream is shared across the monorepo
- commit quality matters because release notes are generated from commit history
