-- Add inserts JSONB column to blocks table
-- Inserts are ordered arrays of activities nested inside a schedule block.
-- Stored as JSONB for simplicity: always loaded/saved with their parent block,
-- never queried independently. Inherits RLS from the blocks table.
--
-- Each insert: { id, type, label, duration_minutes, order_index, settings }

ALTER TABLE public.blocks
  ADD COLUMN IF NOT EXISTS inserts jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.blocks.inserts IS
  'Ordered array of insert objects: [{id, type, label, duration_minutes, order_index, settings}]';
