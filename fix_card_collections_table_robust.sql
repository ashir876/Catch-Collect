-- FIX CARD_COLLECTIONS TABLE - ROBUST VERSION
-- Handles duplicate IDs and null values properly
-- Run this in your Supabase SQL Editor

-- Step 1: Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'card_collection%'
ORDER BY table_name;

-- Step 2: Check current primary key structure for card_collections
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

-- Step 3: Check for duplicate IDs
SELECT id, COUNT(*) as count
FROM card_collections
GROUP BY id
HAVING COUNT(*) > 1
ORDER BY id;

-- Step 4: Check for null IDs
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 5: Find the maximum id value
SELECT COALESCE(MAX(id), 0) as max_id FROM card_collections;

-- Step 6: Create a sequence for the id column
CREATE SEQUENCE IF NOT EXISTS card_collections_id_seq;

-- Step 7: Set the sequence to start from the maximum id value + 1
SELECT setval('card_collections_id_seq'::regclass, (COALESCE((SELECT MAX(id) FROM card_collections), 0) + 1)::bigint);

-- Step 8: Create a temporary table to reassign all IDs
CREATE TEMP TABLE temp_card_collections AS 
SELECT 
  ROW_NUMBER() OVER (ORDER BY created_at, ctid) as new_id,
  ctid,
  user_id,
  card_id,
  condition,
  price,
  notes,
  language,
  name,
  set_name,
  created_at,
  updated_at
FROM card_collections;

-- Step 9: Update all rows with new sequential IDs
UPDATE card_collections 
SET id = temp.new_id
FROM temp_card_collections temp
WHERE card_collections.ctid = temp.ctid;

-- Step 10: Verify no duplicate IDs remain
SELECT id, COUNT(*) as count
FROM card_collections
GROUP BY id
HAVING COUNT(*) > 1
ORDER BY id;

-- Step 11: Verify no null IDs remain
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 12: Set the sequence to the new maximum value
SELECT setval('card_collections_id_seq'::regclass, (SELECT MAX(id) FROM card_collections)::bigint);

-- Step 13: Add default value to id column
ALTER TABLE card_collections ALTER COLUMN id SET DEFAULT nextval('card_collections_id_seq');

-- Step 14: Drop the current composite primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 15: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 16: Add a performance index on (user_id, card_id, language)
CREATE INDEX IF NOT EXISTS idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 17: Verify the new primary key structure
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-robust', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-robust', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-robust', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

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
  AND card_id = 'test-card-robust'
ORDER BY created_at;

-- Step 20: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-robust';

-- Step 21: Clean up temporary table
DROP TABLE temp_card_collections;

-- Success! The card_collections table has been fixed.
-- All duplicate IDs have been resolved and the table now supports multiple copies.





