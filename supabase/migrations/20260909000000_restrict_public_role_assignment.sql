-- ─────────────────────────────────────────────────────────────────
-- Restrict public role assignment
-- The "insert own profile" and "update own profile" policies only ever
-- checked `auth.uid() = id` — nothing stopped an authenticated client from
-- inserting/updating their own row with role = 'admin' directly (bypassing
-- the registration UI entirely, e.g. via a modified request or the browser
-- console). This closes both paths for the public client while leaving
-- direct database access (Supabase Dashboard / SQL editor / service role —
-- the existing, informal way an admin account is provisioned today)
-- untouched, since that path doesn't go through PostgREST and has no
-- auth.uid() in its session context.
-- ─────────────────────────────────────────────────────────────────

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile" on public.profiles
  for insert
  with check (auth.uid() = id and lower(trim(role)) in ('elderly', 'caregiver'));

create or replace function public.prevent_self_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only blocks a user changing THEIR OWN role through the public client
  -- API (auth.uid() = OLD.id). A direct database session (dashboard/SQL
  -- editor/service role) has no auth.uid() here, so this never touches
  -- that path — it stays the only way to grant the admin role, exactly as
  -- it already is today.
  if NEW.role is distinct from OLD.role and auth.uid() = OLD.id then
    raise exception 'role_change_not_allowed';
  end if;
  return NEW;
end;
$$;

drop trigger if exists prevent_self_role_escalation_on_profiles on public.profiles;
create trigger prevent_self_role_escalation_on_profiles
  before update on public.profiles
  for each row execute function public.prevent_self_role_escalation();
