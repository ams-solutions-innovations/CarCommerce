# Backend Handoff — Carcommerce / MojaNavtika.si

**Audience:** backend developer picking this up cold.
**Last updated:** 2026-06-14.
**Status:** frontend runs on Supabase; the Fastify API is scaffolded and not yet deployed.

This is the single entry point. Companion docs:
- `docs/BACKEND_ARCHITECTURE.md` — architecture (source of truth)
- `docs/SECURITY.md` — every hardening control and where it lives
- `server/README.md`, `supabase/README.md`, `infra/README.md` — per-area detail

---

## 1. TL;DR — what this is

Supabase (DB + Auth) + Fastify API + Cloudflare. A backend developer's job:
**stand up the cloud resources, wire credentials, run the DB migrations and deploy the API.**

| Concern             | Service          | Code                                            |
| ------------------- | ---------------- | ----------------------------------------------- |
| API                 | Fastify (Docker) | `server/`, `server/Dockerfile`                  |
| Database + Auth     | Supabase         | `supabase/`, `server/src/lib/supabase.ts`       |
| Public images       | Cloudflare R2    | `server/src/lib/r2.ts`, `src/lib/uploads.js`    |
| Search / filtering  | Typesense        | `server/src/lib/typesense.ts`, `src/lib/search.js` |
| Rate limiting       | Upstash Redis    | `server/src/plugins/rateLimit.ts`               |
| Email               | Resend           | `server/src/lib/resend.ts`                      |
| Error tracking      | Sentry           | `server/src/lib/sentry.ts`, `src/lib/monitoring.js` |
| Analytics           | PostHog          | `src/lib/analytics.js`, `server/src/lib/posthog.ts` |
| Edge / WAF / CDN    | Cloudflare       | `infra/cloudflare-notes.md`                      |

**Tech:** API is **Fastify + TypeScript** (ESM, Node 20). Frontend is **Vite +
React/vanilla JS** (no TS), two portals from one codebase via `VITE_PLATFORM`
(`avto` | `navtika`), hosted on **Cloudflare Pages**.

---

## 2. What's done vs. what's left

### ✅ Done (in this repo, code-complete but not credentialed)
- Full Fastify API: bootstrap, config validation, auth (Supabase JWT), rate
  limiting, routes (health, uploads, search, listings, emails, webhooks).
- Lib clients for all 10 services (server + frontend).
- Supabase `schema.sql` + `policies.sql` (RLS) + `security.sql` (hardening).
- Docker + `docker-compose.yml` (local Typesense/Redis) + Cloudflare infra notes.
- Security pass: see `docs/SECURITY.md` (17 controls implemented).
- CI: Dependabot + Gitleaks + npm-audit (`.github/workflows/security.yml`).

### ⬜ Left to do
1. **Provision cloud resources** and fill credentials (§5, §6).
2. **Install deps** (§4) — `server/` and root `npm install`.
3. **Run DB migrations** (§7) and configure Supabase Auth (templates, providers, captcha).
4. **Deploy the API** as a container behind Cloudflare (§8).
5. **Build business logic** nobody wrote yet: auction auto-close + winner,
   boost/promotion expiry, Stripe payments, transactional emails
   (outbid/won/sold), business verification (§9).

---

## 3. Repo layout (new backend dirs)

```
server/                     Fastify API (Docker container)
  src/
    index.ts                entry (listen 0.0.0.0:PORT)
    app.ts                  Fastify build: helmet/CSP, CORS, cookies, plugins, routes, error handler
    config/env.ts           zod-validated env (fail-fast at boot)
    plugins/
      auth.ts               Bearer→JWT verify (HS256), request.user, requireAuth/requireAdmin
      rateLimit.ts          Upstash limiters (global + IP-keyed email/auth/upload)
    routes/                 health, uploads, search, listings, emails, webhooks
    lib/                    supabase, redis, r2, typesense, resend, sentry, posthog,
                            validation, turnstile, ssrf, webhooks, ownership, audit
    scripts/syncTypesense.ts  (re)create + backfill the search index
  Dockerfile, .env.example, tsconfig.json, package.json

supabase/                   schema.sql → policies.sql → security.sql (apply in order)
infra/                      cloudflare-notes.md, typesense-listings.schema.json
src/lib/                    frontend client layer
.github/                    dependabot.yml, workflows/security.yml
docker-compose.yml          local Typesense + Redis (+ REST shim)
.env.example                frontend (VITE_*) env template
```

