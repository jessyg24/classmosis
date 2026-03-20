-- Remove PIN authentication from students (no longer needed)
-- Students now authenticate via daily class code + name selection only.

-- Drop pin_hash requirement (make nullable for backward compat, then drop)
ALTER TABLE public.students ALTER COLUMN pin_hash DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN pin_hash SET DEFAULT NULL;

-- Drop google_id (students have no profiles/accounts)
-- Keep column but ensure it's nullable (already is)

-- Add job-related columns that the TypeScript types expect
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'active_job_id'
  ) THEN
    ALTER TABLE public.students ADD COLUMN active_job_id uuid;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'active_job_multiplier'
  ) THEN
    ALTER TABLE public.students ADD COLUMN active_job_multiplier numeric NOT NULL DEFAULT 1.0;
  END IF;
END $$;

COMMENT ON TABLE public.students IS
  'Students authenticate via daily class code + name selection. No PIN, no email, no profile.';
