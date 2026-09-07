-- Elder location tracking
--
-- Two tables:
--  - elder_location_settings: one row per elder, tracking whether they've
--    opted in to sharing and the last known browser permission state, so a
--    later login can auto-resume tracking instead of asking again.
--  - elder_locations: an append-only log of location samples (matches the
--    time-series pattern already used elsewhere in this schema), so the
--    caregiver/admin views always read the single most recent row per
--    elder rather than a hand-maintained "latest" column that could drift.
--
-- RLS mirrors the existing caregiver_connections pattern exactly: an elder
-- owns their own rows, a caregiver may read only for elders they have an
-- ACCEPTED connection with, and admin read access goes through the
-- existing is_admin() helper. No broad write access is granted to anyone
-- but the elder themselves.
--
-- Idempotent: safe to run more than once. Re-declares touch_updated_at()
-- (already created by an earlier migration) so this file has no ordering
-- dependency on that one having run first or successfully.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.elder_location_settings (
  elder_id uuid primary key references public.profiles(id) on delete cascade,
  location_sharing_enabled boolean not null default false,
  location_permission_status text not null default 'prompt'
    check (location_permission_status in ('prompt', 'granted', 'denied', 'unavailable')),
  last_location_update timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.elder_location_settings enable row level security;

drop trigger if exists set_elder_location_settings_updated_at on public.elder_location_settings;
create trigger set_elder_location_settings_updated_at
  before update on public.elder_location_settings
  for each row execute function public.touch_updated_at();

drop policy if exists "elder manage own location settings" on public.elder_location_settings;
create policy "elder manage own location settings" on public.elder_location_settings
  for all using (auth.uid() = elder_id) with check (auth.uid() = elder_id);

drop policy if exists "caregiver select connected elder location settings" on public.elder_location_settings;
create policy "caregiver select connected elder location settings" on public.elder_location_settings
  for select using (
    exists (
      select 1 from public.caregiver_connections cc
      where cc.elder_id = elder_location_settings.elder_id
        and cc.caregiver_id = auth.uid()
        and cc.status = 'accepted'
    )
  );

drop policy if exists "admin select all location settings" on public.elder_location_settings;
create policy "admin select all location settings" on public.elder_location_settings
  for select using (public.is_admin());

grant select, insert, update on public.elder_location_settings to authenticated;

create table if not exists public.elder_locations (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  recorded_at timestamptz not null default now()
);

create index if not exists elder_locations_elder_id_recorded_at_idx
  on public.elder_locations (elder_id, recorded_at desc);

alter table public.elder_locations enable row level security;

drop policy if exists "elder insert own location" on public.elder_locations;
create policy "elder insert own location" on public.elder_locations
  for insert with check (auth.uid() = elder_id);

drop policy if exists "elder select own location" on public.elder_locations;
create policy "elder select own location" on public.elder_locations
  for select using (auth.uid() = elder_id);

drop policy if exists "caregiver select connected elder location" on public.elder_locations;
create policy "caregiver select connected elder location" on public.elder_locations
  for select using (
    exists (
      select 1 from public.caregiver_connections cc
      where cc.elder_id = elder_locations.elder_id
        and cc.caregiver_id = auth.uid()
        and cc.status = 'accepted'
    )
  );

drop policy if exists "admin select all locations" on public.elder_locations;
create policy "admin select all locations" on public.elder_locations
  for select using (public.is_admin());

grant select, insert on public.elder_locations to authenticated;

-- Enable realtime so the caregiver/admin location views can subscribe to
-- new samples instead of polling. Guarded two ways: skips the ALTER if
-- the table is already a publication member, AND catches undefined_object
-- in case this project has no "supabase_realtime" publication at all —
-- either way, this step can never fail the whole script (and roll back
-- the table creations above with it, if the SQL editor runs the pasted
-- script as one transaction).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'elder_locations'
  ) then
    alter publication supabase_realtime add table public.elder_locations;
  end if;
exception when undefined_object then
  raise notice 'supabase_realtime publication not found on this project — elder_locations tables were still created, but realtime push updates are unavailable until Realtime is enabled for this project.';
end $$;
