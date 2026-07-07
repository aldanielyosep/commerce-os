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
