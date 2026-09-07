-- Run once in the Supabase SQL editor for this project.
-- Stores SmritiSetu user profile data (role, region, language, avatar) alongside
-- Supabase Auth, which owns email/password and is never duplicated here.
--
-- This file is the consolidated, always-current reference for manual application
-- via the Supabase SQL Editor. Everything added here from the "Admin read access"
-- section onward is also captured, in the same order, as standalone files under
-- ./migrations/ — use those with `supabase db push` once this project is linked
-- to the Supabase CLI (`supabase link`), so the schema can be applied and tracked
-- without hand-copying SQL. Keep both in sync when adding new sections.

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text,
  state text,
  language text,
  avatar text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- Elderly Memory Journal: each user's own family/festival/place memories.
create extension if not exists pgcrypto;

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  relation text,
  category text not null default 'Family',
  description text,
  voice_note text,
  favorite_memory text,
  photo_url text,
  created_at timestamptz default now()
);

alter table public.memories enable row level security;

create policy "select own memories" on public.memories for select using (auth.uid() = user_id);
create policy "insert own memories" on public.memories for insert with check (auth.uid() = user_id);
create policy "update own memories" on public.memories for update using (auth.uid() = user_id);
create policy "delete own memories" on public.memories for delete using (auth.uid() = user_id);

-- RLS policies alone don't grant table access to a role — base privileges
-- are required too (see profiles setup notes).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.memories to authenticated;

-- Elderly Daily Reminders: each user's own reminder schedule.
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  time text not null,
  category text not null default 'Activity',
  icon text not null default '🔔',
  repeat_frequency text not null default 'Daily',
  days_of_week text[] not null default '{}',
  is_active boolean not null default true,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_time_idx on public.reminders (user_id, time);

alter table public.reminders enable row level security;

drop policy if exists "select own reminders" on public.reminders;
create policy "select own reminders" on public.reminders
  for select using (auth.uid() = user_id);

drop policy if exists "insert own reminders" on public.reminders;
create policy "insert own reminders" on public.reminders
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own reminders" on public.reminders;
create policy "update own reminders" on public.reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own reminders" on public.reminders;
create policy "delete own reminders" on public.reminders
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.reminders to authenticated;

-- ─────────────────────────────────────────────────────────────────
-- Caregiver ↔ Elder connections
-- An elder shares a 6-digit connection_code; a caregiver enters it to
-- send a pending request. The elder accepts/rejects. Once accepted,
-- the caregiver gains read-only access to that elder's reminders and
-- memories (see policies below). All identity/authorization checks
-- are enforced here at the database level, not just in the client.
-- ─────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists connection_code text unique;

create table if not exists public.caregiver_connections (
  id uuid primary key default gen_random_uuid(),
  elder_id uuid not null references public.profiles(id) on delete cascade,
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint caregiver_connections_no_self_link check (elder_id <> caregiver_id)
);

-- Only one active (pending or accepted) record per elder/caregiver pair.
-- A prior rejection doesn't block a fresh request, since rejected rows
-- fall outside this partial index.
create unique index if not exists caregiver_connections_active_pair_idx
  on public.caregiver_connections (elder_id, caregiver_id)
  where status in ('pending', 'accepted');

create index if not exists caregiver_connections_elder_idx on public.caregiver_connections (elder_id);
create index if not exists caregiver_connections_caregiver_idx on public.caregiver_connections (caregiver_id);

alter table public.caregiver_connections enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_caregiver_connections_updated_at on public.caregiver_connections;
create trigger set_caregiver_connections_updated_at
  before update on public.caregiver_connections
  for each row execute function public.touch_updated_at();

-- elder_id/caregiver_id must never change after creation, even via a
-- direct client-side update call — only status may be updated.
create or replace function public.prevent_connection_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.elder_id <> old.elder_id or new.caregiver_id <> old.caregiver_id then
    raise exception 'connection_identity_immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists lock_caregiver_connection_identity on public.caregiver_connections;
create trigger lock_caregiver_connection_identity
  before update on public.caregiver_connections
  for each row execute function public.prevent_connection_identity_change();

drop policy if exists "select own connections" on public.caregiver_connections;
create policy "select own connections" on public.caregiver_connections
  for select using (auth.uid() = elder_id or auth.uid() = caregiver_id);

drop policy if exists "caregiver creates own request" on public.caregiver_connections;
create policy "caregiver creates own request" on public.caregiver_connections
  for insert with check (auth.uid() = caregiver_id and status = 'pending' and elder_id <> caregiver_id);

drop policy if exists "elder responds to own requests" on public.caregiver_connections;
create policy "elder responds to own requests" on public.caregiver_connections
  for update using (auth.uid() = elder_id) with check (auth.uid() = elder_id);

drop policy if exists "either party disconnects" on public.caregiver_connections;
create policy "either party disconnects" on public.caregiver_connections
  for delete using (auth.uid() = elder_id or auth.uid() = caregiver_id);

grant select, insert, update, delete on public.caregiver_connections to authenticated;

-- A caregiver/elder may read the other party's basic profile only while
-- a pending or accepted connection links them. Additive to (does not
-- replace) the existing "select own profile" policy above.
drop policy if exists "select connected profiles" on public.profiles;
create policy "select connected profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.caregiver_connections cc
      where cc.status in ('pending', 'accepted')
        and ((cc.elder_id = auth.uid() and cc.caregiver_id = profiles.id)
          or (cc.caregiver_id = auth.uid() and cc.elder_id = profiles.id))
    )
  );

