-- Brain Break Bank (shared ideas, pre-seeded + teacher-contributed)
create table public.brain_break_bank (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'movement'
    check (category in ('movement', 'breathing', 'dance', 'game', 'stretch', 'mindfulness', 'creative', 'custom')),
  duration_minutes integer not null default 3,
  video_url text,
  is_seed boolean not null default false,
  contributed_by uuid references auth.users(id),
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.brain_break_bank enable row level security;

create policy "anyone_read_brain_breaks" on public.brain_break_bank
  for select using (true);

create policy "teacher_insert_brain_breaks" on public.brain_break_bank
  for insert with check (auth.uid() is not null);

create index idx_brain_break_category on public.brain_break_bank(category);

-- Seed brain break ideas
insert into public.brain_break_bank (title, description, category, duration_minutes, is_seed) values
  ('Freeze Dance', 'Play music — dance when it plays, freeze when it stops!', 'dance', 3, true),
  ('GoNoodle', 'Follow along with a GoNoodle video', 'dance', 3, true),
  ('Jumping Jacks', '30 seconds of jumping jacks to get the blood flowing', 'movement', 2, true),
  ('Yoga Poses', 'Tree pose, warrior pose, downward dog — hold each for 10 seconds', 'stretch', 3, true),
  ('Simon Says', 'Classic Simon Says with movement commands', 'game', 5, true),
  ('Four Corners', 'Students pick a corner — teacher calls a corner to sit', 'game', 3, true),
  ('Would You Rather', 'Move to one side or the other based on your choice', 'game', 3, true),
  ('Balloon Breathing', 'Breathe in slowly like inflating a balloon, breathe out slowly', 'breathing', 2, true),
  ('5-4-3-2-1 Senses', 'Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste', 'mindfulness', 3, true),
  ('Box Breathing', 'Breathe in 4 counts, hold 4, out 4, hold 4 — repeat 3 times', 'breathing', 2, true),
  ('Stand and Stretch', 'Arms up, touch toes, twist left, twist right, shoulder rolls', 'stretch', 2, true),
  ('Rock Paper Scissors Tournament', 'Find a partner, play best of 3, winner moves on', 'game', 3, true),
  ('Silent Ball', 'Toss a ball silently — if you talk or drop it, sit down', 'game', 5, true),
  ('Head Shoulders Knees and Toes', 'Classic song with movements — try it fast!', 'movement', 2, true),
  ('Gratitude Moment', 'Write or share one thing you are grateful for today', 'mindfulness', 2, true),
  ('Doodle Break', 'Draw anything you want for 2 minutes — no rules', 'creative', 2, true),
  ('Story Chain', 'One student starts a story, next adds a sentence — go around the room', 'creative', 3, true),
  ('Animal Walks', 'Crab walk, bear crawl, frog jumps across the room', 'movement', 3, true),
  ('Thumb Wrestling', 'Find a partner for a quick thumb wrestling match', 'game', 2, true),
  ('Rainbow Breathing', 'Trace a rainbow with your hand while breathing in and out', 'breathing', 2, true),
  ('Chair Yoga', 'Simple stretches without leaving your seat', 'stretch', 3, true),
  ('Macarena', 'Play the Macarena and dance along', 'dance', 3, true),
  ('Count to 10 Calm Down', 'Close eyes, breathe, count slowly to 10', 'breathing', 1, true),
  ('Quick Draw', 'Teacher says a word — everyone draws it in 30 seconds', 'creative', 2, true),
  ('Shake It Out', 'Shake your hands, arms, legs, whole body for 20 seconds', 'movement', 1, true);

-- Student-specific schedule events (pull-outs, support sessions, etc.)
create table public.student_schedule_events (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  event_type text not null default 'pull_out'
    check (event_type in ('pull_out', 'support', 'therapy', 'enrichment', 'assessment', 'custom')),
  days_of_week text[] not null default '{}',
  start_time time not null,
  duration_minutes integer not null default 30,
  location text,
  provider text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.student_schedule_events enable row level security;

create policy "teacher_own_student_events" on public.student_schedule_events
  for all using (
    class_id in (select id from public.classes where teacher_id = auth.uid())
  );

create policy "anon_read_student_events" on public.student_schedule_events
  for select using (true);

-- Junction: which students are assigned to each event
create table public.student_event_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.student_schedule_events(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  unique (event_id, student_id)
);

alter table public.student_event_assignments enable row level security;

create policy "teacher_own_event_assignments" on public.student_event_assignments
  for all using (
    event_id in (
      select id from public.student_schedule_events where class_id in (
        select id from public.classes where teacher_id = auth.uid()
      )
    )
  );

create policy "anon_read_event_assignments" on public.student_event_assignments
  for select using (true);

create index idx_student_events_class on public.student_schedule_events(class_id, active);
create index idx_event_assignments_event on public.student_event_assignments(event_id);
create index idx_event_assignments_student on public.student_event_assignments(student_id);