---

## 4. Local development

```bash
# 1. API
cd server
cp .env.example .env        # fill in (see §5/§6)
npm install                 # adds jose, @fastify/cookie, fastify-raw-body, SDKs
npm run dev                 # http://localhost:8080/healthz

# 2. Frontend (repo root)
cp .env.example .env.local  # fill in VITE_* values
npm install                 # adds @supabase/supabase-js, posthog-js, @sentry/browser, typesense
npm run dev                 # http://localhost:3000 (avto)  |  npm run dev:navtika

# 3. Local search/cache deps (optional — or point at cloud free tiers)
docker compose up -d        # Typesense :8108, Redis + REST shim
```

Everything degrades gracefully when a credential is missing: Sentry/PostHog/
Turnstile no-op, rate limiting is skipped in non-prod. So you can run the API
with only Supabase + (local) Typesense/Redis configured.

`npm run typecheck` (in `server/`) before pushing — strict TS is on.

---

## 5. Cloud accounts to create

| Service | Plan | What to grab |
| ------- | ---- | ------------ |
| Supabase | **Pro** | project URL, anon key, service_role key, JWT secret |
| Cloudflare | Free/Pro | account + R2 bucket; R2 access key/secret; custom CDN domain; Turnstile keys; WAF |
| Upstash | Free+ | Redis DB → REST URL + token |
| Typesense | Cloud | cluster host; admin API key; **search-only** API key |
| Resend | Free+ | API key; verify both sending domains; webhook signing secret |
| Sentry | — | DSN (one project, or one per portal) |
| PostHog | EU cloud | project API key (`phc_...`), host `https://eu.i.posthog.com` |

---

## 6. Environment variables

