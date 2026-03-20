-- Classmosis Schedule V2: Expanded block types + sub-routine system
-- Removes old 6-value CHECK constraint, adds new columns for 44-block + 63-subroutine system

-- ============================================================
-- EXPAND BLOCKS TABLE
-- ============================================================

-- Drop the old type CHECK constraint (allows any string now — validated in TypeScript)
DO $$ BEGIN
  ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Add new columns
ALTER TABLE public.blocks
  ADD COLUMN IF NOT EXISTS is_instructional boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS non_instructional_message text,
  ADD COLUMN IF NOT EXISTS subject_description text,
  ADD COLUMN IF NOT EXISTS student_view_settings jsonb NOT NULL DEFAULT '{"show_sub_routines_in_full_day": true, "student_can_see_ahead": "all", "full_day_view_available": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS category text;

-- Backfill category for existing blocks
UPDATE public.blocks SET category = 'core_academic' WHERE type = 'academic' AND category IS NULL;
UPDATE public.blocks SET category = 'social_emotional' WHERE type = 'routine' AND category IS NULL;
UPDATE public.blocks SET category = 'non_instructional' WHERE type = 'flex' AND category IS NULL;
UPDATE public.blocks SET category = 'electives_specials' WHERE type = 'rotation' AND category IS NULL;
UPDATE public.blocks SET category = 'assessment' WHERE type = 'assessment' AND category IS NULL;
UPDATE public.blocks SET category = 'economy' WHERE type = 'economy' AND category IS NULL;

-- Backfill is_instructional for non-teaching blocks
UPDATE public.blocks SET is_instructional = false WHERE type IN ('economy', 'flex') AND is_instructional = true;
