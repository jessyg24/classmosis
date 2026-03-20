-- Classmosis Subscriptions Migration
-- Sprint 7: Billing tiers, Stripe integration

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) unique,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  billing_interval text check (billing_interval in ('month', 'year')),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "teacher_read_own_sub" on public.subscriptions
  for select using (teacher_id = auth.uid());

create index idx_subscriptions_teacher on public.subscriptions(teacher_id);
create index idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);
create index idx_subscriptions_stripe_sub on public.subscriptions(stripe_subscription_id);

-- Auto-create free subscription for new users
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.subscriptions (teacher_id, tier, status)
  values (new.id, 'free', 'active')
  on conflict (teacher_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Backfill: create free subscriptions for existing users who don't have one
insert into public.subscriptions (teacher_id, tier, status)
select id, 'free', 'active' from auth.users
where id not in (select teacher_id from public.subscriptions)
on conflict (teacher_id) do nothing;
