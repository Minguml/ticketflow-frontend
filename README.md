# TicketFlow frontend

The frontend is a Next.js App Router application. The local dev server runs on port `3004`.

## Portals

- `http://operator.localhost:3004/login` is the operator and administrator portal.
- `http://localhost:3004/login` is the passenger portal entry point.

The root page selects the portal from the hostname. The operator portal supports authentication, session checks, station and route CRUD (including PUT and PATCH actions), and administrator-only operator access management.

## Feature structure

Next.js route files under `src/app` are thin adapters. Product behavior lives under `src/features`: `auth` owns sessions and login, `operator` owns the operations shell, `stations`, `routes`, and `admin-access` own their workflows, and `user` owns the passenger entry point. Each feature with API endpoints owns its endpoint functions and domain types in an `api/` folder. The shared HTTP request helper and base URL stay in `src/lib/api-client.ts`; generated shadcn primitives stay in `src/components/ui`.

## Configuration

Set `NEXT_PUBLIC_API_URL` when the API is not at the default `http://localhost:8080/api/v1`:

```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1"
pnpm dev
```

No secrets are committed. JWTs are held in browser local storage for this MVP and are sent as Bearer tokens to the Go API.
