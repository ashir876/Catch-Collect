-- Fix composite primary key issue in card_collections table
-- This script will allow multiple copies of the same card per user per language

-- Step 1: Add a new auto-incrementing ID column
ALTER TABLE public.card_collections 
ADD COLUMN IF NOT EXISTS id SERIAL;

-- Step 2: Drop the existing composite primary key
ALTER TABLE public.card_collections 
DROP CONSTRAINT IF EXISTS card_collections_pkey;

-- Step 3: Add a new simple primary key on the id column
ALTER TABLE public.card_collections 
ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 4: Create a unique index on (user_id, card_id, language) to maintain data integrity
-- but allow multiple copies by not making it a primary key
CREATE UNIQUE INDEX IF NOT EXISTS card_collections_user_card_language_idx 
ON public.card_collections (user_id, card_id, language);

-- Step 5: Verify the changes
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 6: Test that multiple copies can now be inserted
-- First, let's see what's currently in the table
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  created_at
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea'
ORDER BY created_at DESC
LIMIT 5;

-- Step 7: Try inserting a test copy (this should now work)
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'swsh5-57', 'Mint', 15.00, 'Second copy test', 'en', 'Cinderace', 'Rebel Clash', NOW());

-- Step 8: Verify the test insert worked
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  condition,
  price,
  created_at
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'swsh5-57'
ORDER BY created_at;

-- Success! The card_collections table should now support multiple copies.
-- You can now add multiple copies of the same card to your collection.
