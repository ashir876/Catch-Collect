-- Migration to allow multiple instances of the same card in collections
-- This allows users to add the same card multiple times with different details

-- First, let's check if the card_collections table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.card_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  name TEXT,
  set_name TEXT,
  set_id TEXT,
  card_number TEXT,
  rarity TEXT,
  image_url TEXT,
  description TEXT,
  illustrator TEXT,
  hp INTEGER,
  types TEXT[],
  attacks JSONB,
  weaknesses JSONB,
  retreat INTEGER,
  condition TEXT DEFAULT 'Near Mint',
  price DECIMAL(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  acquired_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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
  
  -- Drop any other unique constraints that might prevent multiple instances
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%card_collections%unique%' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT IF EXISTS card_collections_user_id_card_id_key;
  END IF;
END $$;

-- Create a new unique constraint that allows multiple instances of the same card
-- but prevents exact duplicates (same user, card, condition, price, date, notes)
ALTER TABLE public.card_collections 
ADD CONSTRAINT card_collections_unique_instance 
UNIQUE (user_id, card_id, condition, price, acquired_date, notes);

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

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_card_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_card_collections_updated_at ON public.card_collections;
CREATE TRIGGER update_card_collections_updated_at 
  BEFORE UPDATE ON public.card_collections 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_card_collections_updated_at();
