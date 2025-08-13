-- Create price_history table for storing Pokemon card pricing data
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('tcgplayer', 'cardmarket')),
  price_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_card_source_type_time 
    UNIQUE(card_id, source, price_type, recorded_at)
);

-- Create view for current prices
CREATE OR REPLACE VIEW public.current_prices AS
SELECT DISTINCT ON (card_id, source, price_type)
  card_id, source, price_type, price, currency, recorded_at
FROM public.price_history
ORDER BY card_id, source, price_type, recorded_at DESC;

-- Create view for price trends (last 30 days)
CREATE OR REPLACE VIEW public.price_trends AS
SELECT 
  card_id,
  source,
  price_type,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  COUNT(*) as data_points,
  recorded_at as latest_update
FROM public.price_history
WHERE recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY card_id, source, price_type, recorded_at;

-- Add RLS policies
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Price history policies (read-only for all users, insert/update for authenticated users)
CREATE POLICY "Anyone can view price history" ON public.price_history FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert price history" ON public.price_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update price history" ON public.price_history FOR UPDATE USING (auth.role() = 'authenticated');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_price_history_card_source ON public.price_history(card_id, source);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON public.price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_source_type ON public.price_history(source, price_type);

-- Function for manual price updates
CREATE OR REPLACE FUNCTION update_card_price_manual(
  p_card_id TEXT,
  p_source TEXT,
  p_price_type TEXT,
  p_price DECIMAL,
  p_currency CHAR(3) DEFAULT 'USD'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.price_history (card_id, source, price_type, price, currency)
  VALUES (p_card_id, p_source, p_price_type, p_price, p_currency)
  ON CONFLICT (card_id, source, price_type, recorded_at) 
  DO UPDATE SET 
    price = EXCLUDED.price,
    currency = EXCLUDED.currency;
    
  -- Optional: Trigger for price changes
  IF p_price_type = 'market' THEN
    PERFORM pg_notify('price_update', json_build_object(
      'card_id', p_card_id,
      'price', p_price,
      'source', p_source
    )::text);
  END IF;
END;
$$;

-- Function to get collection value summary
CREATE OR REPLACE FUNCTION get_collection_value_summary(
  p_user_id UUID,
  p_language TEXT DEFAULT 'DE'
)
RETURNS TABLE (
  total_cards INTEGER,
  total_value_usd DECIMAL,
  total_value_eur DECIMAL,
  value_change_30d_usd DECIMAL,
  value_change_30d_eur DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH collection_cards AS (
    SELECT DISTINCT cc.card_id
    FROM public.card_collections cc
    WHERE cc.user_id = p_user_id
  ),
  current_prices_usd AS (
    SELECT 
      cp.card_id,
      cp.price as usd_price
    FROM public.current_prices cp
    WHERE cp.source = 'tcgplayer' 
    AND cp.price_type = 'normal_market'
    AND cp.currency = 'USD'
  ),
  current_prices_eur AS (
    SELECT 
      cp.card_id,
      cp.price as eur_price
    FROM public.current_prices cp
    WHERE cp.source = 'cardmarket' 
    AND cp.price_type = 'averageSellPrice'
    AND cp.currency = 'EUR'
  ),
  price_changes AS (
    SELECT 
      pt.card_id,
      pt.avg_price as avg_price_30d
    FROM public.price_trends pt
    WHERE pt.source = 'tcgplayer' 
    AND pt.price_type = 'normal_market'
  )
  SELECT 
    COUNT(cc.card_id)::INTEGER as total_cards,
    COALESCE(SUM(cpu.usd_price), 0) as total_value_usd,
    COALESCE(SUM(cpe.eur_price), 0) as total_value_eur,
    COALESCE(SUM(cpu.usd_price - pc.avg_price_30d), 0) as value_change_30d_usd,
    COALESCE(SUM(cpe.eur_price - pc.avg_price_30d), 0) as value_change_30d_eur
  FROM collection_cards cc
  LEFT JOIN current_prices_usd cpu ON cc.card_id = cpu.card_id
  LEFT JOIN current_prices_eur cpe ON cc.card_id = cpe.card_id
  LEFT JOIN price_changes pc ON cc.card_id = pc.card_id;
END;
$$;

-- Function to get price history for a specific card
CREATE OR REPLACE FUNCTION get_card_price_history(
  p_card_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  recorded_at TIMESTAMP WITH TIME ZONE,
  source TEXT,
  price_type TEXT,
  price DECIMAL,
  currency CHAR(3)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ph.recorded_at,
    ph.source,
    ph.price_type,
    ph.price,
    ph.currency
  FROM public.price_history ph
  WHERE ph.card_id = p_card_id
  AND ph.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY ph.recorded_at DESC;
END;
$$;

-- Function to get dashboard view for current prices with card details
CREATE OR REPLACE FUNCTION get_dashboard_prices(
  p_source TEXT DEFAULT 'tcgplayer',
  p_price_type TEXT DEFAULT 'normal_market',
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  card_id TEXT,
  card_name TEXT,
  set_name TEXT,
  card_number TEXT,
  image_url TEXT,
  price DECIMAL,
  currency CHAR(3),
  recorded_at TIMESTAMP WITH TIME ZONE,
  price_change_7d DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH current_prices_filtered AS (
    SELECT 
      cp.card_id,
      cp.price,
      cp.currency,
      cp.recorded_at
    FROM public.current_prices cp
    WHERE cp.source = p_source 
    AND cp.price_type = p_price_type
  ),
  price_changes AS (
    SELECT 
      ph.card_id,
      (cp.price - AVG(ph.price)) as price_change_7d
    FROM current_prices_filtered cp
    JOIN public.price_history ph ON cp.card_id = ph.card_id
    WHERE ph.source = p_source 
    AND ph.price_type = p_price_type
    AND ph.recorded_at >= NOW() - INTERVAL '7 days'
    GROUP BY ph.card_id, cp.price
  )
  SELECT 
    cp.card_id,
    pk.name as card_name,
    s.name as set_name,
    pk.card_number,
    pk.image_url,
    cp.price,
    cp.currency,
    cp.recorded_at,
    COALESCE(pc.price_change_7d, 0) as price_change_7d
  FROM current_prices_filtered cp
  LEFT JOIN public.pokemonkarten pk ON cp.card_id = pk.id
  LEFT JOIN public.sets s ON pk.set_id = s.id
  LEFT JOIN price_changes pc ON cp.card_id = pc.card_id
  ORDER BY cp.price DESC
  LIMIT p_limit;
END;
$$;
