-- Classmosis Standards Migration
-- Sprint 5: Standards tracking, assignment linking, student mastery

-- ============================================================
-- STANDARDS
-- ============================================================
create table public.standards (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  code text not null,
  description text not null,
  subject text not null check (subject in ('ELA', 'Math', 'Science', 'Social Studies', 'Multi-subject', 'Other')),
  grade_band text not null check (grade_band in ('K-2', '3-5', '6-8')),
  domain text not null,
  sort_key text not null,
  created_at timestamptz not null default now()
);

alter table public.standards enable row level security;

-- Global standards (class_id IS NULL) readable by all authenticated users
create policy "read_global_standards" on public.standards
  for select using (class_id is null);

-- Teachers can manage standards scoped to their own classes
create policy "teacher_own_class_standards" on public.standards
  for all using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Anon users can read standards (student portal)
create policy "anon_read_standards" on public.standards
  for select using (true);

-- ============================================================
-- ASSIGNMENT_STANDARDS (many-to-many join)
-- ============================================================
create table public.assignment_standards (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  standard_id uuid not null references public.standards(id) on delete cascade,
  unique (assignment_id, standard_id)
);

alter table public.assignment_standards enable row level security;

-- Teachers can manage via assignment ownership chain
create policy "teacher_assignment_standards" on public.assignment_standards
  for all using (
    assignment_id in (
      select a.id from public.assignments a
      join public.classes c on c.id = a.class_id
      where c.teacher_id = auth.uid()
    )
  );

-- Anon read for student portal
create policy "anon_read_assignment_standards" on public.assignment_standards
  for select using (true);

-- ============================================================
-- STUDENT_MASTERY
-- ============================================================
create table public.student_mastery (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  standard_id uuid not null references public.standards(id) on delete cascade,
  attempts integer not null default 0,
  avg_pct numeric(5,2),
  mastery_level text not null default 'building' check (mastery_level in ('building', 'almost_there', 'got_it', 'crushed_it')),
  last_assessed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, standard_id)
);

alter table public.student_mastery enable row level security;

-- Teachers can manage mastery for students in their classes
create policy "teacher_student_mastery" on public.student_mastery
  for all using (
    student_id in (
      select s.id from public.students s
      join public.classes c on c.id = s.class_id
      where c.teacher_id = auth.uid()
    )
  );

-- Anon read for student portal
create policy "anon_read_student_mastery" on public.student_mastery
  for select using (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_standards_class on public.standards(class_id);
create index idx_standards_subject_grade on public.standards(subject, grade_band);
create index idx_assignment_standards_assignment on public.assignment_standards(assignment_id);
create index idx_assignment_standards_standard on public.assignment_standards(standard_id);
create index idx_student_mastery_student on public.student_mastery(student_id);
create index idx_student_mastery_standard on public.student_mastery(standard_id);
