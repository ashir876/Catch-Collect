-- Test script to verify database constraints are removed
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
  AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.table_name, tc.constraint_name;

-- Test inserting multiple copies of the same card
-- Replace 'your-user-id-here' with your actual user ID: ccc66efd-7577-4a60-ab05-25f374a9eeea

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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Mint', 10.00, 'First copy', 'en', 'Test Card', 'Test Set', NOW()),
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'test-card-1', 'Near Mint', 8.00, 'Second copy', 'en', 'Test Card', 'Test Set', NOW());

-- Check if the inserts worked
SELECT 
  COUNT(*) as total_copies, 
  card_id,
  condition,
  price,
  notes
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1'
GROUP BY card_id, condition, price, notes
ORDER BY condition;

-- Show all test entries
SELECT 
  id,
  card_id,
  condition,
  price,
  notes,
  created_at
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1'
ORDER BY created_at;

-- Clean up test data
DELETE FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'test-card-1';
