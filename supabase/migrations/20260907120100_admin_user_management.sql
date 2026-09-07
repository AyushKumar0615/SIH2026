-- Admin user management
-- Adds the account-status column the Admin user list needs, plus two
-- narrow, admin-only RPCs for the two write actions Admin performs on
-- other people's data (deactivate/reactivate an account, disconnect a
-- caregiver/elder pair). Deliberately RPC-mediated rather than broad
-- "admin can UPDATE/DELETE any row" policies: each RPC re-checks
-- is_admin() itself and touches only the one column/row it names, so
-- the blast radius of a client bug or compromised session is a single
-- flag flip or a single connection row — not arbitrary writes to
-- profiles or caregiver_connections. No existing policy is changed;
-- normal users still write only their own rows exactly as before.
--
-- Idempotent: safe to run more than once. Adding the column with a
-- default backfills every existing row as active — no one is
-- silently deactivated by running this.

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
