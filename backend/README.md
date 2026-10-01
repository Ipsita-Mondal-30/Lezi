# Lezi Backend

Lezi is a mobile dating application with two journeys: **CONNECT** (meaningful / long-term) and **PLAY** (casual). This repository contains the Node.js API.

Sprint 1 Day 2 establishes a modular-monolith foundation, the core `users` table, JWT authentication against Supabase Auth, and the first authenticated endpoint.

## Tech stack

- Node.js 20+
- TypeScript (strict)
- Express.js
- PostgreSQL via Supabase
- Supabase Auth
- REST JSON APIs

## Folder structure

```
backend/
├── src/
│   ├── config/           # env validation and Supabase clients
│   ├── middleware/       # auth, 404, error handler
│   ├── modules/auth/     # routes → controller → service
│   ├── shared/           # AppError, types, utils, constants
│   ├── app.ts
│   └── server.ts
├── supabase/migrations/  # SQL migrations
├── postman/              # API collection and local environment
├── .env.example
├── package.json
└── tsconfig.json
```

## Environment variables

Copy `.env.example` to `.env` and fill in values from the Supabase project settings. Never commit `.env`.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Anon/public key used to validate JWTs |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for `public.users` (never ship to Flutter) |
| `PORT` | HTTP port (default `5000`) |
| `NODE_ENV` | `development` or `production` |

The process exits on startup if a required variable is missing.

## Install

```bash
cd backend
cp .env.example .env
# edit .env with real Supabase values
npm install
```

## Run the development server

```bash
npm run dev
```

If port `5000` is already in use (common on macOS because AirPlay uses it), set `PORT=5001` in `.env`.

Production-style run:

```bash
npm run build
npm start
```

## API base URL

```
http://localhost:5000
```

Versioned API routes live under `/api/v1`.

## Authentication flow

1. Flutter signs the user in with **Supabase Auth**.
2. The client sends `Authorization: Bearer <access_token>` to this API.
3. Auth middleware validates the JWT with Supabase (`getUser`).
4. The authenticated Auth user id is attached to `req.user`.
5. The auth service loads or creates a row in `public.users` keyed by `auth_id`.

The API never trusts a client-supplied user id. Application identity always comes from the validated token.

Supabase Auth user → `auth_id` → application `users` row → later profile / preferences / journey.

## Implemented endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Process liveness |
| `GET` | `/api/v1/auth/me` | Bearer JWT | Current application user (creates the row if missing) |

## Database

Apply [`supabase/migrations/20261001000000_create_users.sql`](supabase/migrations/20261001000000_create_users.sql) in the Supabase SQL editor (or CLI) before calling `/api/v1/auth/me`.

`public.users` columns: `id`, `auth_id` (unique, FK to `auth.users`), `email`, `current_journey` (`PLAY` \| `CONNECT` \| null), `onboarding_completed` (default false), `created_at`, `updated_at`.

Row Level Security is enabled with no client policies. The API uses the service-role client.

## How to test `/health`

```bash
curl -s http://localhost:5000/health
```

Expected **200**:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## How to test `/api/v1/auth/me`

Without a token (expected **401**):

```bash
curl -s http://localhost:5000/api/v1/auth/me
```

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

Malformed header (expected **401**):

```bash
curl -s -H "Authorization: Bearer" http://localhost:5000/api/v1/auth/me
```

With a valid Supabase access token (expected **200**):

```bash
curl -s -H "Authorization: Bearer ACCESS_TOKEN" http://localhost:5000/api/v1/auth/me
```

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "auth_id": "uuid",
      "email": "user@example.com",
      "current_journey": null,
      "onboarding_completed": false,
      "created_at": "2026-10-01T00:00:00.000Z",
      "updated_at": "2026-10-01T00:00:00.000Z"
    }
  }
}
```

Repeated calls with the same token must not create duplicate `users` rows.

Postman: import `postman/Lezi-API.postman_collection.json` and `postman/Lezi-API.postman_environment.json`. Set `accessToken` to a Supabase JWT.
