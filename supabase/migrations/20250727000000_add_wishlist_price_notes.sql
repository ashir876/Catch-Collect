-- Add price and notes columns to card_wishlist table
ALTER TABLE public.card_wishlist 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Update existing records to have default values
UPDATE public.card_wishlist 
SET price = 0, notes = '' 
WHERE price IS NULL OR notes IS NULL;
