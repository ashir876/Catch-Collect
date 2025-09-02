-- Check and fix remaining constraints that prevent multiple copies
-- Run this in your Supabase SQL Editor

-- Step 1: Check what constraints currently exist on card_collections
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  tc.is_deferrable,
  tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 2: Check for any unique constraints specifically
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.card_collections'::regclass
  AND contype = 'u'  -- unique constraints
ORDER BY conname;

-- Step 3: Check for any unique indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'card_collections'
  AND indexdef LIKE '%UNIQUE%';

-- Step 4: Drop ALL unique constraints (except primary key)
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.card_collections'::regclass
      AND contype = 'u'  -- unique constraints
      AND conname != 'card_collections_pkey'  -- don't drop primary key
  LOOP
    EXECUTE 'ALTER TABLE public.card_collections DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    RAISE NOTICE 'Dropped unique constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Step 5: Drop any unique indexes
DO $$
DECLARE
  index_record RECORD;
BEGIN
  FOR index_record IN 
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'card_collections'
      AND indexdef LIKE '%UNIQUE%'
      AND indexname NOT LIKE '%_pkey'  -- Don't drop primary keys
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname;
    RAISE NOTICE 'Dropped unique index: %', index_record.indexname;
  END LOOP;
END $$;

-- Step 6: Verify all unique constraints are removed
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections' 
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 7: Test that multiple copies can now be inserted
-- Replace 'your-user-id-here' with your actual user ID from the console logs
INSERT INTO public.card_collections (
  user_id, 
  card_id, 
  condition, 
  price, 
  notes, 
  language, 
  name, 
  set_name,
  created_at
) VALUES 
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-multiple', 'Mint', 10.00, 'First copy test', 'en', 'Test Card', 'Test Set', NOW()),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-multiple', 'Near Mint', 8.00, 'Second copy test', 'en', 'Test Card', 'Test Set', NOW());

-- Step 8: Verify the test inserts worked
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
  AND card_id = 'test-card-multiple'
ORDER BY created_at;

-- Step 9: Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-multiple';

-- Success! The card_collections table should now support multiple copies.
