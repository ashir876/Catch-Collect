-- Create index for faster price lookups
-- Note: Adjust column names based on your actual card_prices table schema
CREATE INDEX IF NOT EXISTS idx_prices_card_lang_date
  ON card_prices (card_id, language, date_recorded DESC NULLS LAST, updated_at DESC NULLS LAST, id DESC);

-- Create view for latest prices per (card_id, language) combination
-- This view uses DISTINCT ON to get the most recent price record for each card+language
-- Order by download_id (if it exists and can be parsed), then date_recorded, then updated_at
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (card_id, language)
       id, 
       card_id, 
       language, 
       avg_sell_price as price, 
       download_id, 
       date_recorded,
       updated_at
FROM card_prices
ORDER BY 
  card_id, 
  language, 
  -- Order by date_recorded first (most recent first), then updated_at, then id
  date_recorded DESC NULLS LAST, 
  updated_at DESC NULLS LAST, 
  id DESC;

-- Grant access to the view
GRANT SELECT ON latest_prices TO anon;
GRANT SELECT ON latest_prices TO authenticated;

-- Add comment to the view
COMMENT ON VIEW latest_prices IS 'Latest price record for each (card_id, language) combination, ordered by downloaded_at, date_recorded, and id';

