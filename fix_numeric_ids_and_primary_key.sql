-- FIX NUMERIC IDs AND PRIMARY KEY STRUCTURE
-- Works with numeric id columns (serial/integer) instead of UUID
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

-- Step 3: Check the data type of id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'card_collections' AND column_name = 'id';

-- Step 4: Find the maximum id value to generate new sequential ids
SELECT COALESCE(MAX(id), 0) as max_id FROM card_collections;

-- Step 5: Update null id values with sequential numbers
-- First, create a temporary sequence starting from max_id + 1
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

-- Step 6: Verify no null ids remain
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_collections;

-- Step 7: Check for duplicate ids
SELECT id, COUNT(*) as count
FROM card_collections
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 8: Drop the current primary key constraint
ALTER TABLE card_collections DROP CONSTRAINT card_collections_pkey;

-- Step 9: Add a new primary key constraint on just the 'id' column
ALTER TABLE card_collections ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 10: Add a performance index on (user_id, card_id, language)
CREATE INDEX idx_card_collections_user_card_language ON card_collections(user_id, card_id, language);

-- Step 11: Do the same for card_wishlist table
-- Check for null id values in wishlist
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_wishlist;

-- Step 12: Check the data type of id column in wishlist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'card_wishlist' AND column_name = 'id';

-- Step 13: Find the maximum id value in wishlist
SELECT COALESCE(MAX(id), 0) as max_id FROM card_wishlist;

-- Step 14: Update null id values in wishlist with sequential numbers
DO $$
DECLARE
    max_id_val INTEGER;
    row_record RECORD;
    new_id INTEGER;
BEGIN
    -- Get the maximum id value
    SELECT COALESCE(MAX(id), 0) INTO max_id_val FROM card_wishlist;
    new_id := max_id_val + 1;
    
    -- Update each row with null id
    FOR row_record IN 
        SELECT ctid FROM card_wishlist WHERE id IS NULL
    LOOP
        UPDATE card_wishlist 
        SET id = new_id 
        WHERE ctid = row_record.ctid;
        new_id := new_id + 1;
    END LOOP;
END $$;

-- Step 15: Verify no null ids remain in wishlist
SELECT COUNT(*) as total_rows, COUNT(id) as non_null_ids, COUNT(*) - COUNT(id) as null_ids
FROM card_wishlist;

-- Step 16: Check for duplicate ids in wishlist
SELECT id, COUNT(*) as count
FROM card_wishlist
GROUP BY id
HAVING COUNT(*) > 1;

-- Step 17: Drop the current primary key constraint for wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT card_wishlist_pkey;

-- Step 18: Add a new primary key constraint on just the 'id' column for wishlist
ALTER TABLE card_wishlist ADD CONSTRAINT card_wishlist_pkey PRIMARY KEY (id);

-- Step 19: Add a performance index on (user_id, card_id, language) for wishlist
CREATE INDEX idx_card_wishlist_user_card_language ON card_wishlist(user_id, card_id, language);

-- Step 20: Verify the new primary key structure
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

-- Step 21: Test that multiple copies can now be inserted
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-numeric-fix', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-numeric-fix', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-numeric-fix', 'Light Played', 6.00, 'Third copy', 'en', 'Test Card', 'Test Set');

-- Step 22: Verify the test inserts worked
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
  AND card_id = 'test-card-numeric-fix'
ORDER BY created_at;

-- Step 23: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-numeric-fix';

-- Success! Numeric IDs have been fixed and primary key structure allows multiple copies.
