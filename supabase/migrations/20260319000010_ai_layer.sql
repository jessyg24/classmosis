-- Classmosis AI Layer Migration
-- Sprint 5: AI score drafts, usage tracking, shared banks

-- ============================================================
-- AI SCORE DRAFTS (audit trail for AI grading)
-- ============================================================
create table public.ai_score_drafts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  category_scores jsonb not null default '[]'::jsonb,
  total_raw numeric(8,2) not null,
  total_pct numeric(5,2) not null,
  model_version text not null,
  generated_at timestamptz not null default now(),
  flagged_for_review boolean not null default false,
  flag_reason text,
  teacher_action text not null default 'pending'
    check (teacher_action in ('pending', 'approved', 'edited', 'rejected')),
  teacher_acted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.ai_score_drafts enable row level security;

create policy "teacher_own_ai_score_drafts" on public.ai_score_drafts
  for all using (
    submission_id in (
      select s.id from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      join public.classes c on c.id = a.class_id
      where c.teacher_id = auth.uid()
    )
  );

create index idx_ai_drafts_submission on public.ai_score_drafts(submission_id);
create index idx_ai_drafts_rubric on public.ai_score_drafts(rubric_id);

-- ============================================================
-- AI USAGE TRACKING (rate limiting)
-- ============================================================
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  class_id uuid not null references public.classes(id) on delete cascade,
  date date not null default current_date,
  call_count integer not null default 0,
  call_type text not null,
  created_at timestamptz not null default now(),
  unique (teacher_id, class_id, date, call_type)
);

alter table public.ai_usage enable row level security;

create policy "teacher_own_ai_usage" on public.ai_usage
  for all using (teacher_id = auth.uid());

create index idx_ai_usage_teacher_date on public.ai_usage(teacher_id, date);
create index idx_ai_usage_class_month on public.ai_usage(class_id, date);

-- ============================================================
-- RUBRIC TEMPLATES (shared bank)
-- ============================================================
create table public.rubric_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text not null check (subject in ('ELA', 'Math', 'Science', 'Social Studies', 'Multi-subject', 'Other')),
  grade_band text not null check (grade_band in ('K-2', '3-5', '6-8')),
  assignment_type text not null,
  total_points integer not null,
  categories jsonb not null default '[]'::jsonb,
  standard_codes text[],
  ai_generated boolean not null default false,
  contributed_by uuid references auth.users(id),
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.rubric_templates enable row level security;

create policy "anyone_read_rubric_templates" on public.rubric_templates
  for select using (true);

create policy "teacher_insert_rubric_templates" on public.rubric_templates
  for insert with check (auth.uid() is not null);

create index idx_rubric_templates_subject_grade on public.rubric_templates(subject, grade_band);
create index idx_rubric_templates_type on public.rubric_templates(assignment_type);

-- ============================================================
-- PROBLEM BANK (shared practice questions)
-- ============================================================
create table public.problem_bank (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('ELA', 'Math', 'Science', 'Social Studies', 'Multi-subject', 'Other')),
  grade_band text not null check (grade_band in ('K-2', '3-5', '6-8')),
  standard_code text,
  question_type text not null default 'multiple_choice'
    check (question_type in ('multiple_choice', 'true_false', 'short_answer')),
  difficulty integer not null default 3 check (difficulty >= 1 and difficulty <= 5),
  prompt text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  hint text,
  ai_generated boolean not null default false,
  contributed_by uuid references auth.users(id),
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.problem_bank enable row level security;

create policy "anyone_read_problem_bank" on public.problem_bank
  for select using (true);

create policy "teacher_insert_problem_bank" on public.problem_bank
  for insert with check (auth.uid() is not null);

create index idx_problem_bank_subject_grade on public.problem_bank(subject, grade_band);
create index idx_problem_bank_standard on public.problem_bank(standard_code);
create index idx_problem_bank_type on public.problem_bank(question_type, difficulty);

-- ============================================================
-- FEEDBACK TEMPLATES (reusable sentence starters)
-- ============================================================
create table public.feedback_templates (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('ELA', 'Math', 'Science', 'Social Studies', 'Multi-subject', 'Other')),
  grade_band text not null check (grade_band in ('K-2', '3-5', '6-8')),
  score_range text not null check (score_range in ('low', 'mid', 'high')),
  template text not null,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.feedback_templates enable row level security;

create policy "anyone_read_feedback_templates" on public.feedback_templates
  for select using (true);

create index idx_feedback_templates_lookup on public.feedback_templates(subject, grade_band, score_range);
