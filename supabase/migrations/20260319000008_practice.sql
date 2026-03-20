-- Classmosis Practice Migration
-- Sprint 7: Practice sets, questions, sessions, responses

-- ============================================================
-- PRACTICE SETS
-- ============================================================
create table public.practice_sets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  published boolean not null default false,
  shuffle_questions boolean not null default true,
  allow_retries boolean not null default true,
  show_correct_after boolean not null default true,
  coins_reward integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.practice_sets enable row level security;

create policy "teacher_own_practice_sets" on public.practice_sets
  for all using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "anon_read_published_practice_sets" on public.practice_sets
  for select using (published = true);

-- ============================================================
-- PRACTICE SET STANDARDS (many-to-many)
-- ============================================================
create table public.practice_set_standards (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references public.practice_sets(id) on delete cascade,
  standard_id uuid not null references public.standards(id) on delete cascade,
  unique (practice_set_id, standard_id)
);

alter table public.practice_set_standards enable row level security;

create policy "teacher_practice_set_standards" on public.practice_set_standards
  for all using (
    practice_set_id in (
      select id from public.practice_sets where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

create policy "anon_read_practice_set_standards" on public.practice_set_standards
  for select using (true);

-- ============================================================
-- PRACTICE QUESTIONS
-- ============================================================
create table public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  practice_set_id uuid not null references public.practice_sets(id) on delete cascade,
  question_type text not null default 'multiple_choice'
    check (question_type in ('multiple_choice', 'true_false', 'short_answer')),
  prompt text not null,
  options jsonb,
  correct_answer text not null,
  explanation text,
  order_index integer not null default 0,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.practice_questions enable row level security;

create policy "teacher_own_practice_questions" on public.practice_questions
  for all using (
    practice_set_id in (
      select id from public.practice_sets where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

create policy "anon_read_practice_questions" on public.practice_questions
  for select using (
    practice_set_id in (select id from public.practice_sets where published = true)
  );

-- ============================================================
-- PRACTICE SESSIONS
-- ============================================================
create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  practice_set_id uuid not null references public.practice_sets(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'abandoned')),
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  pct_score numeric(5,2),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  coins_awarded integer not null default 0
);

alter table public.practice_sessions enable row level security;

create policy "teacher_read_practice_sessions" on public.practice_sessions
  for select using (
    practice_set_id in (
      select id from public.practice_sets where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

create policy "anon_manage_own_sessions" on public.practice_sessions
  for all using (true);

-- ============================================================
-- PRACTICE RESPONSES
-- ============================================================
create table public.practice_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  question_id uuid not null references public.practice_questions(id) on delete cascade,
  student_answer text not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (session_id, question_id)
);

alter table public.practice_responses enable row level security;

create policy "teacher_read_practice_responses" on public.practice_responses
  for select using (
    session_id in (
      select id from public.practice_sessions where practice_set_id in (
        select id from public.practice_sets where class_id in (
          select id from public.classes where teacher_id = auth.uid()
        )
      )
    )
  );

create policy "anon_manage_own_responses" on public.practice_responses
  for all using (true);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_practice_sets_class on public.practice_sets(class_id);
create index idx_practice_set_standards_set on public.practice_set_standards(practice_set_id);
create index idx_practice_set_standards_standard on public.practice_set_standards(standard_id);
create index idx_practice_questions_set on public.practice_questions(practice_set_id, order_index);
create index idx_practice_sessions_student on public.practice_sessions(student_id);
create index idx_practice_sessions_set on public.practice_sessions(practice_set_id);
create index idx_practice_responses_session on public.practice_responses(session_id);
