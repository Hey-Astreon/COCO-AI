-- ============================================================
-- CocoAI — Database Schema v1.0
-- Run this ONCE in Supabase SQL Editor (supabase.com → SQL Editor → New Query)
-- ============================================================

-- 1. User Profiles (extends auth.users automatically)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,

  -- Subscription
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'standard', 'pro', 'developer')),
  subscription_started_at timestamptz,
  subscription_expires_at timestamptz,

  -- Usage Quotas (reset monthly)
  tokens_remaining bigint not null default 50000,
  tokens_limit bigint not null default 50000,
  audio_minutes_remaining double precision not null default 30.0,
  audio_minutes_limit double precision not null default 30.0,
  quota_reset_at timestamptz default (now() + interval '30 days'),

  -- Payment
  razorpay_customer_id text,
  razorpay_subscription_id text,

  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.user_profiles enable row level security;

-- 3. RLS Policies: Users can only read/update their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  dev_emails text[] := array[
    current_setting('app.developer_email_1', true),
    current_setting('app.developer_email_2', true)
  ];
  user_tier text := 'free';
  user_tokens bigint := 50000;
  user_audio double precision := 30.0;
begin
  -- Check if this email is a developer (founders get unlimited)
  if new.email = any(dev_emails) then
    user_tier := 'developer';
    user_tokens := 999999999;
    user_audio := 999999.0;
  end if;

  insert into public.user_profiles (
    id, email, display_name, avatar_url,
    subscription_tier, tokens_remaining, tokens_limit,
    audio_minutes_remaining, audio_minutes_limit
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    user_tier,
    user_tokens, user_tokens,
    user_audio, user_audio
  );
  return new;
end;
$$;

-- Drop old trigger if it exists, then create fresh
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Payment History table (for audit trail)
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  razorpay_payment_id text not null,
  razorpay_order_id text,
  razorpay_signature text,
  amount_paise integer not null,
  currency text not null default 'INR',
  plan text not null check (plan in ('standard', 'pro')),
  status text not null default 'captured' check (status in ('created', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.payment_history enable row level security;

create policy "Users can view own payments"
  on public.payment_history for select
  using (auth.uid() = user_id);

-- 6. Expose tables to the Data API
-- (Since we unchecked auto-expose, we do it manually here)
grant usage on schema public to anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (display_name, avatar_url) on public.user_profiles to authenticated;
grant select on public.payment_history to authenticated;

-- 7. Helper function: upgrade a user's subscription (called by webhook)
create or replace function public.upgrade_subscription(
  p_user_id uuid,
  p_plan text,
  p_razorpay_subscription_id text default null
)
returns void
language plpgsql
security definer
as $$
declare
  new_tokens bigint;
  new_audio double precision;
begin
  -- Set quotas based on plan
  if p_plan = 'standard' then
    new_tokens := 500000;
    new_audio := 120.0;
  elsif p_plan = 'pro' then
    new_tokens := 2000000;
    new_audio := 500.0;
  else
    raise exception 'Invalid plan: %', p_plan;
  end if;

  update public.user_profiles set
    subscription_tier = p_plan,
    subscription_started_at = now(),
    subscription_expires_at = now() + interval '30 days',
    tokens_remaining = new_tokens,
    tokens_limit = new_tokens,
    audio_minutes_remaining = new_audio,
    audio_minutes_limit = new_audio,
    quota_reset_at = now() + interval '30 days',
    razorpay_subscription_id = coalesce(p_razorpay_subscription_id, razorpay_subscription_id),
    updated_at = now()
  where id = p_user_id;
end;
$$;

-- ============================================================
-- DONE! Your database is ready for CocoAI subscriptions.
-- ============================================================
