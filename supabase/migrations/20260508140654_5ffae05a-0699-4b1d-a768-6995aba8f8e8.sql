-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null default '',
  product_id text not null default '',
  price_id text not null default '',
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  grandfathered boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- has_active_subscription: true for grandfathered users OR active/trialing/past_due, OR canceled-but-not-yet-expired
create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
    and (environment = check_env or grandfathered = true)
    and (
      grandfathered = true
      or (status in ('active', 'trialing', 'past_due') and (current_period_end is null or current_period_end > now()))
      or (status = 'canceled' and current_period_end > now())
    )
  );
$$;

-- Grandfather every existing user in BOTH sandbox and live environments
insert into public.subscriptions (user_id, stripe_subscription_id, status, environment, grandfathered, current_period_end)
select id, 'grandfathered_sandbox_' || id::text, 'active', 'sandbox', true, null from auth.users
on conflict (stripe_subscription_id) do nothing;

insert into public.subscriptions (user_id, stripe_subscription_id, status, environment, grandfathered, current_period_end)
select id, 'grandfathered_live_' || id::text, 'active', 'live', true, null from auth.users
on conflict (stripe_subscription_id) do nothing;

-- Trigger: every NEW auth user from this point forward does NOT get grandfathered.
-- They must pay. (No trigger needed — absence of row = no access.)