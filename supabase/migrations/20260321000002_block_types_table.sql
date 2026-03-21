-- Block Types catalog table — moves 44+ block types from TypeScript to database
create table public.block_types (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  category text not null,
  default_color text not null default 'coral',
  default_duration_min integer not null default 10,
  default_duration_max integer not null default 60,
  subject_description text not null default '',
  standards_framework text,
  is_instructional boolean not null default true,
  non_instructional_message text,
  icon text not null default 'Plus',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.block_types enable row level security;
create policy "anyone_read_block_types" on public.block_types for select using (true);
create index idx_block_types_category on public.block_types(category, sort_order);

-- Seed all 45 block types
insert into public.block_types (key, label, category, default_color, default_duration_min, default_duration_max, subject_description, standards_framework, is_instructional, non_instructional_message, icon, sort_order) values
  -- Core Academic (5)
  ('reading', 'Reading', 'core_academic', 'teal', 30, 60, 'Literacy, comprehension, fluency, phonics, guided reading', 'Common Core ELA', true, null, 'BookOpen', 1),
  ('writing', 'Writing', 'core_academic', 'blue', 30, 50, 'Writing workshop, grammar, conventions, author''s craft', 'Common Core ELA', true, null, 'PenTool', 2),
  ('math', 'Math', 'core_academic', 'purple', 45, 75, 'Number sense, operations, fractions, geometry, measurement', 'Common Core Math', true, null, 'Calculator', 3),
  ('science', 'Science', 'core_academic', 'green', 30, 60, 'Life science, earth science, physical science, inquiry', 'NGSS', true, null, 'FlaskConical', 4),
  ('social_studies', 'Social Studies', 'core_academic', 'amber', 30, 45, 'History, geography, civics, economics, cultural studies', 'State frameworks', true, null, 'Globe', 5),
  -- Language Arts Supplemental (5)
  ('ela_combined', 'ELA (Combined)', 'language_arts_supplemental', 'teal', 60, 120, 'Full English Language Arts block', 'Common Core ELA', true, null, 'BookOpen', 6),
  ('phonics', 'Phonics / Foundational Skills', 'language_arts_supplemental', 'teal', 15, 30, 'Letter sounds, blends, digraphs, decoding, encoding', 'Common Core ELA Foundational', true, null, 'Abc', 7),
  ('vocabulary', 'Vocabulary / Word Study', 'language_arts_supplemental', 'blue', 15, 30, 'Academic vocabulary, word relationships, morphology', 'Common Core ELA Language', true, null, 'BookA', 8),
  ('spelling', 'Spelling', 'language_arts_supplemental', 'blue', 15, 25, 'Spelling patterns, high-frequency words, word sorts', 'Common Core ELA Language', true, null, 'Spellcheck', 9),
  ('handwriting', 'Handwriting / Keyboarding', 'language_arts_supplemental', 'blue', 10, 20, 'Letter formation, cursive, typing skills', null, true, null, 'Keyboard', 10),
  -- Electives & Specials (16)
  ('music', 'Music', 'electives_specials', 'pink', 30, 50, 'Songs, instruments, rhythm, melody, music theory', null, true, null, 'Music', 11),
  ('art', 'Art', 'electives_specials', 'pink', 30, 50, 'Drawing, painting, sculpture, art history, design', null, true, null, 'Palette', 12),
  ('pe', 'Physical Education', 'electives_specials', 'coral', 30, 50, 'Movement, sports, fitness, team games, health', null, true, null, 'Dumbbell', 13),
  ('drama', 'Drama / Theater', 'electives_specials', 'pink', 30, 50, 'Performance, scripts, improvisation, storytelling', null, true, null, 'Theater', 14),
  ('dance', 'Dance', 'electives_specials', 'pink', 30, 50, 'Movement, rhythm, choreography, cultural dances', null, true, null, 'Footprints', 15),
  ('steam', 'STEAM', 'electives_specials', 'green', 45, 90, 'Integrated Science + Technology + Engineering + Art + Math', null, true, null, 'Lightbulb', 16),
  ('technology', 'Technology / Computer Lab', 'electives_specials', 'blue', 30, 50, 'Coding, digital literacy, typing, digital citizenship', null, true, null, 'Monitor', 17),
  ('library', 'Library', 'electives_specials', 'amber', 30, 50, 'Book selection, research skills, information literacy', null, true, null, 'Library', 18),
  ('makerspace', 'Makerspace', 'electives_specials', 'green', 30, 60, 'Building, designing, prototyping, tinkering', null, true, null, 'Wrench', 19),
  ('foreign_language', 'Foreign Language', 'electives_specials', 'teal', 20, 45, 'Language acquisition, vocabulary, conversation, culture', null, true, null, 'Languages', 20),
  ('journalism', 'Journalism / Media', 'electives_specials', 'blue', 30, 50, 'Writing, reporting, media literacy, publishing', null, true, null, 'Newspaper', 21),
  ('debate', 'Debate / Public Speaking', 'electives_specials', 'amber', 30, 50, 'Argumentation, research, oral communication', null, true, null, 'MessageSquare', 22),
  ('robotics', 'Robotics', 'electives_specials', 'green', 45, 60, 'Programming, engineering, problem solving', null, true, null, 'Bot', 23),
  ('financial_literacy', 'Financial Literacy', 'electives_specials', 'amber', 20, 40, 'Money concepts, budgeting, saving, economic decisions', null, true, null, 'Banknote', 24),
  ('health', 'Health', 'electives_specials', 'green', 20, 40, 'Body systems, nutrition, hygiene, mental health, safety', null, true, null, 'Heart', 25),
  ('specials_combined', 'Specials', 'electives_specials', 'pink', 30, 60, 'PE / Art / Music / Library rotation', null, true, null, 'Star', 26),
  -- Support & Intervention (4)
  ('intervention', 'Intervention / Support', 'support_intervention', 'coral', 20, 45, 'Pull-out or push-in academic support, re-teaching', null, true, null, 'LifeBuoy', 27),
  ('enrichment', 'Enrichment / GATE', 'support_intervention', 'purple', 20, 45, 'Above-grade extension, independent research, gifted programming', null, true, null, 'Rocket', 28),
  ('speech_therapy', 'Speech / Language Therapy', 'support_intervention', 'pink', 20, 30, 'Speech sounds, language development, communication skills', null, true, null, 'MessageCircle', 29),
  ('occupational_therapy', 'Occupational Therapy', 'support_intervention', 'pink', 20, 30, 'Fine motor, sensory processing, self-regulation', null, true, null, 'Hand', 30),
  -- Social-Emotional & Community (4)
  ('sel', 'Social-Emotional Learning', 'social_emotional', 'pink', 15, 30, 'Emotions, self-regulation, empathy, relationships', 'CASEL', true, null, 'HeartHandshake', 31),
  ('advisory', 'Advisory / Homeroom', 'social_emotional', 'teal', 15, 30, 'Morning meeting, announcements, goal setting, community rituals', null, true, null, 'Users', 32),
  ('class_meeting', 'Class Meeting', 'social_emotional', 'teal', 10, 20, 'Whole-class discussion, community problem solving, sharing circle', null, true, null, 'CircleDot', 33),
  ('mindfulness', 'Mindfulness / Wellness', 'social_emotional', 'pink', 5, 15, 'Breathing exercises, meditation, yoga, gratitude practice', null, true, null, 'Flower2', 34),
  -- Non-Instructional (8)
  ('break_time', 'Break', 'non_instructional', 'amber', 5, 15, '', null, false, 'Take a break — you''ve earned it!', 'Coffee', 35),
  ('lunch', 'Lunch', 'non_instructional', 'amber', 20, 35, '', null, false, 'Enjoy your lunch!', 'UtensilsCrossed', 36),
  ('recess', 'Recess', 'non_instructional', 'amber', 10, 20, '', null, false, 'Go play — see you soon!', 'Sun', 37),
  ('snack', 'Snack', 'non_instructional', 'amber', 5, 10, '', null, false, 'Snack time!', 'Apple', 38),
  ('transition', 'Transition / Passing Period', 'non_instructional', 'amber', 3, 10, '', null, false, null, 'ArrowRightLeft', 39),
  ('assembly', 'Assembly', 'non_instructional', 'amber', 20, 60, '', null, false, 'Head to the assembly!', 'Megaphone', 40),
  ('field_trip', 'Field Trip', 'non_instructional', 'amber', 60, 480, '', null, false, 'Enjoy your field trip!', 'Bus', 41),
  ('testing', 'Testing / Assessment', 'non_instructional', 'amber', 30, 90, 'State testing, benchmark assessment', null, false, null, 'ClipboardCheck', 42),
  -- Free & Flexible (3)
  ('free_choice', 'Free Choice', 'free_flexible', 'coral', 15, 30, 'Student selects activity from teacher-defined menu', null, true, null, 'Sparkles', 43),
  ('project_time', 'Project / Passion Time', 'free_flexible', 'coral', 30, 60, 'Student-driven long-term project, genius hour', null, true, null, 'Flame', 44),
  ('custom', 'Custom Block', 'free_flexible', 'coral', 10, 60, 'Teacher-defined', null, true, null, 'Plus', 45)
on conflict (key) do nothing;
