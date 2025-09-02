-- Fix the id column issue in card_collections table
-- Based on the actual table structure we can see

-- Step 1: Check current constraints to see what's causing the 409 error
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'card_collections'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 2: Check if there's a sequence for the id column
SELECT 
  sequence_name,
  data_type
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
  AND sequence_name LIKE '%card_collections%';

-- Step 3: Create a sequence if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS card_collections_id_seq;

-- Step 4: Populate the id column with sequential values
UPDATE public.card_collections 
SET id = nextval('card_collections_id_seq')
WHERE id IS NULL;

-- Step 5: Make id column NOT NULL
ALTER TABLE public.card_collections 
ALTER COLUMN id SET NOT NULL;

-- Step 6: Set the default value for future inserts
ALTER TABLE public.card_collections 
ALTER COLUMN id SET DEFAULT nextval('card_collections_id_seq');

-- Step 7: Check if there's a composite primary key and remove it
-- (This is likely what's causing the 409 error)
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find the composite primary key constraint
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'card_collections'
    AND tc.constraint_type = 'PRIMARY KEY'
    AND kcu.column_name IN ('user_id', 'card_id', 'language');
  
  -- Drop it if found
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.card_collections DROP CONSTRAINT ' || constraint_name;
    RAISE NOTICE 'Dropped composite primary key constraint: %', constraint_name;
  ELSE
    RAISE NOTICE 'No composite primary key found';
  END IF;
END $$;

-- Step 8: Add a simple primary key on the id column
ALTER TABLE public.card_collections 
ADD CONSTRAINT card_collections_pkey PRIMARY KEY (id);

-- Step 9: Verify the fix worked
SELECT 
  id,
  user_id,
  card_id,
  language,
  name
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea'
ORDER BY id
LIMIT 5;

-- Step 10: Test inserting a duplicate card (this should now work)
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
  ('ccc66efd-7577-4a60-ab05-25f374a9eeea', 'swsh5-57', 'Near Mint', 8.00, 'Second copy test', 'en', 'Baltoy', 'Battle Styles', NOW());

-- Step 11: Verify the duplicate was added
SELECT 
  id,
  user_id,
  card_id,
  language,
  name,
  condition,
  price
FROM public.card_collections 
WHERE user_id = 'ccc66efd-7577-4a60-ab05-25f374a9eeea' 
  AND card_id = 'swsh5-57'
ORDER BY id;
