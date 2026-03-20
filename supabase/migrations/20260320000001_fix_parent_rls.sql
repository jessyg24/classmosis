-- Fix infinite recursion in parent RLS policies
-- The parent_read_classes policy causes a cycle: classes → students → parent_guardians → students → classes
-- Solution: use a SECURITY DEFINER function that bypasses RLS for the lookup

-- Helper function to get class IDs for a parent (bypasses RLS)
create or replace function public.get_parent_class_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
as $$
  select distinct s.class_id
  from public.students s
  join public.parent_guardians pg on pg.student_id = s.id
  where pg.user_id = p_user_id and pg.accepted_at is not null;
$$;

-- Helper function to get student IDs for a parent (bypasses RLS)
create or replace function public.get_parent_student_ids(p_user_id uuid)
returns setof uuid
language sql
security definer
stable
as $$
  select pg.student_id
  from public.parent_guardians pg
  where pg.user_id = p_user_id and pg.accepted_at is not null;
$$;

-- Drop the problematic policies
drop policy if exists "parent_read_classes" on public.classes;
drop policy if exists "parent_read_students" on public.students;
drop policy if exists "parent_read_gradebook" on public.gradebook_entries;
drop policy if exists "parent_read_assignments" on public.assignments;
drop policy if exists "parent_read_teacher_grades" on public.teacher_grades;
drop policy if exists "parent_read_transactions" on public.economy_transactions;
drop policy if exists "parent_read_mastery" on public.student_mastery;
drop policy if exists "parent_read_todos" on public.todo_items;

-- Recreate with SECURITY DEFINER helper functions (no recursion)
create policy "parent_read_classes" on public.classes
  for select using (
    id in (select get_parent_class_ids(auth.uid()))
  );

create policy "parent_read_students" on public.students
  for select using (
    id in (select get_parent_student_ids(auth.uid()))
  );

create policy "parent_read_gradebook" on public.gradebook_entries
  for select using (
    student_id in (select get_parent_student_ids(auth.uid()))
  );

create policy "parent_read_assignments" on public.assignments
  for select using (
    class_id in (select get_parent_class_ids(auth.uid()))
  );

create policy "parent_read_teacher_grades" on public.teacher_grades
  for select using (
    submission_id in (
      select id from public.submissions where student_id in (
        select get_parent_student_ids(auth.uid())
      )
    )
  );

create policy "parent_read_transactions" on public.economy_transactions
  for select using (
    student_id in (select get_parent_student_ids(auth.uid()))
  );

create policy "parent_read_mastery" on public.student_mastery
  for select using (
    student_id in (select get_parent_student_ids(auth.uid()))
  );

create policy "parent_read_todos" on public.todo_items
  for select using (
    student_id in (select get_parent_student_ids(auth.uid()))
  );
