-- Examine the exact structure of card_collections table
-- Run this first to understand what we're working with

-- 1. Check table columns and their properties
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_name = 'card_collections' 
ORDER BY ordinal_position;

-- 2. Check current constraints
SELECT 
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

-- 3. Check for any indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'card_collections'
ORDER BY indexname;

-- 4. Check current data sample
SELECT 
  *
FROM public.card_collections 
LIMIT 3;

-- 5. Check if there are any sequences
SELECT 
  sequence_name,
  data_type,
  start_value,
  minimum_value,
  maximum_value,
  increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
  AND sequence_name LIKE '%card_collections%';
