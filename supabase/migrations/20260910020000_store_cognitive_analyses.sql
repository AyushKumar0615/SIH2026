-- Store one durable AI analysis per completed game session. The status makes
-- retries safe: only a pending/failed session may be claimed for processing.
alter table public.game_sessions
  add column if not exists completion_time_seconds integer check (completion_time_seconds >= 0),
  add column if not exists analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'processing', 'ready', 'failed')),
  add column if not exists analysis jsonb,
  add column if not exists analysis_error text,
  add column if not exists analysis_started_at timestamptz,
  add column if not exists analysis_generated_at timestamptz;

create index if not exists game_sessions_user_analysis_completed_idx
  on public.game_sessions (user_id, analysis_status, completed_at desc);