-- Once accepted, a caregiver gets read-only access to that elder's
-- reminders and memories — never write access, and never before
-- acceptance.
drop policy if exists "caregiver select connected elder reminders" on public.reminders;
create policy "caregiver select connected elder reminders" on public.reminders
  for select using (
    exists (
      select 1 from public.caregiver_connections cc
      where cc.elder_id = reminders.user_id
        and cc.caregiver_id = auth.uid()
        and cc.status = 'accepted'
    )
  );

drop policy if exists "caregiver select connected elder memories" on public.memories;
create policy "caregiver select connected elder memories" on public.memories
  for select using (
    exists (
      select 1 from public.caregiver_connections cc
      where cc.elder_id = memories.user_id
        and cc.caregiver_id = auth.uid()
        and cc.status = 'accepted'
    )
  );

-- Generates a unique 6-digit code; only called by regenerate_connection_code()
-- below, never granted directly to clients.
create or replace function public.generate_unique_connection_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
  tries int := 0;
begin
  loop
    candidate := lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.profiles where connection_code = candidate);
    tries := tries + 1;
    if tries > 20 then
      raise exception 'code_generation_failed';
    end if;
  end loop;
  return candidate;
end;
$$;

-- Elder-only: (re)issues the caller's own connection code.
create or replace function public.regenerate_connection_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_code text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  -- Compare case/whitespace-insensitively: a role value that only differs by
  -- case or stray spacing (e.g. from data entered outside the app's own
  -- registration form) must not incorrectly lock a real elder out of their
  -- own connection code. This does not loosen who qualifies as an elder —
  -- it only stops formatting noise from being treated as a different role.
  if v_role is null or lower(trim(v_role)) <> 'elderly' then
    raise exception 'not_elder';
  end if;
  v_code := public.generate_unique_connection_code();
  update public.profiles set connection_code = v_code where id = auth.uid();
  return v_code;
end;
$$;

grant execute on function public.regenerate_connection_code() to authenticated;

-- Caregiver-only: validates a code, blocks self-connection and
-- duplicate requests, and atomically creates the pending connection.
-- Runs as SECURITY DEFINER so the caregiver never needs broad SELECT
-- access on public.profiles just to resolve a code.
create or replace function public.request_caregiver_connection(p_code text)
returns table(elder_id uuid, elder_name text, connection_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_elder_id uuid;
  v_elder_name text;
  v_caregiver_role text;
  v_existing_status text;
  v_new_id uuid;
begin
  select role into v_caregiver_role from public.profiles where id = auth.uid();
  -- Same case/whitespace-insensitive comparison as regenerate_connection_code(),
  -- so both RPCs judge "is this an elder/caregiver account" from the same
  -- source (profiles.role via auth.uid()) the same way.
  if v_caregiver_role is null or lower(trim(v_caregiver_role)) <> 'caregiver' then
    raise exception 'not_caregiver';
  end if;

  select p.id, p.full_name into v_elder_id, v_elder_name
  from public.profiles p
  where lower(trim(p.role)) = 'elderly' and p.connection_code = trim(p_code)
  limit 1;

  if v_elder_id is null then
    raise exception 'invalid_code';
  end if;

  if v_elder_id = auth.uid() then
    raise exception 'self_connection';
  end if;

  select cc.status into v_existing_status
  from public.caregiver_connections cc
  where cc.elder_id = v_elder_id and cc.caregiver_id = auth.uid()
    and cc.status in ('pending', 'accepted')
  limit 1;

  if found then
    if v_existing_status = 'accepted' then
      raise exception 'already_connected';
    else
      raise exception 'already_pending';
    end if;
  end if;

  insert into public.caregiver_connections (elder_id, caregiver_id, status)
  values (v_elder_id, auth.uid(), 'pending')
  returning id into v_new_id;

  return query select v_elder_id, v_elder_name, v_new_id, 'pending'::text;
end;
$$;

grant execute on function public.request_caregiver_connection(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────
-- Admin read access
-- The Admin dashboard needs platform-wide visibility (user counts,
-- recent activity) that no existing policy grants — every policy so
-- far scopes access to "your own row" or "a party to this specific
-- connection." is_admin() is SECURITY DEFINER so it can check the
-- caller's own role without recursing into the policies it's used
-- inside of. These policies are additive (read-only) and don't
-- change any existing policy's behavior for non-admin users.
-- ─────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and lower(trim(role)) = 'admin'
  );
$$;

drop policy if exists "admin select all profiles" on public.profiles;
create policy "admin select all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "admin select all reminders" on public.reminders;
create policy "admin select all reminders" on public.reminders
  for select using (public.is_admin());

drop policy if exists "admin select all memories" on public.memories;
create policy "admin select all memories" on public.memories
  for select using (public.is_admin());

drop policy if exists "admin select all connections" on public.caregiver_connections;
create policy "admin select all connections" on public.caregiver_connections
  for select using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- Admin user management
-- Adds the account-status column the Admin user list needs, plus two
-- narrow, admin-only RPCs for the two write actions Admin performs on
-- other people's data (deactivate/reactivate an account, disconnect a
-- caregiver/elder pair). RPC-mediated rather than broad admin
-- UPDATE/DELETE policies, so a bug or compromised session can only
-- flip one flag or remove one connection row, not write arbitrary
-- columns. No existing policy changes; normal users still write only
-- their own rows exactly as before.
-- ─────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists is_active boolean not null default true;

create or replace function public.admin_set_user_active(p_user_id uuid, p_is_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  update public.profiles set is_active = p_is_active where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_user_active(uuid, boolean) to authenticated;

create or replace function public.admin_disconnect_connection(p_connection_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  delete from public.caregiver_connections where id = p_connection_id;
end;
$$;

grant execute on function public.admin_disconnect_connection(uuid) to authenticated;
