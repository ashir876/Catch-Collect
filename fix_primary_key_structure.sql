-- FIX PRIMARY KEY STRUCTURE
-- The primary key is currently on (user_id, card_id, language) which prevents multiple copies
-- We need to change it to just use the 'id' column to allow multiple copies
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

-- Step 2: Check if 'id' column exists and has unique values
SELECT COUNT(*) as total_rows, COUNT(DISTINCT id) as unique_ids
FROM card_collections;

-- Step 3: Drop the current primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 4: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 5: Add a unique index on (user_id, card_id, language) for data integrity (optional)
-- This will help with queries but won't prevent multiple copies
CREATE INDEX idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 6: Do the same for card_wishlist table
-- Check current primary key structure
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

-- Step 7: Check if 'id' column exists and has unique values in wishlist
SELECT COUNT(*) as total_rows, COUNT(DISTINCT id) as unique_ids
FROM card_wishlist;

-- Step 8: Drop the current primary key constraint for wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT card_wishlist_pkey;

-- Step 9: Add a new primary key constraint on just the 'id' column for wishlist
ALTER TABLE card_wishlist ADD CONSTRAINT card_wishlist_pkey PRIMARY KEY (id);

-- Step 10: Add a unique index on (user_id, card_id, language) for wishlist (optional)
CREATE INDEX idx_card_wishlist_user_card_language ON card_wishlist(user_id, card_id, language);

-- Step 11: Verify the new primary key structure
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

-- Step 12: Test that multiple copies can now be inserted
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-pk-fix', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-pk-fix', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-pk-fix', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 13: Verify the test inserts worked
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
  AND card_id = 'test-card-pk-fix'
ORDER BY created_at;

-- Step 14: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-pk-fix';

-- Success! The primary key structure has been fixed to allow multiple copies.
