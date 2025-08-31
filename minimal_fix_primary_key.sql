-- MINIMAL FIX: Remove composite primary key constraint
-- This is the simplest approach - just remove the problematic constraint
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

-- Step 2: Drop the current composite primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 3: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 4: Add a performance index on (user_id, card_id, language)
CREATE INDEX IF NOT EXISTS idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 5: Do the same for card_wishlist table
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

-- Step 6: Drop the current composite primary key constraint for wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT card_wishlist_pkey;

-- Step 7: Add a new primary key constraint on just the 'id' column for wishlist
ALTER TABLE card_wishlist ADD CONSTRAINT card_wishlist_pkey PRIMARY KEY (id);

-- Step 8: Add a performance index on (user_id, card_id, language) for wishlist
CREATE INDEX IF NOT EXISTS idx_card_wishlist_user_card_language ON card_wishlist(user_id, card_id, language);

-- Step 9: Verify the new primary key structure
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

-- Step 10: Test that multiple copies can now be inserted (with explicit id values)
INSERT INTO public.card_collections (
  id,
  user_id, 
  card_id, 
  condition, 
  price, 
  notes, 
  language, 
  name, 
  set_name
) VALUES 
  ((SELECT COALESCE(MAX(id), 0) + 1 FROM card_collections), 'ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-minimal-fix', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ((SELECT COALESCE(MAX(id), 0) + 2 FROM card_collections), 'ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-minimal-fix', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ((SELECT COALESCE(MAX(id), 0) + 3 FROM card_collections), 'ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-minimal-fix', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 11: Verify the test inserts worked
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
  AND card_id = 'test-card-minimal-fix'
ORDER BY created_at;

-- Step 12: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-minimal-fix';

-- Success! The composite primary key constraint has been removed.
-- Your application should now be able to add multiple copies of the same card.
-- Note: You may need to modify your application code to generate id values when inserting.
