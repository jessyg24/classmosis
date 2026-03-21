-- Add days_of_week column to schedule_templates
-- Allows teachers to tag templates for specific weekdays (e.g., "Monday schedule")

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schedule_templates' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE public.schedule_templates
      ADD COLUMN days_of_week text[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

COMMENT ON COLUMN public.schedule_templates.days_of_week IS
  'Array of weekday names this template applies to, e.g. ["Monday", "Wednesday"]';
