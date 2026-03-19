-- Classmosis Sprint 2 Migration
-- Schedule Builder: schedules, blocks, schedule_templates

-- ============================================================
-- SCHEDULE TEMPLATES (must exist before schedules FK)
-- ============================================================
create table public.schedule_templates (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  blocks_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.schedule_templates enable row level security;

create policy "teacher_own_schedule_templates" on public.schedule_templates
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- ============================================================
-- SCHEDULES
-- ============================================================
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  date date not null,
  class_code text,
  published boolean not null default false,
  published_at timestamptz,
  template_id uuid references public.schedule_templates(id) on delete set null,
  day_type text not null default 'normal'
    check (day_type in ('normal', 'minimum_day', 'testing', 'field_trip', 'assembly', 'substitute')),
  created_at timestamptz not null default now(),
  unique (class_id, date)
);

alter table public.schedules enable row level security;

create policy "teacher_own_schedules" on public.schedules
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Anon users can read published schedules (for student portal)
create policy "anon_read_published_schedules" on public.schedules
  for select using (published = true);

-- ============================================================
-- BLOCKS
-- ============================================================
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  type text not null
    check (type in ('routine', 'academic', 'assessment', 'economy', 'flex', 'rotation')),
  label text not null,
  duration_minutes integer not null default 30,
  order_index integer not null default 0,
  start_time time,
  notes text,
  timer_behavior text not null default 'none'
    check (timer_behavior in ('auto_start', 'manual', 'none')),
  timer_warning_minutes integer not null default 5,
  external_link jsonb,
  economy_trigger jsonb,
  visible_to_students boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.blocks enable row level security;

create policy "teacher_own_blocks" on public.blocks
  for all using (
    schedule_id in (
      select id from public.schedules where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

-- Anon users can read blocks for published schedules (student portal)
create policy "anon_read_published_blocks" on public.blocks
  for select using (
    schedule_id in (
      select id from public.schedules where published = true
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_schedules_class_date on public.schedules(class_id, date);
create index idx_blocks_schedule on public.blocks(schedule_id, order_index);
create index idx_schedule_templates_class on public.schedule_templates(class_id);
