# Carcommerce / MojaNavtika.si — Backend Architecture

Stack: **Supabase** (Postgres + Auth) + a small **Fastify API** + **Cloudflare**
(DNS, WAF, R2 images, Pages hosting). Source of truth for how the backend fits together.

## Stack

| Concern               | Service              | Code / config                                   |
| --------------------- | -------------------- | ----------------------------------------------- |
| Database + Auth       | **Supabase**         | `supabase/`, `server/src/lib/supabase.ts`, `src/lib/supabase.js` |
| API                   | **Fastify (Docker)** | `server/`, `server/Dockerfile`                  |
| Public images         | **Cloudflare R2**    | `server/src/lib/r2.ts`, `src/lib/uploads.js`    |
| Search / filtering    | **Typesense**        | `server/src/lib/typesense.ts`, `src/lib/search.js` |
| Rate limiting         | **Upstash Redis**    | `server/src/plugins/rateLimit.ts`               |
| Transactional email   | **Resend**           | `server/src/lib/resend.ts`, `routes/emails.ts`  |
| Error tracking        | **Sentry**           | `server/src/lib/sentry.ts`, `src/lib/monitoring.js` |
| Product analytics     | **PostHog**          | `src/lib/analytics.js`, `server/src/lib/posthog.ts` |
| Edge / WAF / CDN      | **Cloudflare**       | `infra/cloudflare-notes.md`                      |

## Request flow

```
Browser (Vite SPA, two portals)
  │  ├─ Supabase JS  ──────────────► Supabase (Auth + Postgres, RLS-guarded)
  │  ├─ Typesense JS (scoped key) ─► Typesense (instant search)
  │  └─ fetch + JWT
  ▼
Cloudflare (DNS, WAF, TLS, rate-limit, Turnstile)
  ▼
Fastify API (/api/*)
    ├─ Supabase (service role for trusted ops)
    ├─ R2 (presigned URLs)
    ├─ Typesense (admin: index writes)
    ├─ Upstash Redis (distributed rate limit)
    ├─ Resend (email)
    └─ Sentry / PostHog (server events)
```

Image bytes go **browser → R2** via presigned PUT (never through the API).

## Getting it running

1. Create the cloud resources (Supabase, R2, Upstash, Typesense, Resend,
   Sentry, PostHog) — see `infra/README.md`.
2. Apply `supabase/` SQL files in order (see `supabase/README.md`).
3. `server/.env` from `server/.env.example`; `.env` (root) from `.env.example`.
4. `cd server && npm install && npm run dev` → `GET /healthz`.
5. Root: `npm install && npm run dev`.
6. `cd server && npm run typesense:sync` to build the search index.

## Data model

See `supabase/README.md`. Column convention: snake_case (`provider_id`,
`created_at`); category-specific fields live in the `data` jsonb column.
