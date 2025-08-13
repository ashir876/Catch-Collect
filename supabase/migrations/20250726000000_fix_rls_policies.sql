-- Fix RLS policies for card_wishlist and card_collections tables
-- These tables exist but don't have proper RLS policies, causing 406 errors

-- Enable RLS on card_wishlist table if not already enabled
ALTER TABLE public.card_wishlist ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for card_wishlist table
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

-- Enable RLS on card_collections table if not already enabled
ALTER TABLE public.card_collections ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for card_collections table
CREATE POLICY "Users can view their own collection items" 
  ON public.card_collections FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection items" 
  ON public.card_collections FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection items" 
  ON public.card_collections FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collection items" 
  ON public.card_collections FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_card_wishlist_user_id ON public.card_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_card_wishlist_card_id ON public.card_wishlist(card_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_user_id ON public.card_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_card_collections_card_id ON public.card_collections(card_id);
