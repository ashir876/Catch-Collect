// Simple script to populate test price data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

const samplePrices = [
  // Base Set Charizard
  { card_id: 'base1-4', source: 'tcgplayer', price_type: 'normal_market', price: 299.99, currency: 'USD' },
  { card_id: 'base1-4', source: 'tcgplayer', price_type: 'normal_low', price: 250.00, currency: 'USD' },
  { card_id: 'base1-4', source: 'tcgplayer', price_type: 'normal_high', price: 350.00, currency: 'USD' },
  { card_id: 'base1-4', source: 'cardmarket', price_type: 'averageSellPrice', price: 275.00, currency: 'EUR' },
  { card_id: 'base1-4', source: 'cardmarket', price_type: 'lowPrice', price: 220.00, currency: 'EUR' },
  { card_id: 'base1-4', source: 'cardmarket', price_type: 'trendPrice', price: 280.00, currency: 'EUR' },

  // Base Set Blastoise
  { card_id: 'base1-2', source: 'tcgplayer', price_type: 'normal_market', price: 89.99, currency: 'USD' },
  { card_id: 'base1-2', source: 'tcgplayer', price_type: 'normal_low', price: 75.00, currency: 'USD' },
  { card_id: 'base1-2', source: 'tcgplayer', price_type: 'normal_high', price: 110.00, currency: 'USD' },
  { card_id: 'base1-2', source: 'cardmarket', price_type: 'averageSellPrice', price: 82.50, currency: 'EUR' },
  { card_id: 'base1-2', source: 'cardmarket', price_type: 'lowPrice', price: 65.00, currency: 'EUR' },
  { card_id: 'base1-2', source: 'cardmarket', price_type: 'trendPrice', price: 85.00, currency: 'EUR' },

  // Base Set Venusaur
  { card_id: 'base1-15', source: 'tcgplayer', price_type: 'normal_market', price: 45.99, currency: 'USD' },
  { card_id: 'base1-15', source: 'tcgplayer', price_type: 'normal_low', price: 35.00, currency: 'USD' },
  { card_id: 'base1-15', source: 'tcgplayer', price_type: 'normal_high', price: 60.00, currency: 'USD' },
  { card_id: 'base1-15', source: 'cardmarket', price_type: 'averageSellPrice', price: 42.00, currency: 'EUR' },
  { card_id: 'base1-15', source: 'cardmarket', price_type: 'lowPrice', price: 32.00, currency: 'EUR' },
  { card_id: 'base1-15', source: 'cardmarket', price_type: 'trendPrice', price: 45.00, currency: 'EUR' },

  // Base Set Pikachu
  { card_id: 'base1-58', source: 'tcgplayer', price_type: 'normal_market', price: 12.99, currency: 'USD' },
  { card_id: 'base1-58', source: 'tcgplayer', price_type: 'normal_low', price: 8.00, currency: 'USD' },
  { card_id: 'base1-58', source: 'tcgplayer', price_type: 'normal_high', price: 20.00, currency: 'USD' },
  { card_id: 'base1-58', source: 'cardmarket', price_type: 'averageSellPrice', price: 11.50, currency: 'EUR' },
  { card_id: 'base1-58', source: 'cardmarket', price_type: 'lowPrice', price: 7.00, currency: 'EUR' },
  { card_id: 'base1-58', source: 'cardmarket', price_type: 'trendPrice', price: 13.00, currency: 'EUR' },

  // Base Set Mewtwo
  { card_id: 'base1-10', source: 'tcgplayer', price_type: 'normal_market', price: 25.99, currency: 'USD' },
  { card_id: 'base1-10', source: 'tcgplayer', price_type: 'normal_low', price: 20.00, currency: 'USD' },
  { card_id: 'base1-10', source: 'tcgplayer', price_type: 'normal_high', price: 35.00, currency: 'USD' },
  { card_id: 'base1-10', source: 'cardmarket', price_type: 'averageSellPrice', price: 23.50, currency: 'EUR' },
  { card_id: 'base1-10', source: 'cardmarket', price_type: 'lowPrice', price: 18.00, currency: 'EUR' },
  { card_id: 'base1-10', source: 'cardmarket', price_type: 'trendPrice', price: 26.00, currency: 'EUR' },
];

async function populatePrices() {
  try {
    console.log('Inserting sample price data...');
    
    const { data, error } = await supabase
      .from('price_history')
      .insert(samplePrices);

    if (error) {
      console.error('Error inserting prices:', error);
    } else {
      console.log('Successfully inserted', samplePrices.length, 'price records');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

populatePrices();
