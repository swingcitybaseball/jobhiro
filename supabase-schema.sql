-- JobPilot Supabase Schema
-- Run this entire file in the Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- ────────────────────────────────────────────────────────────
-- 1. analyses
--    Stores full AI results for authenticated users.
--    Anonymous results live in sessionStorage only (not saved here).
-- ────────────────────────────────────────────────────────────
create table public.analyses (
  id           uuid primary key,               -- matches AnalysisResult.id
  user_id      text not null,                  -- Clerk user ID
  job_title    text,
  job_company  text,
  job_url      text,
  result_json  jsonb not null,                 -- full AnalysisResult object
  created_at   timestamptz not null default now()
);

create index analyses_user_id_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

-- ────────────────────────────────────────────────────────────
-- 2. user_subscriptions
--    One row per Clerk user. Created/updated by Stripe webhook.
-- ────────────────────────────────────────────────────────────
create table public.user_subscriptions (
  user_id                text primary key,     -- Clerk user ID
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  plan                   text not null default 'free',   -- 'free'|'pro'|'premium'
  status                 text not null default 'active', -- 'active'|'canceled'|'past_due'
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Auto-update updated_at on every write
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- 3. anonymous_usage
--    Tracks free tier consumption by hashed IP address.
-- ────────────────────────────────────────────────────────────
create table public.anonymous_usage (
  ip_hash      text primary key,               -- SHA-256 hex of IP
  count        integer not null default 0,
  last_used_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 4. increment_anonymous_usage RPC
--    Atomic upsert called from the analyze route after success.
--    Using a Postgres function avoids a read-modify-write race.
-- ────────────────────────────────────────────────────────────
create or replace function public.increment_anonymous_usage(p_ip_hash text)
returns void language plpgsql as $$
begin
  insert into public.anonymous_usage (ip_hash, count, last_used_at)
  values (p_ip_hash, 1, now())
  on conflict (ip_hash)
  do update set
    count        = anonymous_usage.count + 1,
    last_used_at = now();
end;
$$;
