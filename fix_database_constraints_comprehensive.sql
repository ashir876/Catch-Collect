-- Comprehensive fix for database constraints to allow multiple card instances
-- Run this in your Supabase SQL Editor

-- First, let's see what constraints currently exist
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

-- Now let's drop ALL possible unique constraints from card_collections table
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  -- Drop all unique constraints that might prevent multiple instances
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.card_collections'::regclass
      AND contype = 'u'  -- unique constraints
  LOOP
    EXECUTE 'ALTER TABLE public.card_collections DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Drop ALL possible unique constraints from card_wishlist table
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  -- Drop all unique constraints that might prevent multiple instances
  FOR constraint_record IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.card_wishlist'::regclass
      AND contype = 'u'  -- unique constraints
  LOOP
    EXECUTE 'ALTER TABLE public.card_wishlist DROP CONSTRAINT IF EXISTS ' || constraint_record.conname;
    RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
  END LOOP;
END $$;

-- Also check for any indexes that might be enforcing uniqueness
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('card_collections', 'card_wishlist')
  AND indexdef LIKE '%UNIQUE%';

-- Drop any unique indexes that might be causing issues
DO $$
DECLARE
  index_record RECORD;
BEGIN
  FOR index_record IN 
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename IN ('card_collections', 'card_wishlist')
      AND indexdef LIKE '%UNIQUE%'
      AND indexname NOT LIKE '%_pkey'  -- Don't drop primary keys
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname;
    RAISE NOTICE 'Dropped unique index: %', index_record.indexname;
  END LOOP;
END $$;

-- Verify all constraints are removed
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

-- Show the final table structure
\d card_collections;
\d card_wishlist;

-- Test insert (optional - only if you want to test)
-- Replace 'your-user-id-here' with your actual user ID
/*
INSERT INTO public.card_collections (user_id, card_id, condition, price, notes)
VALUES 
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Mint', 10.00, 'First copy'),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Near Mint', 8.00, 'Second copy');
*/
