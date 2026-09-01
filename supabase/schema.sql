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
