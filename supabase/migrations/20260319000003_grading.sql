-- Classmosis Grading Migration
-- Sprint 3: Rubrics, assignments, submissions, grading, gradebook

-- ============================================================
-- RUBRICS
-- ============================================================
create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  total_points integer not null default 0,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.rubrics enable row level security;

create policy "teacher_own_rubrics" on public.rubrics
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- ============================================================
-- RUBRIC CATEGORIES
-- ============================================================
create table public.rubric_categories (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  name text not null,
  max_points integer not null,
  weight_pct numeric(5,2) not null default 0,
  descriptors jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.rubric_categories enable row level security;

create policy "teacher_own_rubric_categories" on public.rubric_categories
  for all using (
    rubric_id in (
      select id from public.rubrics where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

-- ============================================================
-- CATEGORY WEIGHTS
-- ============================================================
create table public.category_weights (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  period_id uuid references public.grading_periods(id),
  category_name text not null,
  weight_pct numeric(5,2) not null default 0,
  unique (class_id, period_id, category_name)
);

alter table public.category_weights enable row level security;

create policy "teacher_own_category_weights" on public.category_weights
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- ============================================================
-- ASSIGNMENTS
-- ============================================================
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  title text not null,
  instructions text,
  type text not null default 'classwork' check (type in ('classwork', 'homework', 'quiz', 'project', 'exit_ticket')),
  rubric_id uuid references public.rubrics(id) on delete set null,
  category text not null default 'classwork',
  points_possible integer not null default 100,
  due_at timestamptz,
  extra_credit boolean not null default false,
  make_up_eligible boolean not null default true,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;

create policy "teacher_own_assignments" on public.assignments
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Students can read published assignments for their class
create policy "anon_read_published_assignments" on public.assignments
  for select using (published = true);

-- ============================================================
-- SUBMISSIONS
-- ============================================================
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  content_type text not null default 'text' check (content_type in ('text', 'file', 'photo', 'url')),
  content text,
  file_url text,
  submitted_at timestamptz not null default now(),
  is_late boolean not null default false,
  is_draft boolean not null default false,
  revision_number integer not null default 1,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'graded', 'returned')),
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

-- Teachers can read submissions via class chain
create policy "teacher_read_submissions" on public.submissions
  for all using (
    assignment_id in (
      select id from public.assignments where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

-- Anon can read (filtered at API level via JWT)
create policy "anon_read_submissions" on public.submissions
  for select using (true);

-- ============================================================
-- TEACHER GRADES
-- ============================================================
create table public.teacher_grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade unique,
  category_scores jsonb not null default '[]'::jsonb,
  total_raw numeric(8,2),
  total_pct numeric(5,2),
  scale_label text,
  overall_feedback text,
  graded_by uuid not null references auth.users(id),
  graded_at timestamptz not null default now()
);

alter table public.teacher_grades enable row level security;

create policy "teacher_own_teacher_grades" on public.teacher_grades
  for all using (
    submission_id in (
      select id from public.submissions where assignment_id in (
        select id from public.assignments where class_id in (
          select id from public.classes where teacher_id = auth.uid()
        )
      )
    )
  );

-- Anon can read returned grades (filtered at API level)
create policy "anon_read_teacher_grades" on public.teacher_grades
  for select using (true);

-- ============================================================
-- GRADEBOOK ENTRIES
-- ============================================================
create table public.gradebook_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  teacher_grade_id uuid references public.teacher_grades(id) on delete set null,
  period_id uuid references public.grading_periods(id),
  category text,
  raw_score numeric(8,2),
  pct_score numeric(5,2),
  display_label text,
  is_missing boolean not null default true,
  is_extra_credit boolean not null default false,
  is_dropped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, assignment_id)
);

alter table public.gradebook_entries enable row level security;

create policy "teacher_own_gradebook_entries" on public.gradebook_entries
  for all using (
    assignment_id in (
      select id from public.assignments where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

-- Anon can read (filtered at API level via JWT)
create policy "anon_read_gradebook_entries" on public.gradebook_entries
  for select using (true);

-- ============================================================
-- STUDENT FEEDBACK
-- ============================================================
create table public.student_feedback (
  id uuid primary key default gen_random_uuid(),
  teacher_grade_id uuid not null references public.teacher_grades(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  viewed_at timestamptz,
  proud_flag boolean not null default false,
  student_reply text,
  reply_at timestamptz
);

alter table public.student_feedback enable row level security;

create policy "teacher_own_student_feedback" on public.student_feedback
  for all using (
    teacher_grade_id in (
      select id from public.teacher_grades where submission_id in (
        select id from public.submissions where assignment_id in (
          select id from public.assignments where class_id in (
            select id from public.classes where teacher_id = auth.uid()
          )
        )
      )
    )
  );

-- Anon can read and update own feedback (filtered at API level via JWT)
create policy "anon_read_student_feedback" on public.student_feedback
  for select using (true);

create policy "anon_update_student_feedback" on public.student_feedback
  for update using (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_rubrics_class on public.rubrics(class_id);
create index idx_rubric_categories_rubric on public.rubric_categories(rubric_id, order_index);
create index idx_category_weights_class on public.category_weights(class_id);
create index idx_assignments_class_due on public.assignments(class_id, due_at);
create index idx_submissions_assignment on public.submissions(assignment_id);
create index idx_submissions_student on public.submissions(student_id);
create index idx_teacher_grades_submission on public.teacher_grades(submission_id);
create index idx_gradebook_entries_student on public.gradebook_entries(student_id);
create index idx_gradebook_entries_assignment on public.gradebook_entries(assignment_id);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;
