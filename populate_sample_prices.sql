-- Sample price data for testing
-- This script populates the price_history table with sample data for testing

-- Insert sample TCGPlayer prices (USD)
INSERT INTO public.price_history (card_id, source, price_type, price, currency, recorded_at) VALUES
-- Base Set Charizard
('base1-4', 'tcgplayer', 'normal_market', 299.99, 'USD', NOW()),
('base1-4', 'tcgplayer', 'normal_low', 250.00, 'USD', NOW()),
('base1-4', 'tcgplayer', 'normal_high', 350.00, 'USD', NOW()),

-- Base Set Blastoise
('base1-2', 'tcgplayer', 'normal_market', 89.99, 'USD', NOW()),
('base1-2', 'tcgplayer', 'normal_low', 75.00, 'USD', NOW()),
('base1-2', 'tcgplayer', 'normal_high', 110.00, 'USD', NOW()),

-- Base Set Venusaur
('base1-15', 'tcgplayer', 'normal_market', 45.99, 'USD', NOW()),
('base1-15', 'tcgplayer', 'normal_low', 35.00, 'USD', NOW()),
('base1-15', 'tcgplayer', 'normal_high', 60.00, 'USD', NOW()),

-- Base Set Pikachu
('base1-58', 'tcgplayer', 'normal_market', 12.99, 'USD', NOW()),
('base1-58', 'tcgplayer', 'normal_low', 8.00, 'USD', NOW()),
('base1-58', 'tcgplayer', 'normal_high', 20.00, 'USD', NOW()),

-- Base Set Mewtwo
('base1-10', 'tcgplayer', 'normal_market', 25.99, 'USD', NOW()),
('base1-10', 'tcgplayer', 'normal_low', 20.00, 'USD', NOW()),
('base1-10', 'tcgplayer', 'normal_high', 35.00, 'USD', NOW());

-- Insert sample CardMarket prices (EUR)
INSERT INTO public.price_history (card_id, source, price_type, price, currency, recorded_at) VALUES
-- Base Set Charizard
('base1-4', 'cardmarket', 'averageSellPrice', 275.00, 'EUR', NOW()),
('base1-4', 'cardmarket', 'lowPrice', 220.00, 'EUR', NOW()),
('base1-4', 'cardmarket', 'trendPrice', 280.00, 'EUR', NOW()),

-- Base Set Blastoise
('base1-2', 'cardmarket', 'averageSellPrice', 82.50, 'EUR', NOW()),
('base1-2', 'cardmarket', 'lowPrice', 65.00, 'EUR', NOW()),
('base1-2', 'cardmarket', 'trendPrice', 85.00, 'EUR', NOW()),

-- Base Set Venusaur
('base1-15', 'cardmarket', 'averageSellPrice', 42.00, 'EUR', NOW()),
('base1-15', 'cardmarket', 'lowPrice', 32.00, 'EUR', NOW()),
('base1-15', 'cardmarket', 'trendPrice', 45.00, 'EUR', NOW()),

-- Base Set Pikachu
('base1-58', 'cardmarket', 'averageSellPrice', 11.50, 'EUR', NOW()),
('base1-58', 'cardmarket', 'lowPrice', 7.00, 'EUR', NOW()),
('base1-58', 'cardmarket', 'trendPrice', 13.00, 'EUR', NOW()),

-- Base Set Mewtwo
('base1-10', 'cardmarket', 'averageSellPrice', 23.50, 'EUR', NOW()),
('base1-10', 'cardmarket', 'lowPrice', 18.00, 'EUR', NOW()),
('base1-10', 'cardmarket', 'trendPrice', 26.00, 'EUR', NOW());

-- Insert some additional cards with different price ranges
INSERT INTO public.price_history (card_id, source, price_type, price, currency, recorded_at) VALUES
-- Common cards
('base1-1', 'tcgplayer', 'normal_market', 2.99, 'USD', NOW()),
('base1-1', 'cardmarket', 'averageSellPrice', 2.50, 'EUR', NOW()),
('base1-3', 'tcgplayer', 'normal_market', 1.99, 'USD', NOW()),
('base1-3', 'cardmarket', 'averageSellPrice', 1.75, 'EUR', NOW()),

-- Uncommon cards
('base1-5', 'tcgplayer', 'normal_market', 4.99, 'USD', NOW()),
('base1-5', 'cardmarket', 'averageSellPrice', 4.25, 'EUR', NOW()),
('base1-6', 'tcgplayer', 'normal_market', 3.99, 'USD', NOW()),
('base1-6', 'cardmarket', 'averageSellPrice', 3.50, 'EUR', NOW()),

-- Rare cards
('base1-7', 'tcgplayer', 'normal_market', 15.99, 'USD', NOW()),
('base1-7', 'cardmarket', 'averageSellPrice', 14.50, 'EUR', NOW()),
('base1-8', 'tcgplayer', 'normal_market', 12.99, 'USD', NOW()),
('base1-8', 'cardmarket', 'averageSellPrice', 11.75, 'EUR', NOW());

-- Verify the data was inserted
SELECT 
  card_id,
  source,
  price_type,
  price,
  currency,
  recorded_at
FROM public.price_history
ORDER BY card_id, source, price_type;
