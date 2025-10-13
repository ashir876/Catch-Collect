import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CardPrice {
  card_id: string;
  source: 'tcgplayer' | 'cardmarket';
  price_type: string;
  price: number;
  currency: string;
  recorded_at: string;
}

export interface CardPriceSummary {
  card_id: string;
  tcgplayer_market_price?: number;
  tcgplayer_low_price?: number;
  tcgplayer_high_price?: number;
  cardmarket_avg_sell_price?: number;
  cardmarket_low_price?: number;
  cardmarket_trend_price?: number;
  last_updated?: string;
}

export const useCardPrices = (cardIds: string[]) => {
  return useQuery({
    queryKey: ['card-prices', cardIds],
    queryFn: async (): Promise<CardPriceSummary[]> => {
      if (cardIds.length === 0) return [];

      // Fetch current prices for all cards
      const { data: prices, error } = await supabase
        .from('current_prices')
        .select('*')
        .in('card_id', cardIds);

      if (error) {
        console.error('Error fetching card prices:', error);
        throw error;
      }

      // Group prices by card_id and create summary
      const priceMap = new Map<string, CardPriceSummary>();

      prices?.forEach((price: CardPrice) => {
        const cardId = price.card_id;
        
        if (!priceMap.has(cardId)) {
          priceMap.set(cardId, { card_id: cardId });
        }

        const summary = priceMap.get(cardId)!;

        // TCGPlayer prices (USD)
        if (price.source === 'tcgplayer') {
          if (price.price_type === 'normal_market') {
            summary.tcgplayer_market_price = price.price;
          } else if (price.price_type === 'normal_low') {
            summary.tcgplayer_low_price = price.price;
          } else if (price.price_type === 'normal_high') {
            summary.tcgplayer_high_price = price.price;
          }
        }

        // CardMarket prices (EUR)
        if (price.source === 'cardmarket') {
          if (price.price_type === 'averageSellPrice') {
            summary.cardmarket_avg_sell_price = price.price;
          } else if (price.price_type === 'lowPrice') {
            summary.cardmarket_low_price = price.price;
          } else if (price.price_type === 'trendPrice') {
            summary.cardmarket_trend_price = price.price;
          }
        }

        // Update last updated timestamp
        if (!summary.last_updated || new Date(price.recorded_at) > new Date(summary.last_updated)) {
          summary.last_updated = price.recorded_at;
        }
      });

      return Array.from(priceMap.values());
    },
    enabled: cardIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCardPrice = (cardId: string) => {
  return useQuery({
    queryKey: ['card-price', cardId],
    queryFn: async (): Promise<CardPriceSummary | null> => {
      if (!cardId) return null;

      const { data: prices, error } = await supabase
        .from('current_prices')
        .select('*')
        .eq('card_id', cardId);

      if (error) {
        console.error('Error fetching card price:', error);
        throw error;
      }

      if (!prices || prices.length === 0) return null;

      const summary: CardPriceSummary = { card_id: cardId };

      prices.forEach((price: CardPrice) => {
        // TCGPlayer prices (USD)
        if (price.source === 'tcgplayer') {
          if (price.price_type === 'normal_market') {
            summary.tcgplayer_market_price = price.price;
          } else if (price.price_type === 'normal_low') {
            summary.tcgplayer_low_price = price.price;
          } else if (price.price_type === 'normal_high') {
            summary.tcgplayer_high_price = price.price;
          }
        }

        // CardMarket prices (EUR)
        if (price.source === 'cardmarket') {
          if (price.price_type === 'averageSellPrice') {
            summary.cardmarket_avg_sell_price = price.price;
          } else if (price.price_type === 'lowPrice') {
            summary.cardmarket_low_price = price.price;
          } else if (price.price_type === 'trendPrice') {
            summary.cardmarket_trend_price = price.price;
          }
        }

        // Update last updated timestamp
        if (!summary.last_updated || new Date(price.recorded_at) > new Date(summary.last_updated)) {
          summary.last_updated = price.recorded_at;
        }
      });

      return summary;
    },
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
