create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  site text not null,
  ip text,
  user_agent text,
  endpoint text not null,
  event_type text not null,
  severity text not null check (severity in ('low','medium','high')),
  detail jsonb not null default '{}'::jsonb,
  alerted boolean not null default false
);
create index if not exists security_events_ip_time on public.security_events (ip, created_at desc);
grant all on public.security_events to service_role;
alter table public.security_events enable row level security;

create table if not exists public.request_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  ip text not null,
  endpoint text not null
);
create index if not exists request_log_lookup on public.request_log (ip, endpoint, created_at desc);
grant all on public.request_log to service_role;
alter table public.request_log enable row level security;

create extension if not exists pg_cron;
select cron.schedule('security-log-retention', '15 3 * * *', $$
  delete from public.request_log where created_at < now() - interval '1 day';
  delete from public.security_events where created_at < now() - interval '90 days';
$$);