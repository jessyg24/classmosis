-- Classmosis Economy Migration
-- Sprint 6: Transaction ledger, reward store, purchase requests, settings

-- ============================================================
-- ECONOMY TRANSACTIONS (immutable ledger)
-- ============================================================
create table public.economy_transactions (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  student_id    uuid not null references public.students(id) on delete cascade,
  amount        integer not null,
  balance_after integer not null,
  reason        text not null,
  category      text not null default 'manual'
    check (category in ('manual', 'block_reward', 'purchase', 'purchase_refund', 'bulk', 'adjustment')),
  source_id     uuid,
  created_by    uuid,
  created_at    timestamptz not null default now()
);

alter table public.economy_transactions enable row level security;

create policy "teacher_own_transactions" on public.economy_transactions
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

create policy "anon_read_transactions" on public.economy_transactions
  for select using (true);

create index idx_txn_class_created on public.economy_transactions(class_id, created_at desc);
create index idx_txn_student on public.economy_transactions(student_id, created_at desc);
create index idx_txn_category on public.economy_transactions(category);

-- ============================================================
-- REWARD STORE ITEMS
-- ============================================================
create table public.reward_store_items (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes(id) on delete cascade,
  title       text not null,
  description text,
  price       integer not null check (price > 0),
  icon        text not null default '🎁',
  stock       integer,
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.reward_store_items enable row level security;

create policy "teacher_own_store_items" on public.reward_store_items
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

create policy "anon_read_store_items" on public.reward_store_items
  for select using (active = true);

create index idx_store_items_class on public.reward_store_items(class_id, active, sort_order);

-- ============================================================
-- PURCHASE REQUESTS
-- ============================================================
create table public.purchase_requests (
  id               uuid primary key default gen_random_uuid(),
  class_id         uuid not null references public.classes(id) on delete cascade,
  student_id       uuid not null references public.students(id) on delete cascade,
  item_id          uuid not null references public.reward_store_items(id) on delete cascade,
  price_at_request integer not null,
  status           text not null default 'pending'
    check (status in ('pending', 'approved', 'denied', 'cancelled')),
  teacher_note     text,
  resolved_at      timestamptz,
  resolved_by      uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

alter table public.purchase_requests enable row level security;

create policy "teacher_own_purchase_requests" on public.purchase_requests
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

create policy "anon_read_purchase_requests" on public.purchase_requests
  for select using (true);

create policy "anon_insert_purchase_requests" on public.purchase_requests
  for insert with check (true);

create index idx_purchase_class_status on public.purchase_requests(class_id, status, created_at desc);
create index idx_purchase_student on public.purchase_requests(student_id, created_at desc);

-- ============================================================
-- ECONOMY SETTINGS (per-class config)
-- ============================================================
create table public.economy_settings (
  id                  uuid primary key default gen_random_uuid(),
  class_id            uuid not null references public.classes(id) on delete cascade unique,
  leaderboard_visible boolean not null default false,
  negative_balance    boolean not null default false,
  auto_approve        boolean not null default false,
  weekly_allowance    integer not null default 0,
  created_at          timestamptz not null default now()
);

alter table public.economy_settings enable row level security;

create policy "teacher_own_economy_settings" on public.economy_settings
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

create policy "anon_read_economy_settings" on public.economy_settings
  for select using (true);

-- ============================================================
-- RPC: Atomic coin balance increment
-- ============================================================
create or replace function public.increment_coin_balance(
  p_student_id uuid,
  p_amount integer
)
returns integer
language plpgsql
security definer
as $$
declare
  new_balance integer;
begin
  update public.students
  set coin_balance = coin_balance + p_amount
  where id = p_student_id
  returning coin_balance into new_balance;

  return new_balance;
end;
$$;
