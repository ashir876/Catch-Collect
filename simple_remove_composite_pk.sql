-- SIMPLE FIX: Remove composite primary key constraint
-- This approach doesn't change table structure, just removes the problematic constraint
-- Run this in your Supabase SQL Editor

-- Step 1: Check current primary key structure
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections' 
  AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 2: Check if there's a sequence for the id column
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'card_collections' AND column_name = 'id';

-- Step 3: Add a sequence for the id column if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS card_collections_id_seq;

-- Step 4: Set the sequence to start from the maximum id value + 1
SELECT setval('card_collections_id_seq', COALESCE((SELECT MAX(id) FROM card_collections), 0) + 1);

-- Step 5: Alter the id column to use the sequence as default
ALTER TABLE card_collections ALTER COLUMN id SET DEFAULT nextval('card_collections_id_seq');

-- Step 6: Drop the current composite primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 7: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 8: Add a performance index on (user_id, card_id, language)
CREATE INDEX IF NOT EXISTS idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 9: Do the same for card_wishlist table
-- Check current primary key structure for wishlist
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_wishlist' 
  AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 10: Check if there's a sequence for the wishlist id column
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'card_wishlist' AND column_name = 'id';

-- Step 11: Add a sequence for the wishlist id column if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS card_wishlist_id_seq;

-- Step 12: Set the sequence to start from the maximum id value + 1
SELECT setval('card_wishlist_id_seq', COALESCE((SELECT MAX(id) FROM card_wishlist), 0) + 1);

-- Step 13: Alter the wishlist id column to use the sequence as default
ALTER TABLE card_wishlist ALTER COLUMN id SET DEFAULT nextval('card_wishlist_id_seq');

-- Step 14: Drop the current composite primary key constraint for wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT card_wishlist_pkey;

-- Step 15: Add a new primary key constraint on just the 'id' column for wishlist
ALTER TABLE card_wishlist ADD CONSTRAINT card_wishlist_pkey PRIMARY KEY (id);

-- Step 16: Add a performance index on (user_id, card_id, language) for wishlist
CREATE INDEX IF NOT EXISTS idx_card_wishlist_user_card_language ON card_wishlist(user_id, card_id, language);

-- Step 17: Verify the new primary key structure
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('card_collections', 'card_wishlist') 
  AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 18: Test that multiple copies can now be inserted (without specifying id)
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-simple-fix', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-simple-fix', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-simple-fix', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 19: Verify the test inserts worked
SELECT 
  id,
  user_id,
  card_id,
  condition,
  price,
  language,
  created_at
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-simple-fix'
ORDER BY created_at;

-- Step 20: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-simple-fix';

-- Success! The composite primary key constraint has been removed and sequences added for automatic ID generation.
