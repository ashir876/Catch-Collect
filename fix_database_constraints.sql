-- Fix database constraints to allow multiple card instances
-- Run this in your Supabase SQL Editor

-- 1. Drop all unique constraints from card_collections table
DO $$
BEGIN
  -- Drop specific constraints if they exist
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_unique_instance' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_unique_instance;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_user_card_unique' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_user_card_unique;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_user_id_card_id_key' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_user_id_card_id_key;
  END IF;
  
  -- Drop any other unique constraints that might prevent multiple instances
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%card_collections%unique%' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT IF EXISTS card_collections_user_id_card_id_key;
  END IF;
END $$;

-- 2. Drop all unique constraints from card_wishlist table
DO $$
BEGIN
  -- Drop specific constraints if they exist
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_wishlist_unique_instance' 
    AND conrelid = 'public.card_wishlist'::regclass
  ) THEN
    ALTER TABLE public.card_wishlist DROP CONSTRAINT card_wishlist_unique_instance;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_wishlist_user_id_card_id_key' 
    AND conrelid = 'public.card_wishlist'::regclass
  ) THEN
    ALTER TABLE public.card_wishlist DROP CONSTRAINT card_wishlist_user_id_card_id_key;
  END IF;
  
  -- Drop any other unique constraints that might prevent multiple instances
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%card_wishlist%unique%' 
    AND conrelid = 'public.card_wishlist'::regclass
  ) THEN
    ALTER TABLE public.card_wishlist DROP CONSTRAINT IF EXISTS card_wishlist_user_id_card_id_key;
  END IF;
END $$;

-- 3. Verify the constraints are removed
SELECT 
  table_name, 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('card_collections', 'card_wishlist') 
  AND constraint_type = 'UNIQUE'
ORDER BY table_name, constraint_name;

-- 4. Test that we can insert multiple copies of the same card
-- (This will only work if you have a test user, otherwise it will fail due to RLS)
-- You can comment out this section if you don't want to test it
/*
INSERT INTO public.card_collections (user_id, card_id, condition, price, notes)
VALUES 
  ('your-user-id-here', 'test-card-1', 'Mint', 10.00, 'First copy'),
  ('your-user-id-here', 'test-card-1', 'Near Mint', 8.00, 'Second copy');
*/
