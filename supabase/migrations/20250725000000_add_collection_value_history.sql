-- Create collection_value_history table for tracking collection values over time
CREATE TABLE IF NOT EXISTS public.collection_value_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_user_date 
    UNIQUE(user_id, recorded_at::date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_value_history_user ON public.collection_value_history(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_value_history_date ON public.collection_value_history(recorded_at DESC);

-- Add RLS policies
ALTER TABLE public.collection_value_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own collection value history
CREATE POLICY "Users can view their own collection value history" 
  ON public.collection_value_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collection value history" 
  ON public.collection_value_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to get collection value history
CREATE OR REPLACE FUNCTION get_collection_value_history(
  p_user_id UUID,
  p_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  recorded_at TIMESTAMP WITH TIME ZONE,
  total_value DECIMAL,
  currency CHAR(3)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cvh.recorded_at,
    cvh.total_value,
    cvh.currency
  FROM public.collection_value_history cvh
  WHERE cvh.user_id = p_user_id
  AND cvh.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY cvh.recorded_at ASC;
END;
$$;

-- Function to calculate and store current collection value
CREATE OR REPLACE FUNCTION update_collection_value(
  p_user_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_value DECIMAL := 0;
  v_currency CHAR(3) := 'USD';
BEGIN
  -- Calculate total collection value based on current prices
  SELECT COALESCE(SUM(cp.price), 0)
  INTO v_total_value
  FROM public.card_collections cc
  LEFT JOIN public.current_prices cp ON cc.card_id = cp.card_id
  WHERE cc.user_id = p_user_id
  AND cp.source = 'tcgplayer' 
  AND cp.price_type = 'normal_market'
  AND cp.currency = 'USD';

  -- Insert or update today's collection value
  INSERT INTO public.collection_value_history (user_id, total_value, currency)
  VALUES (p_user_id, v_total_value, v_currency)
  ON CONFLICT (user_id, recorded_at::date) 
  DO UPDATE SET 
    total_value = EXCLUDED.total_value,
    currency = EXCLUDED.currency;

  RETURN v_total_value;
END;
$$;
