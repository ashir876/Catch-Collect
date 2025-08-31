-- FIX COMPOSITE UNIQUE CONSTRAINT
-- This script specifically targets the composite unique constraint causing the 409 error
-- Run this in your Supabase SQL Editor

-- Step 1: Check what constraints exist on card_collections
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections' 
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 2: Check what constraints exist on card_wishlist
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_wishlist' 
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 3: Drop the specific composite unique constraint on card_collections
-- Based on the error, it's likely on (user_id, card_id, language)
ALTER TABLE card_collections DROP CONSTRAINT IF EXISTS card_collections_user_id_card_id_language_key;
ALTER TABLE card_collections DROP CONSTRAINT IF EXISTS card_collections_user_card_language_unique;
ALTER TABLE card_collections DROP CONSTRAINT IF EXISTS card_collections_user_id_card_id_key;
ALTER TABLE card_collections DROP CONSTRAINT IF EXISTS card_collections_user_card_unique;

-- Step 4: Drop the specific composite unique constraint on card_wishlist
ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS card_wishlist_user_id_card_id_language_key;
ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS card_wishlist_user_card_language_unique;
ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS card_wishlist_user_id_card_id_key;
ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS card_wishlist_user_card_unique;

-- Step 5: Drop any other potential unique constraints (except primary keys)
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'card_collections' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name != 'card_collections_pkey'  -- Don't drop primary key
    LOOP
        EXECUTE 'ALTER TABLE card_collections DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped card_collections constraint: %', constraint_record.constraint_name;
    END LOOP;
    
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'card_wishlist' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name != 'card_wishlist_pkey'  -- Don't drop primary key
    LOOP
        EXECUTE 'ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped card_wishlist constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Step 6: Drop any unique indexes that might exist
DROP INDEX IF EXISTS idx_card_collections_user_card_language_unique;
DROP INDEX IF EXISTS idx_card_collections_user_card_unique;
DROP INDEX IF EXISTS idx_card_wishlist_user_card_language_unique;
DROP INDEX IF EXISTS idx_card_wishlist_user_card_unique;

-- Step 7: Verify no unique constraints remain (except primary keys)
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('card_collections', 'card_wishlist') 
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_name;

-- Step 8: Test that multiple copies can now be inserted
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-composite', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-composite', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set');

-- Step 9: Verify the test inserts worked
SELECT 
  COUNT(*) as total_copies, 
  card_id,
  condition,
  price,
  language
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-composite'
GROUP BY card_id, condition, price, language;

-- Step 10: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-composite';

-- Success! The composite unique constraint should now be removed.
