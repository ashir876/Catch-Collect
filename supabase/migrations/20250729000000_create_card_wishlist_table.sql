-- Create card_wishlist table
CREATE TABLE IF NOT EXISTS public.card_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  name TEXT,
  set_name TEXT,
  set_id TEXT,
  card_number TEXT,
  rarity TEXT,
  image_url TEXT,
  description TEXT,
  illustrator TEXT,
  hp INTEGER,
  types TEXT[],
  attacks JSONB,
  weaknesses JSONB,
  retreat INTEGER,
  condition TEXT DEFAULT 'Near Mint',
  price DECIMAL(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  priority INTEGER DEFAULT 1,
  acquired_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Remove the unique constraint entirely to allow multiple instances of the same card
-- Users should be able to add multiple copies of the same card with identical details
-- if they want to track multiple physical copies

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_wishlist_user_id ON public.card_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_card_wishlist_card_id ON public.card_wishlist(card_id);
CREATE INDEX IF NOT EXISTS idx_card_wishlist_user_card ON public.card_wishlist(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_card_wishlist_acquired_date ON public.card_wishlist(acquired_date);

-- Enable RLS
ALTER TABLE public.card_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wishlist items" 
  ON public.card_wishlist FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items" 
  ON public.card_wishlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items" 
  ON public.card_wishlist FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items" 
  ON public.card_wishlist FOR DELETE 
  USING (auth.uid() = user_id);

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_card_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_card_wishlist_updated_at ON public.card_wishlist;
CREATE TRIGGER update_card_wishlist_updated_at 
  BEFORE UPDATE ON public.card_wishlist 
  FOR EACH ROW 
  EXECUTE PROCEDURE update_card_wishlist_updated_at();
