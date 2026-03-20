-- Classmosis Parent Portal Migration
-- Sprint 6: Parent guardian accounts, invite flow, data access

-- ============================================================
-- PARENT GUARDIANS
-- ============================================================
create table public.parent_guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null default 'guardian',
  preferred_language text not null default 'en',
  notification_preferences jsonb not null default '{"weekly_digest": true, "grade_alert": true, "missing_alert": true}'::jsonb,
  custody_restricted boolean not null default false,
  invite_token text unique,
  invite_expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, student_id)
);

alter table public.parent_guardians enable row level security;

-- Teachers can manage guardians for students in their classes
create policy "teacher_manage_guardians" on public.parent_guardians
  for all using (
    student_id in (
      select id from public.students where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

-- Parents can read their own guardian rows
create policy "parent_own_guardians" on public.parent_guardians
  for select using (user_id = auth.uid());

-- Parents can update their own preferences
create policy "parent_update_own_prefs" on public.parent_guardians
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- PARENT READ POLICIES on existing tables
-- ============================================================

-- Parents can read their linked children's student records
create policy "parent_read_students" on public.students
  for select using (
    id in (
      select student_id from public.parent_guardians
      where user_id = auth.uid() and accepted_at is not null
    )
  );

-- Parents can read gradebook entries for their children
create policy "parent_read_gradebook" on public.gradebook_entries
  for select using (
    student_id in (
      select student_id from public.parent_guardians
      where user_id = auth.uid() and accepted_at is not null
    )
  );

-- Parents can read assignments in their child's class
create policy "parent_read_assignments" on public.assignments
  for select using (
    class_id in (
      select class_id from public.students where id in (
        select student_id from public.parent_guardians
        where user_id = auth.uid() and accepted_at is not null
      )
    )
  );

-- Parents can read teacher grades for their children's submissions
create policy "parent_read_teacher_grades" on public.teacher_grades
  for select using (
    submission_id in (
      select id from public.submissions where student_id in (
        select student_id from public.parent_guardians
        where user_id = auth.uid() and accepted_at is not null
      )
    )
  );

-- Parents can read economy transactions for their children
create policy "parent_read_transactions" on public.economy_transactions
  for select using (
    student_id in (
      select student_id from public.parent_guardians
      where user_id = auth.uid() and accepted_at is not null
    )
  );

-- Parents can read mastery for their children
create policy "parent_read_mastery" on public.student_mastery
  for select using (
    student_id in (
      select student_id from public.parent_guardians
      where user_id = auth.uid() and accepted_at is not null
    )
  );

-- Parents can read todos for their children
create policy "parent_read_todos" on public.todo_items
  for select using (
    student_id in (
      select student_id from public.parent_guardians
      where user_id = auth.uid() and accepted_at is not null
    )
  );

-- Parents can read classes their children belong to
create policy "parent_read_classes" on public.classes
  for select using (
    id in (
      select class_id from public.students where id in (
        select student_id from public.parent_guardians
        where user_id = auth.uid() and accepted_at is not null
      )
    )
  );

-- ============================================================
-- MAX 3 GUARDIANS TRIGGER
-- ============================================================
create or replace function check_max_guardians()
returns trigger as $$
begin
  if (select count(*) from parent_guardians where student_id = NEW.student_id) >= 3 then
    raise exception 'Maximum 3 guardians per student';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger enforce_max_guardians
  before insert on parent_guardians
  for each row execute function check_max_guardians();

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_parent_guardians_user on public.parent_guardians(user_id);
create index idx_parent_guardians_student on public.parent_guardians(student_id);
create index idx_parent_guardians_invite on public.parent_guardians(invite_token) where invite_token is not null;
