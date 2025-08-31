-- Remove unique constraints that prevent multiple instances of the same card

-- Remove unique constraint from card_collections table
DO $$
BEGIN
  -- Drop the unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_collections_unique_instance' 
    AND conrelid = 'public.card_collections'::regclass
  ) THEN
    ALTER TABLE public.card_collections DROP CONSTRAINT card_collections_unique_instance;
  END IF;
END $$;

-- Remove unique constraint from card_wishlist table
DO $$
BEGIN
  -- Drop the unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'card_wishlist_unique_instance' 
    AND conrelid = 'public.card_wishlist'::regclass
  ) THEN
    ALTER TABLE public.card_wishlist DROP CONSTRAINT card_wishlist_unique_instance;
  END IF;
END $$;
