# infra/

Deployment & edge configuration for the backend.

| File                       | What it is                                                     |
| -------------------------- | ------------------------------------------------------------- |
| `cloudflare-notes.md`      | Cloudflare DNS / WAF / CDN / R2 binding configuration.         |
| `typesense-listings.schema.json` | The Typesense `listings` collection schema (also created by `server` `npm run typesense:sync`). |

## First deploy outline

1. **Supabase**: create project (Pro), run `supabase/schema.sql` then `supabase/policies.sql`.
2. **R2 + Upstash + Typesense + Resend + Sentry + PostHog**: create resources, collect keys.
3. **Secrets**: store all keys in your host's secret store (keys match `server/.env.example`).
4. **Container**: `docker build -t carcommerce-api ./server` and deploy to your chosen host.
5. **Cloudflare**: point `api.*` at the API host, bind `cdn.*` to R2, enable WAF — see notes.
6. Run `npm run typesense:sync` (from `server/`) to build the search index.
