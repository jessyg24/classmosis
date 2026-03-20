-- Classmosis Economy Completion: Jobs, Mystery Student, Todos, Fulfillment
-- Sprint 4 completion

-- ============================================================
-- CLASS JOBS
-- ============================================================
create table public.class_jobs (
  id                uuid primary key default gen_random_uuid(),
  class_id          uuid not null references public.classes(id) on delete cascade,
  title             text not null,
  description       text,
  coin_multiplier   numeric(3,2) not null default 1.00
    check (coin_multiplier >= 1.00 and coin_multiplier <= 5.00),
  rotation          text not null default 'teacher_assigned'
    check (rotation in ('daily', 'weekly', 'teacher_assigned', 'random')),
  current_holder_id uuid references public.students(id) on delete set null,
  expires_at        timestamptz,
  active            boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

alter table public.class_jobs enable row level security;

create policy "teacher_own_class_jobs" on public.class_jobs
  for all using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "anon_read_class_jobs" on public.class_jobs
  for select using (true);

create index idx_class_jobs_class on public.class_jobs(class_id, active);
create index idx_class_jobs_holder on public.class_jobs(current_holder_id);

-- ============================================================
-- ALTER STUDENTS — add job tracking
-- ============================================================
alter table public.students
  add column active_job_id uuid references public.class_jobs(id) on delete set null,
  add column active_job_multiplier numeric(3,2) not null default 1.00;

-- ============================================================
-- ALTER ECONOMY_TRANSACTIONS — add multiplier tracking
-- ============================================================
alter table public.economy_transactions
  add column base_amount integer,
  add column job_multiplier numeric(3,2) not null default 1.00,
  add column mystery_multiplier numeric(3,2) not null default 1.00;

-- Backfill existing rows
update public.economy_transactions set base_amount = amount where base_amount is null;
alter table public.economy_transactions alter column base_amount set not null;

-- ============================================================
-- MYSTERY STUDENT RECORDS
-- ============================================================
create table public.mystery_student_records (
  id                  uuid primary key default gen_random_uuid(),
  class_id            uuid not null references public.classes(id) on delete cascade,
  date                date not null,
  selected_student_id uuid not null references public.students(id) on delete cascade,
  day_earnings_before integer not null default 0,
  multiplier          numeric(3,2) not null default 3.00,
  bonus_payout        integer not null default 0,
  revealed_at         timestamptz,
  teacher_note        text,
  created_at          timestamptz not null default now(),
  unique (class_id, date)
);

alter table public.mystery_student_records enable row level security;

create policy "teacher_own_mystery" on public.mystery_student_records
  for all using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "anon_read_mystery_revealed" on public.mystery_student_records
  for select using (revealed_at is not null);

create index idx_mystery_class_date on public.mystery_student_records(class_id, date desc);
create index idx_mystery_student on public.mystery_student_records(selected_student_id);

-- ============================================================
-- ALTER PURCHASE_REQUESTS — fulfillment tracking
-- ============================================================
alter table public.purchase_requests
  add column fulfilled boolean not null default false,
  add column fulfilled_at timestamptz;

-- ============================================================
-- TODO ITEMS
-- ============================================================
create table public.todo_items (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references public.students(id) on delete cascade,
  class_id          uuid not null references public.classes(id) on delete cascade,
  title             text not null,
  source            text not null default 'teacher'
    check (source in ('student', 'teacher')),
  coin_eligible     boolean not null default false,
  coins_on_complete integer not null default 0,
  completed         boolean not null default false,
  completed_at      timestamptz,
  due_date          date,
  created_at        timestamptz not null default now()
);

alter table public.todo_items enable row level security;

create policy "teacher_own_todos" on public.todo_items
  for all using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "anon_read_todos" on public.todo_items
  for select using (true);

create policy "anon_update_todos" on public.todo_items
  for update using (true) with check (true);

create policy "anon_insert_todos" on public.todo_items
  for insert with check (true);

create index idx_todos_student on public.todo_items(student_id, completed, due_date);
create index idx_todos_class on public.todo_items(class_id, completed);

-- ============================================================
-- UPDATE TRANSACTION CATEGORY CONSTRAINT
-- ============================================================
alter table public.economy_transactions
  drop constraint economy_transactions_category_check;

alter table public.economy_transactions
  add constraint economy_transactions_category_check
  check (category in (
    'manual', 'block_reward', 'purchase', 'purchase_refund',
    'bulk', 'adjustment', 'todo_complete', 'mystery_bonus'
  ));
