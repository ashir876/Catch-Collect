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

      console.log('🔍 useCardPrices - fetching prices for cardIds:', cardIds);

      // Fetch prices from card_prices table using avg_sell_price
      const { data: prices, error } = await supabase
        .from('card_prices')
        .select('*')
        .in('card_id', cardIds);

      console.log('📊 card_prices query result:', { prices, error, dataLength: prices?.length });

      if (error) {
        console.error('❌ Error fetching card prices:', error);
        throw error;
      }

      if (!prices || prices.length === 0) {
        console.log('⚠️ No price data found in card_prices table');
        return [];
      }

      // Convert to CardPriceSummary format using avg_sell_price
      const priceSummaries: CardPriceSummary[] = prices.map((price: any) => {
        const summary: CardPriceSummary = {
          card_id: price.card_id,
          cardmarket_avg_sell_price: price.avg_sell_price, // Use avg_sell_price field
          tcgplayer_market_price: price.price, // Use price field as fallback
          last_updated: price.updated_at || new Date().toISOString()
        };
        console.log('🔄 Mapped price summary:', summary);
        return summary;
      });

      console.log('📋 Final price summaries:', priceSummaries);
      return priceSummaries;
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

      console.log('🔍 useCardPrice - fetching price for cardId:', cardId);

      const { data: prices, error } = await supabase
        .from('card_prices')
        .select('*')
        .eq('card_id', cardId);

      console.log('📊 card_prices query result:', { prices, error, dataLength: prices?.length });

      if (error) {
        console.error('❌ Error fetching card price:', error);
        throw error;
      }

      if (!prices || prices.length === 0) {
        console.log('⚠️ No price data found for card:', cardId);
        return null;
      }

      // If multiple rows, take the first one (or you could implement logic to pick the best one)
      const price = prices[0];

      const summary: CardPriceSummary = {
        card_id: cardId,
        cardmarket_avg_sell_price: price.avg_sell_price, // Use avg_sell_price field
        tcgplayer_market_price: price.price, // Use price field as fallback
        last_updated: price.updated_at || new Date().toISOString()
      };

      console.log('🔄 Single price summary:', summary);
      return summary;
    },
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
