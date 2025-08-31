-- SIMPLE FIX: Remove unique constraints without recreating tables
-- This is safe and won't disturb your existing data
-- Run this in your Supabase SQL Editor

-- Step 1: Check what unique constraints currently exist
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

-- Step 2: Drop any unique constraints that exist (if any)
-- This will only drop constraints, not your data or table structure

-- For card_collections table
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
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- For card_wishlist table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'card_wishlist' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name != 'card_wishlist_pkey'  -- Don't drop primary key
    LOOP
        EXECUTE 'ALTER TABLE card_wishlist DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Step 3: Drop any unique indexes that might exist
DROP INDEX IF EXISTS idx_card_collections_user_card_unique;
DROP INDEX IF EXISTS idx_card_wishlist_user_card_unique;
DROP INDEX IF EXISTS idx_card_collections_unique;
DROP INDEX IF EXISTS idx_card_wishlist_unique;

-- Step 4: Verify no unique constraints remain (except primary keys)
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

-- Step 5: Test that multiple copies can now be inserted
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-simple', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-simple', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set');

-- Step 6: Verify the test inserts worked
SELECT 
  COUNT(*) as total_copies, 
  card_id,
  condition,
  price
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-simple'
GROUP BY card_id, condition, price;

-- Step 7: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-simple';

-- Success! Your tables should now allow multiple copies without the 409 error.
