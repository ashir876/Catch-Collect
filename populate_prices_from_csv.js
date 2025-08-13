/*
  Usage:
    1. npm install @supabase/supabase-js node-fetch csv-parse
    2. node populate_prices_from_csv.js
  This script reads card_id from dist/cards_rows.csv, fetches price data from PokemonTCG.io, and inserts it into the price_history table in Supabase.
  WARNING: Rotate your Supabase service role key after use!
*/

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import { parse } from 'csv-parse';

// === CONFIGURATION ===
const SUPABASE_URL = 'https://gezhdauazitnymbtmlat.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlemhkYXVheml0bnltYnRtbGF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzk1NjA4MiwiZXhwIjoyMDU5NTMyMDgyfQ.XJr-vBN04XzAcHg09sv53YIgkp6GkvehuMdACNUw1uE';
const POKEMON_API_KEY = '2d705f0e-00c5-426d-9846-af7d695e5000';
const CSV_PATH = 'dist/cards_rows.csv';
const BATCH_SIZE = 25; // Number of cards to process per batch
const RATE_LIMIT_DELAY = 2000; // ms to wait between batches (2 seconds)

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const cards = [];

  // Read and parse the CSV
  const parser = fs.createReadStream(CSV_PATH).pipe(parse({ columns: true }));
  for await (const record of parser) {
    if (record.card_id) {
      cards.push({ card_id: record.card_id, id: record.id });
    }
  }

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (card) => {
      try {
        const res = await fetch(`https://api.pokemontcg.io/v2/cards/${card.card_id}`, {
          headers: { 'X-Api-Key': POKEMON_API_KEY }
        });
        if (!res.ok) {
          console.error(`Failed to fetch ${card.card_id}: ${res.status}`);
          return;
        }
        const data = await res.json();
        const cardData = data.data;

        const priceInserts = [];

        // TCGPlayer prices (USD)
        if (cardData.tcgplayer && cardData.tcgplayer.prices) {
          for (const [variant, prices] of Object.entries(cardData.tcgplayer.prices)) {
            if (prices && typeof prices === 'object') {
              for (const [priceType, value] of Object.entries(prices)) {
                if (typeof value === 'number') {
                  priceInserts.push({
                    card_id: card.card_id, // or card.id if you use your internal id
                    source: 'tcgplayer',
                    price_type: `${variant}_${priceType}`,
                    price: value,
                    currency: 'USD',
                    recorded_at: new Date().toISOString()
                  });
                }
              }
            }
          }
        }

        // CardMarket prices (EUR)
        if (cardData.cardmarket && cardData.cardmarket.prices) {
          const cmPrices = cardData.cardmarket.prices;
          const priceFields = ['averageSellPrice', 'lowPrice', 'trendPrice'];
          priceFields.forEach(field => {
            if (cmPrices[field]) {
              priceInserts.push({
                card_id: card.card_id, // or card.id if you use your internal id
                source: 'cardmarket',
                price_type: field,
                price: cmPrices[field],
                currency: 'EUR',
                recorded_at: new Date().toISOString()
              });
            }
          });
        }

        if (priceInserts.length > 0) {
          const { error } = await supabase.from('price_history').insert(priceInserts);
          if (error) {
            console.error(`Error inserting prices for ${card.card_id}:`, error);
          } else {
            console.log(`Inserted ${priceInserts.length} prices for ${card.card_id}`);
          }
        }
      } catch (err) {
        console.error(`Error processing ${card.card_id}:`, err);
      }
    }));
    if (i + BATCH_SIZE < cards.length) {
      console.log(`Processed ${i + BATCH_SIZE} cards, waiting to respect rate limits...`);
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  console.log('Done!');
}

main();
