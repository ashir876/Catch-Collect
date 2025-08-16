-- Add acquired_date column to card_collections table
-- Run this in the Supabase SQL editor

-- Add the acquired_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'card_collections' 
    AND column_name = 'acquired_date'
  ) THEN
    ALTER TABLE public.card_collections 
    ADD COLUMN acquired_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add quantity column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'card_collections' 
    AND column_name = 'quantity'
  ) THEN
    ALTER TABLE public.card_collections 
    ADD COLUMN quantity INTEGER DEFAULT 1;
  END IF;
END $$;

-- Drop any existing unique constraints that prevent multiple instances
DO $$
BEGIN
  -- Drop existing unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_user_card_unique' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_user_card_unique;
  END IF;
  
  -- Drop the simple user_id + card_id unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_user_id_card_id_key' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_user_id_card_id_key;
  END IF;
END $$;

-- Create a new unique constraint that allows multiple instances of the same card
-- but prevents exact duplicates (same user, card, condition, price, date, notes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_unique_instance' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections 
    ADD CONSTRAINT card_collections_unique_instance 
    UNIQUE (user_id, card_id, condition, price, acquired_date, notes);
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_collections_user_id ON public.card_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_card_id ON public.card_collections(card_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_user_card ON public.card_collections(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_acquired_date ON public.card_collections(acquired_date);

-- Enable RLS if not already enabled
ALTER TABLE public.card_collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own collection items" ON public.card_collections;
DROP POLICY IF EXISTS "Users can insert their own collection items" ON public.card_collections;
DROP POLICY IF EXISTS "Users can update their own collection items" ON public.card_collections;
DROP POLICY IF EXISTS "Users can delete their own collection items" ON public.card_collections;

-- Create new RLS policies
CREATE POLICY "Users can view their own collection items" 
  ON public.card_collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection items" 
  ON public.card_collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection items" 
  ON public.card_collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collection items" 
  ON public.card_collections FOR DELETE 
  USING (auth.uid() = user_id);

-- Show current table structure for verification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'card_collections' 
ORDER BY ordinal_position;

-- Show current constraints for verification
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections' 
    AND tc.table_schema = 'public'
    AND tc.constraint_type = 'UNIQUE';
