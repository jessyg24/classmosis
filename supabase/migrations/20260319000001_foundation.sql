-- Classmosis Foundation Migration
-- Sprint 1: Core tables for auth, classes, students, grading

-- ============================================================
-- SCHOOLS
-- ============================================================
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  district text,
  timezone text not null default 'America/Los_Angeles',
  state text,
  admin_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  settings jsonb not null default '{}'::jsonb
);

alter table public.schools enable row level security;

create policy "school_admin_all" on public.schools
  for all using (admin_id = auth.uid());

-- ============================================================
-- CLASSES
-- ============================================================
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  school_id uuid references public.schools(id),
  name text not null,
  subject text not null check (subject in ('ELA', 'Math', 'Science', 'Social Studies', 'Multi-subject', 'Other')),
  grade_band text not null check (grade_band in ('K-2', '3-5', '6-8')),
  grading_scale_id uuid,
  currency_name text not null default 'coins',
  currency_icon text not null default '🪙',
  theme text,
  academic_year text,
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.classes enable row level security;

create policy "teacher_own_classes" on public.classes
  for all using (teacher_id = auth.uid());

-- Now that classes exists, add the school teacher read policy
create policy "school_teacher_read" on public.schools
  for select using (
    id in (
      select school_id from public.classes where teacher_id = auth.uid()
    )
  );

-- ============================================================
-- STUDENTS
-- ============================================================
create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  display_name text not null,
  pin_hash text not null,
  google_id text,
  coin_balance integer not null default 0,
  streak_count integer not null default 0,
  grade_level text,
  display_level text,
  iep_flag boolean not null default false,
  flag_504 boolean not null default false,
  gate_flag boolean not null default false,
  ell_flag boolean not null default false,
  daily_status text not null default 'present' check (daily_status in ('present', 'absent', 'tardy', 'early_release', 'remote')),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

alter table public.students enable row level security;

-- Teachers can manage students in their own classes
create policy "teacher_own_students" on public.students
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Anon users can read student names for roster picker (student portal login)
create policy "anon_read_students_limited" on public.students
  for select using (true);

-- ============================================================
-- GRADING SCALES
-- ============================================================
create table public.grading_scales (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  type text not null check (type in ('points', 'percentage', 'letter', 'standards', 'mastery', 'custom')),
  thresholds jsonb not null default '[]'::jsonb,
  labels text[] not null default '{}',
  drop_lowest integer not null default 0,
  missing_value text not null default 'zero' check (missing_value in ('zero', 'empty', 'exclude', 'incomplete'))
);

alter table public.grading_scales enable row level security;

create policy "teacher_own_grading_scales" on public.grading_scales
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Add FK from classes to grading_scales now that both exist
alter table public.classes
  add constraint classes_grading_scale_fk
  foreign key (grading_scale_id) references public.grading_scales(id);

-- ============================================================
-- GRADING PERIODS
-- ============================================================
create table public.grading_periods (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  starts_at date not null,
  ends_at date not null,
  locked boolean not null default false,
  locked_at timestamptz,
  locked_by uuid references auth.users(id)
);

alter table public.grading_periods enable row level security;

create policy "teacher_own_grading_periods" on public.grading_periods
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- ============================================================
-- CLASS CODES (daily codes for student portal access)
-- ============================================================
create table public.class_codes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  code text not null,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (code, date)
);

alter table public.class_codes enable row level security;

-- Teachers can manage codes for their own classes
create policy "teacher_own_class_codes" on public.class_codes
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Anon users can read class codes (for student portal login)
create policy "anon_read_class_codes" on public.class_codes
  for select using (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_classes_teacher on public.classes(teacher_id);
create index idx_students_class on public.students(class_id);
create index idx_class_codes_date on public.class_codes(date, code);
create index idx_grading_scales_class on public.grading_scales(class_id);
create index idx_grading_periods_class on public.grading_periods(class_id);
