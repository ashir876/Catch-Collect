-- Add price and notes columns to card_wishlist table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.card_wishlist 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Update existing records to have default values
UPDATE public.card_wishlist 
SET price = 0, notes = '' 
WHERE price IS NULL OR notes IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'card_wishlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;
