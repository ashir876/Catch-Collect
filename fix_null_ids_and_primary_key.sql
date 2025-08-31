-- FIX NULL IDs AND PRIMARY KEY STRUCTURE
-- First fix null id values, then change primary key to allow multiple copies
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

-- Step 2: Check for null id values
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 3: Update null id values with new UUIDs
UPDATE card_collections 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- Step 4: Verify no null ids remain
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 5: Check for duplicate ids
SELECT id, COUNT(*) as count
FROM card_collections
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 6: Drop the current primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 7: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 8: Add a performance index on (user_id, card_id, language)
CREATE INDEX idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 9: Do the same for card_wishlist table
-- Check for null id values in wishlist
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_wishlist;

-- Step 10: Update null id values in wishlist with new UUIDs
UPDATE card_wishlist 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- Step 11: Verify no null ids remain in wishlist
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_wishlist;

-- Step 12: Check for duplicate ids in wishlist
SELECT id, COUNT(*) as count
FROM card_wishlist
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 13: Drop the current primary key constraint for wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT card_wishlist_pkey;

-- Step 14: Add a new primary key constraint on just the 'id' column for wishlist
ALTER TABLE card_wishlist ADD CONSTRAINT card_wishlist_pkey PRIMARY KEY (id);

-- Step 15: Add a performance index on (user_id, card_id, language) for wishlist
CREATE INDEX idx_card_wishlist_user_card_language ON card_wishlist(user_id, card_id, language);

-- Step 16: Verify the new primary key structure
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

-- Step 17: Test that multiple copies can now be inserted
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-null-fix', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-null-fix', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-null-fix', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 18: Verify the test inserts worked
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
  AND card_id = 'test-card-null-fix'
ORDER BY created_at;

-- Step 19: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-null-fix';

-- Success! Null IDs have been fixed and primary key structure allows multiple copies.
