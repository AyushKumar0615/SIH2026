-- Reminder push notifications (Android/desktop Web Push background delivery)
--
-- Two new tables:
--  - push_subscriptions: one row per browser/device that has opted in to
--    push notifications, storing the Web Push endpoint + encryption keys
--    the browser handed back from PushManager.subscribe(). Owner-only RLS —
--    nobody but the subscribing user (and the service-role Edge Function,
--    which bypasses RLS entirely by design) ever reads or writes these.
--  - sent_reminder_notifications: an idempotency ledger. A reminder has no
--    per-occurrence identity of its own (see reminders.time being a bare
--    "HH:MM" with no date — the client-side due-check in
--    src/services/reminderAlertEngine.js already works the same way), so
--    "this occurrence" is (reminder_id, occurrence_date). The unique
--    constraint below is what actually prevents a double-send when
--    multiple cron ticks race, a delivery retries, or the function is
--    invoked more than once for any reason.
--
-- The actual "is anything due right now" check and the send itself live in
-- the send-reminder-push Edge Function (supabase/functions/send-reminder-push),
-- which runs with the service-role key and therefore bypasses RLS on
-- purpose — that's the one place in this app that's expected to read across
-- users, and it never leaves Supabase's own infrastructure.
--
-- Idempotent: safe to run more than once.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "select own push subscriptions" on public.push_subscriptions;
create policy "select own push subscriptions" on public.push_subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "insert own push subscriptions" on public.push_subscriptions;
create policy "insert own push subscriptions" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own push subscriptions" on public.push_subscriptions;
create policy "update own push subscriptions" on public.push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own push subscriptions" on public.push_subscriptions;
create policy "delete own push subscriptions" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- No policies granted here on purpose — this table is never read or
-- written by the client directly, only by the Edge Function via the
-- service-role key (which bypasses RLS regardless of policies present).
-- RLS is still enabled so a future authenticated/anon grant mistake can't
-- silently expose it.
create table if not exists public.sent_reminder_notifications (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references public.reminders(id) on delete cascade not null,
  occurrence_date date not null,
  recipient_user_id uuid references public.profiles(id) on delete cascade not null,
  sent_at timestamptz not null default now(),
  unique (reminder_id, occurrence_date, recipient_user_id)
);

alter table public.sent_reminder_notifications enable row level security;

-- ─────────────────────────────────────────────────────────────────
-- Scheduling: invoke the send-reminder-push Edge Function once a minute.
--
-- Requires the pg_cron and pg_net extensions. Both are toggleable from the
-- Supabase Dashboard (Database → Extensions) on every plan tier at the time
-- of writing; if create extension fails below because they aren't enabled
-- yet, enable them there and re-run just this section.
--
-- The cron job authenticates to the function with a shared secret (never a
-- user credential) read from a Postgres-level setting, not hard-coded here,
-- so this file stays safe to commit. Before this job can actually fire
-- successfully, run once (with your own real values, from the SQL Editor,
-- NOT saved into this file or into git):
--
--   alter database postgres set app.cron_secret = '<same value as the
--     CRON_SECRET secret you set on the Edge Function>';
--
-- The URL below already points at this project (zsnhtoacqwgnoinbvstp, read
-- from .env.local) — only update it if you ever move this to a different
-- Supabase project.
-- ─────────────────────────────────────────────────────────────────
do $outer$
begin
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
exception when insufficient_privilege then
  raise notice 'pg_cron/pg_net could not be enabled here — enable them from the Supabase Dashboard (Database -> Extensions), then re-run this migration to schedule the job.';
end $outer$;

-- Guarded as a whole: if the extensions above didn't take (e.g. this ran
-- before they were enabled from the Dashboard), `cron`/`net` won't exist as
-- schemas yet, so every reference to them here is kept inside dynamic SQL
-- (`execute '...'`) that's only ever reached once both extensions are
-- confirmed present — a plain top-level `select cron.schedule(...)` would
-- fail to even parse on a database that doesn't have pg_cron yet, which
-- would abort this entire migration file instead of just skipping this part.
do $outer$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then

    execute $exec$select cron.unschedule(jobid) from cron.job where jobname = 'send-reminder-push'$exec$;

    execute $exec$
      select cron.schedule(
        'send-reminder-push',
        '* * * * *',
        $job$
        select net.http_post(
          url := 'https://zsnhtoacqwgnoinbvstp.supabase.co/functions/v1/send-reminder-push',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || coalesce(current_setting('app.cron_secret', true), '')
          ),
          body := '{}'::jsonb
        );
        $job$
      )
    $exec$;

    raise notice 'send-reminder-push cron job scheduled (runs every minute). Remember to set app.cron_secret (see comment above) before this can actually authenticate successfully.';
  else
    raise notice 'pg_cron/pg_net not available yet — the send-reminder-push job was NOT scheduled. Enable both extensions from the Dashboard, then re-run this migration.';
  end if;
end $outer$;
