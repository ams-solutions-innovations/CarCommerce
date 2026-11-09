-- ═══════════════════════════════════════════════════════════════════════════
-- B2B migration — run AFTER schema.sql, policies.sql and security.sql.
-- Idempotent: safe to run more than once.
--
-- Adds what the B2B pages already call but the base schema did not define:
--   • public.services         price list ("Storitve in cenik")
--   • public.service_records  digital service book ("Vnos servisa", by VIN)
-- and fixes access rules for businesses / bookings:
--   • one business row per owner (profile editor upserts on owner_id)
--   • customers may cancel their OWN booking (and only cancel it)
--   • customers can only create bookings in status 'pending'
-- ═══════════════════════════════════════════════════════════════════════════

-- ── services (price list of a business) ──────────────────────────────────────
create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  category    text,
  description text,
  price_type  text not null default 'fixed' check (price_type in ('fixed', 'from', 'quote')),
  price       numeric(12,2) check (price is null or price >= 0),
  duration_min int check (duration_min is null or duration_min > 0),
  icon        text,                                -- lucide icon name
  icon_id     text,                                -- id from src/data/serviceIcons.js
  active      boolean not null default true,
  sort_order  int not null default 0,
  data        jsonb not null default '{}'::jsonb,  -- anything the UI adds later
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_services_provider on public.services(provider_id, category);
drop trigger if exists trg_services_updated on public.services;
create trigger trg_services_updated before update on public.services
  for each row execute function set_updated_at();

-- ── service_records (digital service book, keyed by VIN) ─────────────────────
create table if not exists public.service_records (
  id          uuid primary key default gen_random_uuid(),
  vin         text not null check (char_length(vin) between 5 and 17),
  mechanic_id uuid references public.profiles(id) on delete set null,
  data        jsonb not null default '{}'::jsonb,  -- date, mileage, serviceType, description, mechanicName
  created_at  timestamptz not null default now()
);
create index if not exists idx_service_records_vin on public.service_records(vin, created_at desc);
create index if not exists idx_service_records_mechanic on public.service_records(mechanic_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.services        enable row level security;
alter table public.service_records enable row level security;

-- services: public price list (shown on the public business profile),
-- only the owning provider (or an admin) writes.
drop policy if exists services_public_read on public.services;
create policy services_public_read on public.services for select using (true);
drop policy if exists services_owner_write on public.services;
create policy services_owner_write on public.services for all
  using (auth.uid() = provider_id or public.is_admin())
  with check (auth.uid() = provider_id or public.is_admin());

-- service_records: the service history is a deliberate trust feature shown on
-- listing pages, so it is publicly readable. A record can only be written
-- under the mechanic's own id; nobody can rewrite someone else's entries.
drop policy if exists service_records_public_read on public.service_records;
create policy service_records_public_read on public.service_records for select using (true);
drop policy if exists service_records_mechanic_insert on public.service_records;
create policy service_records_mechanic_insert on public.service_records for insert
  with check (auth.uid() = mechanic_id);
drop policy if exists service_records_mechanic_update on public.service_records;
create policy service_records_mechanic_update on public.service_records for update
  using (auth.uid() = mechanic_id or public.is_admin())
  with check (auth.uid() = mechanic_id or public.is_admin());
drop policy if exists service_records_mechanic_delete on public.service_records;
create policy service_records_mechanic_delete on public.service_records for delete
  using (auth.uid() = mechanic_id or public.is_admin());

-- security.sql revokes default table privileges from `anon` for new tables, so
-- grant the public-read ones explicitly. Writes stay authenticated-only (and
-- are still filtered by the policies above).
grant select on public.services, public.service_records to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant insert, update, delete on public.service_records to authenticated;

-- ── businesses: exactly one row per owner ────────────────────────────────────
-- The profile editor does upsert(..., onConflict: 'owner_id').
create unique index if not exists uq_businesses_owner on public.businesses(owner_id);

-- ── bookings ────────────────────────────────────────────────────────────────
create index if not exists idx_bookings_provider_date on public.bookings(provider_id, date);
create index if not exists idx_bookings_customer on public.bookings(customer_id);

-- A customer may only create PENDING bookings; the provider may create any
-- (e.g. 'blocked' slots from the reservations page).
drop policy if exists bookings_create on public.bookings;
create policy bookings_create on public.bookings for insert
  with check (
    (auth.uid() = customer_id and status = 'pending')
    or auth.uid() = provider_id
  );

-- A customer may cancel their own booking — nothing else.
drop policy if exists bookings_customer_cancel on public.bookings;
create policy bookings_customer_cancel on public.bookings for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id and status = 'cancelled');
