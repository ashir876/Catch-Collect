-- FIX CARD_COLLECTIONS TABLE
-- Your application uses card_collections (not card_collections_with_id)
-- This script adds a default value for the id column to fix the NOT NULL constraint issue
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

-- Step 3: Check the data type of id column
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'card_collections' AND column_name = 'id';

-- Step 4: Check for null id values
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 5: Find the maximum id value
SELECT COALESCE(MAX(id), 0) as max_id FROM card_collections;

-- Step 6: Create a sequence for the id column
CREATE SEQUENCE IF NOT EXISTS card_collections_id_seq;

-- Step 7: Set the sequence to start from the maximum id value + 1 (with proper type casting)
SELECT setval('card_collections_id_seq'::regclass, (COALESCE((SELECT MAX(id) FROM card_collections), 0) + 1)::bigint);

-- Step 8: Update null id values with sequential numbers
DO $$
DECLARE
    max_id_val INTEGER;
    row_record RECORD;
    new_id INTEGER;
BEGIN
    -- Get the maximum id value
    SELECT COALESCE(MAX(id), 0) INTO max_id_val FROM card_collections;
    new_id := max_id_val + 1;
    
    -- Update each row with null id
    FOR row_record IN 
        SELECT ctid FROM card_collections WHERE id IS NULL
    LOOP
        UPDATE card_collections 
        SET id = new_id 
        WHERE ctid = row_record.ctid;
        new_id := new_id + 1;
    END LOOP;
END $$;

-- Step 9: Verify no null ids remain
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 10: Add default value to id column
ALTER TABLE card_collections ALTER COLUMN id SET DEFAULT nextval('card_collections_id_seq');

-- Step 11: Drop the current composite primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 12: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 13: Add a performance index on (user_id, card_id, language)
CREATE INDEX IF NOT EXISTS idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 14: Verify the new primary key structure
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

-- Step 15: Test that multiple copies can now be inserted (without specifying id)
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-fixed', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-fixed', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-fixed', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 16: Verify the test inserts worked
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
  AND card_id = 'test-card-fixed'
ORDER BY created_at;

-- Step 17: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-fixed';

-- Success! The card_collections table has been fixed.
-- Your application should now be able to add multiple copies of the same card.
