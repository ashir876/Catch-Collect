-- Check and fix RLS policies that might be causing issues
-- Run this in your Supabase SQL Editor

-- Check current RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('card_collections', 'card_wishlist');

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('card_collections', 'card_wishlist');

-- Drop all existing policies and recreate them
DO $$
BEGIN
  -- Drop all policies from card_collections
  DROP POLICY IF EXISTS "Users can view their own collection items" ON public.card_collections;
  DROP POLICY IF EXISTS "Users can insert their own collection items" ON public.card_collections;
  DROP POLICY IF EXISTS "Users can update their own collection items" ON public.card_collections;
  DROP POLICY IF EXISTS "Users can delete their own collection items" ON public.card_collections;
  
  -- Drop all policies from card_wishlist
  DROP POLICY IF EXISTS "Users can view their own wishlist items" ON public.card_wishlist;
  DROP POLICY IF EXISTS "Users can insert their own wishlist items" ON public.card_wishlist;
  DROP POLICY IF EXISTS "Users can update their own wishlist items" ON public.card_wishlist;
  DROP POLICY IF EXISTS "Users can delete their own wishlist items" ON public.card_wishlist;
  
  RAISE NOTICE 'Dropped all existing policies';
END $$;

-- Recreate policies for card_collections
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

-- Recreate policies for card_wishlist
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

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('card_collections', 'card_wishlist')
ORDER BY tablename, policyname;
