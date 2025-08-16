-- Fix for missing price and notes columns in card_wishlist table
-- Run this in your Supabase SQL Editor

-- Add the missing columns
ALTER TABLE public.card_wishlist 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Update any existing records to have default values
UPDATE public.card_wishlist 
SET price = 0.00, notes = '' 
WHERE price IS NULL OR notes IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'card_wishlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;
