-- Add plan_followed and plan_deviation_reason columns to journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS plan_followed boolean,
ADD COLUMN IF NOT EXISTS plan_deviation_reason text;

-- Add check constraint for energy_level (1-5)
ALTER TABLE public.journal_entries 
ADD CONSTRAINT energy_level_range CHECK (energy_level >= 1 AND energy_level <= 5);

-- Create index for faster date-based lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
ON public.journal_entries (user_id, entry_date DESC);

-- Add unique constraint on user_id + entry_date if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'journal_entries_user_date_unique'
    ) THEN
        ALTER TABLE public.journal_entries 
        ADD CONSTRAINT journal_entries_user_date_unique UNIQUE (user_id, entry_date);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;