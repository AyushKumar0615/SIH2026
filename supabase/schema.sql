-- Run once in the Supabase SQL editor for this project.
-- Stores SmritiSetu user profile data (role, region, language, avatar) alongside
-- Supabase Auth, which owns email/password and is never duplicated here.

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
