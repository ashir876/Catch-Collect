-- FINAL SOLUTION: Recreate tables without any unique constraints (FIXED)
-- Run this in your Supabase SQL Editor

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'card_collections' 
ORDER BY ordinal_position;

-- Step 2: Create backup with explicit column selection
CREATE TABLE IF NOT EXISTS card_collections_backup AS 
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  condition,
  price,
  notes,
  quantity,
  acquired_date,
  created_at,
  updated_at
FROM card_collections;

CREATE TABLE IF NOT EXISTS card_wishlist_backup AS 
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  priority,
  price,
  notes,
  created_at,
  updated_at
FROM card_wishlist;

-- Step 3: Drop existing tables
DROP TABLE IF EXISTS card_collections CASCADE;
DROP TABLE IF EXISTS card_wishlist CASCADE;

-- Step 4: Recreate card_collections table WITHOUT any unique constraints
CREATE TABLE public.card_collections (
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

-- Step 5: Recreate card_wishlist table WITHOUT any unique constraints
CREATE TABLE public.card_wishlist (
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
  priority TEXT DEFAULT 'medium',
  price DECIMAL(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 6: Add indexes for performance (but NOT unique)
CREATE INDEX idx_card_collections_user_id ON public.card_collections(user_id);
CREATE INDEX idx_card_collections_card_id ON public.card_collections(card_id);
CREATE INDEX idx_card_collections_user_card ON public.card_collections(user_id, card_id);
CREATE INDEX idx_card_collections_acquired_date ON public.card_collections(acquired_date);

CREATE INDEX idx_card_wishlist_user_id ON public.card_wishlist(user_id);
CREATE INDEX idx_card_wishlist_card_id ON public.card_wishlist(card_id);
CREATE INDEX idx_card_wishlist_user_card ON public.card_wishlist(user_id, card_id);

-- Step 7: Enable RLS
ALTER TABLE public.card_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_wishlist ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
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

CREATE POLICY "Users can view their own wishlist items" 
  ON public.card_wishlist FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" 
  ON public.card_wishlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items" 
  ON public.card_wishlist FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
  ON public.card_wishlist FOR DELETE 
  USING (auth.uid() = user_id);

-- Step 9: Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_card_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_card_collections_updated_at 
  BEFORE UPDATE ON public.card_collections 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_card_collections_updated_at();

CREATE OR REPLACE FUNCTION update_card_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_card_wishlist_updated_at 
  BEFORE UPDATE ON public.card_wishlist 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_card_wishlist_updated_at();

-- Step 10: Restore data from backup with explicit column mapping
INSERT INTO card_collections (
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  condition,
  price,
  notes,
  quantity,
  acquired_date,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  condition,
  price,
  notes,
  quantity,
  acquired_date,
  created_at,
  updated_at
FROM card_collections_backup;

INSERT INTO card_wishlist (
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  priority,
  price,
  notes,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  set_name,
  set_id,
  card_number,
  rarity,
  image_url,
  description,
  illustrator,
  hp,
  types,
  attacks,
  weaknesses,
  retreat,
  priority,
  price,
  notes,
  created_at,
  updated_at
FROM card_wishlist_backup;

-- Step 11: Verify no unique constraints exist
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('card_collections', 'card_wishlist') 
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 12: Test insert multiple copies
INSERT INTO public.card_collections (
  user_id, 
  card_id, 
  condition, 
  price, 
  notes, 
  language, 
  name, 
  set_name
) VALUES 
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set');

-- Step 13: Verify test inserts worked
SELECT 
  COUNT(*) as total_copies, 
  card_id
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1'
GROUP BY card_id;

-- Step 14: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1';

-- Step 15: Clean up backup tables (optional)
-- DROP TABLE IF EXISTS card_collections_backup;
-- DROP TABLE IF EXISTS card_wishlist_backup;
