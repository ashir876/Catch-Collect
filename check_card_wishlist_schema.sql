-- Check and fix card_wishlist table schema
-- This script will ensure the card_wishlist table has all necessary columns

-- First, let's check what columns currently exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'card_wishlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if set_id column exists and has data
SELECT 
  COUNT(*) as total_wishlist_items,
  COUNT(set_id) as items_with_set_id,
  COUNT(*) - COUNT(set_id) as items_without_set_id
FROM card_wishlist;

-- If set_id column is missing or has NULL values, we need to add it
-- Add set_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'card_wishlist' 
        AND column_name = 'set_id'
    ) THEN
        ALTER TABLE card_wishlist ADD COLUMN set_id TEXT;
        RAISE NOTICE 'Added set_id column to card_wishlist table';
    ELSE
        RAISE NOTICE 'set_id column already exists in card_wishlist table';
    END IF;
END $$;

-- Update existing wishlist items to have set_id from the cards table
UPDATE card_wishlist 
SET set_id = cards.set_id
FROM cards 
WHERE card_wishlist.card_id = cards.card_id 
AND card_wishlist.set_id IS NULL;

-- Check the results
SELECT 
  COUNT(*) as total_wishlist_items,
  COUNT(set_id) as items_with_set_id,
  COUNT(*) - COUNT(set_id) as items_without_set_id
FROM card_wishlist;
