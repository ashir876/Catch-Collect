-- FINAL FIX: Completely remove all constraints and recreate tables if needed
-- Run this in your Supabase SQL Editor

-- Step 1: Check what constraints currently exist
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('card_collections', 'card_wishlist') 
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.table_name, tc.constraint_name;

-- Step 2: Drop ALL constraints from card_collections (except primary key)
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.card_collections'::regclass
      AND contype != 'p'  -- Don't drop primary keys
  LOOP
    EXECUTE 'ALTER TABLE public.card_collections DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Step 3: Drop ALL constraints from card_wishlist (except primary key)
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.card_wishlist'::regclass
      AND contype != 'p'  -- Don't drop primary keys
  LOOP
    EXECUTE 'ALTER TABLE public.card_wishlist DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Step 4: Drop ALL indexes that might enforce uniqueness
DO $$
DECLARE
  index_record RECORD;
BEGIN
  FOR index_record IN 
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename IN ('card_collections', 'card_wishlist')
      AND (indexdef LIKE '%UNIQUE%' OR indexdef LIKE '%user_id%' AND indexdef LIKE '%card_id%')
      AND indexname NOT LIKE '%_pkey'  -- Don't drop primary keys
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname;
    RAISE NOTICE 'Dropped index: %', index_record.indexname;
  END LOOP;
END $$;

-- Step 5: Check for any triggers that might prevent duplicates
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('card_collections', 'card_wishlist');

-- Step 6: Drop any triggers that might prevent duplicates
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table IN ('card_collections', 'card_wishlist')
      AND trigger_name NOT LIKE '%updated_at%'  -- Keep the updated_at trigger
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON ' || 
            CASE 
              WHEN trigger_record.trigger_name LIKE '%card_collections%' THEN 'card_collections'
              WHEN trigger_record.trigger_name LIKE '%card_wishlist%' THEN 'card_wishlist'
            END;
    RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
  END LOOP;
END $$;

-- Step 7: Verify all constraints are removed
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

-- Step 8: Show all remaining constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('card_collections', 'card_wishlist') 
ORDER BY tc.table_name, tc.constraint_name;

-- Step 9: Test insert with your actual user ID
-- Uncomment and run this section to test
/*
INSERT INTO public.card_collections (user_id, card_id, condition, price, notes, language, name, set_name)
VALUES 
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set');

-- Check if the inserts worked
SELECT COUNT(*) as total_copies, card_id 
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1'
GROUP BY card_id;

-- Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1';
*/
