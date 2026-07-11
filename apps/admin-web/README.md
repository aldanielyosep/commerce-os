# commerce-os web

Frontend MVP for Commerce OS Phase G.

## Stack

- Vite
- React
- TypeScript
- React Router

## Pages included

- Login
- Dashboard shell
- Employees
- Departments
- Users (super_admin only)
- Salary and position timelines
- Documents
- Password reset request

## Environment

Create `.env.local` if you want a custom API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Defaults to `http://localhost:3000` when not set.

## Run

From repo root:

```bash
pnpm install
pnpm --filter @commerce-os/admin-web dev
```

Build:

```bash
pnpm --filter @commerce-os/admin-web build
```

## Quality Checks

Lint:

```bash
pnpm --filter @commerce-os/admin-web lint
```

Typecheck:

```bash
pnpm --filter @commerce-os/admin-web typecheck
```

Unit tests:

```bash
pnpm --filter @commerce-os/admin-web test
```

Coverage:

```bash
pnpm --filter @commerce-os/admin-web test:coverage
```

Coverage gate policy:

- Global line coverage must be at least 90%.
- Per-file line coverage must be at least 80%.

Dependency security audit (high+ prod issues):

```bash
pnpm --filter @commerce-os/admin-web audit --prod --audit-level=high
```