**Server** (`server/.env`, prod via your host's secret store). Full list + comments in `server/.env.example`:

```
NODE_ENV, PORT, CORS_ORIGINS
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_ADMIN_API_KEY, TYPESENSE_SEARCH_ONLY_API_KEY
RESEND_API_KEY, RESEND_FROM_AVTO, RESEND_FROM_NAVTIKA, RESEND_WEBHOOK_SECRET
SENTRY_DSN, SENTRY_TRACES_SAMPLE_RATE
POSTHOG_API_KEY, POSTHOG_HOST
TURNSTILE_SECRET_KEY
```

> This Supabase project signs JWTs with **ES256** (JWKS). Do **not** set
> `SUPABASE_JWT_SECRET` (the plugin pins HS256 and would reject every token); without
> it the auth plugin falls back to a network `getUser()` call per request.

**Frontend** (`.env.local`, all `VITE_`-prefixed, all public). See `.env.example`:

```
VITE_API_BASE_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
VITE_TYPESENSE_HOST/PORT/PROTOCOL, VITE_SENTRY_DSN,
VITE_POSTHOG_KEY, VITE_POSTHOG_HOST, VITE_R2_PUBLIC_BASE_URL, VITE_TURNSTILE_SITE_KEY
```

Secrets policy: **never** commit real values; Gitleaks runs in CI. Prod secrets
are injected at runtime from the host's secret store, never written to disk.

---

## 7. Database

**Apply order** (hosted SQL editor or `supabase db execute`):
`schema.sql` → `policies.sql` → `security.sql`.

- `schema.sql` — tables/enums/triggers; auto-creates a `profiles` row per new
  `auth.users`; `updated_at` triggers. UUID PKs everywhere.
- `policies.sql` — RLS; `is_admin()` helper.
- `security.sql` — `place_bid()` with `SELECT … FOR UPDATE`, append-only
  `private.audit_log`, the non-exposed `private` schema.

**Supabase Auth config (dashboard):**
- Confirm email **ON** (anti-enumeration).
- Google provider (OAuth client ID + secret from Google Cloud).
- Turnstile under Attack Protection (same keys as the app).
- Leaked-password protection (HIBP) **ON**.
- Site URL + redirect allow-list = the two portal domains only.
- Slovenian email templates, correct sender per platform.
- **Exposed schemas = `public` only** (never `private`).

**Table mapping:** see `supabase/README.md`. Columns are snake_case
(`provider_id`, `created_at`); category-specific fields live in jsonb `data`.
After loading data: `cd server && npm run typesense:sync` to build the search index.

---

## 8. Deploy (API)

1. Build the image: `docker build -t carcommerce-api ./server`
2. Deploy it to a container host of your choice; inject all secrets from
   `server/.env.example`; health check → `/healthz`.
3. Cloudflare: `api.*` → the API host (proxied), `cdn.*` → R2 custom domain,
   enable WAF + rate rules + Turnstile (`infra/cloudflare-notes.md`).
4. `npm run typesense:sync` once.
5. Frontend on Cloudflare Pages; set `VITE_API_BASE_URL` to `https://api.carcommerce.net`.

**No CI deploy pipeline for the API exists yet** — building/deploying is manual.

---

## 9. Business logic to build

- **Auction auto-close + winner** — a scheduled worker querying
  `auctions(status=open, ends_at<=now)`; close in a transaction, set winner,
  enqueue "won" email. Use `place_bid()` for bids (already has `FOR UPDATE`).
- **Boost/promotion expiry** — same scheduler clears `listings.promotion` past `expiresAt`.
- **Payments** — Stripe Checkout (hosted) + a signed webhook (reuse
  `verifySvixSignature` pattern in `server/src/lib/webhooks.ts`, adapt for Stripe);
  the webhook is the only place that grants a boost.
- **Transactional emails** — outbid / won / sold via `server/src/lib/resend.ts`
  (respect notify prefs + GDPR consent in `profiles.prefs`).
- **Business verification** — admin flips `businesses.tier='verified'`; gate via
  `requireAdmin` + write an `audit_log` entry.

---

## 10. Security (summary)

Full map in `docs/SECURITY.md`. Highlights a backend dev must preserve:
- RLS is enforced via PostgREST per-request (`supabaseForUser(jwt)`); **service
  role bypasses RLS — server-only, never to the browser.** If you add direct SQL
  through the transaction pooler, set JWT claims with `set_local` *inside a tx*.
- Every mutation does an explicit `assertOwner()` (IDOR) on top of RLS.
- JWT verification must use a fixed algorithm allow-list (rejects `alg:none`).
- Presigned-URL + email endpoints are IP-rate-limited (not account-keyed).
- Webhooks must be signature-verified over the **raw body**.
- Errors return a generic message + `errorId`; full detail only to Sentry.
- Audit log is INSERT-only; admin actions/deletes write to it.

---

## 11. Open decisions / gotchas

- **bcrypt 72-byte cap** — Supabase hashes passwords with bcrypt; signup is capped
  at 72 (`signupPasswordField`). Don't "fix" this with a higher limit.
- **CSP is in two places** — `app.ts` covers API responses; the SPA host
  (Cloudflare Pages) must send the same `Content-Security-Policy` via a `_headers` file.
- **Frontend is mostly plain JS, API is TS** — shared types aren't auto-shared;
  keep `src/lib/validation.js` ↔ `server/src/lib/validation.ts` `LIMITS` in sync.
- **No API CI/CD yet** — manual docker build/deploy.
- **Introspection lockdown** is config, not code — `infra/cloudflare-notes.md`, Supabase dashboard.
- **Two platforms** — most resources are shared; data is tagged `platform` and
  Typesense keys are platform-scoped. Don't leak avto↔navtika data.

---

## 12. File index (start here when reading code)

- API entry/flow: `server/src/app.ts`
- Add a route: copy `server/src/routes/listings.ts` (auth + ownership + audit + index)
- Add a service client: `server/src/lib/*.ts`
- DB shape: `supabase/schema.sql`; access rules: `supabase/policies.sql`
- Frontend → backend calls: `src/lib/apiClient.js`, `src/lib/supabase.js`
- Security rationale: `docs/SECURITY.md`
- Architecture + migration: `docs/BACKEND_ARCHITECTURE.md`
