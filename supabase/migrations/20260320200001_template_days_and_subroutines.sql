-- Add day-of-week tagging to schedule templates
ALTER TABLE public.schedule_templates
  ADD COLUMN IF NOT EXISTS days_of_week text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.schedule_templates.days_of_week IS
  'Array of day names this template applies to: ["Monday","Tuesday",...]';
