-- Admin read access
-- The Admin dashboard needs platform-wide visibility (user counts,
-- recent activity) that no existing policy grants — every policy so
-- far scopes access to "your own row" or "a party to this specific
-- connection." is_admin() is SECURITY DEFINER so it can check the
-- caller's own role without recursing into the policies it's used
-- inside of. These policies are additive (read-only) and don't
-- change any existing policy's behavior for non-admin users.
--
-- Idempotent: safe to run more than once.

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
