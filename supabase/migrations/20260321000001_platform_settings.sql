-- Platform Settings: key-value store for all configurable platform values
create table public.platform_settings (
  key text primary key,
  value jsonb not null,
  description text,
  category text not null default 'general',
  updated_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

-- Only readable via service role (admin API)
create policy "authenticated_read_settings" on public.platform_settings
  for select using (true);

-- Seed all current hardcoded values
insert into public.platform_settings (key, value, description, category) values
  -- Pricing
  ('monthly_price', '19.99', 'Monthly Pro subscription price (USD)', 'pricing'),
  ('annual_price', '119', 'Annual Pro subscription price (USD)', 'pricing'),
  ('trial_days', '7', 'Free trial duration in days', 'pricing'),

  -- Free tier limits
  ('max_classes_free', '3', 'Maximum classes for free tier', 'limits'),
  ('max_students_per_class_free', '30', 'Maximum students per class for free tier', 'limits'),

  -- AI limits
  ('daily_ai_limit', '20', 'Maximum AI calls per teacher per day', 'limits'),
  ('monthly_ai_limit', '200', 'Maximum AI calls per class per month', 'limits'),

  -- Feature gates (which features require Pro)
  ('feature_tier_map', '{"ai_grading":"pro","ai_rubric_gen":"pro","ai_practice_gen":"pro","ai_feedback":"pro","parent_portal":"pro","mystery_student":"pro","class_jobs":"pro","unlimited_classes":"pro","unlimited_students":"pro"}', 'Feature-to-tier mapping', 'features'),

  -- Economy defaults
  ('default_coins_per_assignment', '2', 'Default coins awarded per assignment submission', 'economy'),
  ('default_coins_per_practice', '1', 'Default coins per correct practice answer', 'economy'),
  ('default_mystery_multiplier', '3', 'Default mystery student multiplier', 'economy'),
  ('default_streak_bonus', '{"5":3,"10":7,"25":20}', 'Streak bonus thresholds (correct_count: bonus_coins)', 'economy'),

  -- Site
  ('site_name', '"Classmosis"', 'Platform display name', 'site'),
  ('support_email', '"support@classmosis.com"', 'Support email address', 'site')
on conflict (key) do nothing;
