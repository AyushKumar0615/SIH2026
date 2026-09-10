-- Persist completed cognitive-game sessions for caregiver analytics.
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null,
  domain text not null,
  score integer not null check (score >= 0),
  accuracy numeric(5,2) not null check (accuracy >= 0 and accuracy <= 100),
  best_streak integer not null default 0 check (best_streak >= 0),
  difficulty_level integer not null check (difficulty_level >= 1 and difficulty_level <= 5),
  completed_at timestamptz not null default now()
);

create index if not exists game_sessions_user_completed_idx on public.game_sessions (user_id, completed_at desc);
alter table public.game_sessions enable row level security;

drop policy if exists "elder select own game sessions" on public.game_sessions;
create policy "elder select own game sessions" on public.game_sessions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "elder insert own game sessions" on public.game_sessions;
create policy "elder insert own game sessions" on public.game_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "caregiver select connected elder game sessions" on public.game_sessions;
create policy "caregiver select connected elder game sessions" on public.game_sessions for select to authenticated using (
  exists (select 1 from public.caregiver_connections cc where cc.elder_id = game_sessions.user_id and cc.caregiver_id = (select auth.uid()) and cc.status = 'accepted')
);
drop policy if exists "admin select all game sessions" on public.game_sessions;
create policy "admin select all game sessions" on public.game_sessions for select to authenticated using (public.is_admin());
grant select, insert on public.game_sessions to authenticated;
