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

export const useCardPrices = (cardIds: string[], language?: string) => {
  return useQuery({
    queryKey: ['card-prices', cardIds, language],
    queryFn: async (): Promise<CardPriceSummary[]> => {
      if (cardIds.length === 0) return [];

      console.log('🔍 useCardPrices - fetching prices for cardIds:', cardIds, 'language:', language);

      // Fetch prices from card_prices table
      // Group by (card_id, language) and get the latest for each combination
      let query = supabase
        .from('card_prices' as any)
        .select('*')
        .in('card_id', cardIds);
      
      if (language) {
        query = query.eq('language', language);
      }

      // Order by updated_at to get recent records first
      // We'll handle download_id comparison client-side
      const { data: prices, error } = await query
        .order('updated_at', { ascending: false, nullsFirst: false });

      console.log('📊 card_prices query result:', { prices, error, dataLength: prices?.length });

      if (error) {
        console.error('❌ Error fetching card prices:', error);
        throw error;
      }

      if (!prices || prices.length === 0) {
        console.log('⚠️ No price data found in card_prices table');
        return [];
      }

      // Helper function to parse download_id and convert to comparable format
      const parseDownloadId = (downloadId: string): number => {
        if (!downloadId) return 0;
        const parts = downloadId.split('/').map(Number);
        if (parts.length >= 3) {
          return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0) + (parts[3] || 0) * 0.01;
        }
        return 0;
      };

      // Group by (card_id, language) and keep only the latest for each combination
      const priceMap = new Map<string, any>();
      (prices as any[]).forEach((price: any) => {
        const key = `${price.card_id}-${price.language || 'en'}`;
        const existing = priceMap.get(key);
        
        if (!existing) {
          priceMap.set(key, price);
        } else {
          // Compare to find the latest
          const currentDownloadIdValue = parseDownloadId(price.download_id || '');
          const existingDownloadIdValue = parseDownloadId(existing.download_id || '');
          
          if (currentDownloadIdValue > existingDownloadIdValue) {
            priceMap.set(key, price);
          } else if (currentDownloadIdValue === 0 && existingDownloadIdValue === 0) {
            // Compare by date_recorded if no download_id
            if (price.date_recorded && existing.date_recorded) {
              const currentDate = new Date(price.date_recorded).getTime();
              const existingDate = new Date(existing.date_recorded).getTime();
              if (currentDate > existingDate) {
                priceMap.set(key, price);
              }
            } else if (price.date_recorded && !existing.date_recorded) {
              priceMap.set(key, price);
            }
          }
        }
      });

      // Convert to CardPriceSummary format using ONLY avg_sell_price
      const priceSummaries: CardPriceSummary[] = Array.from(priceMap.values()).map((price: any) => {
        const summary: CardPriceSummary = {
          card_id: price.card_id,
          cardmarket_avg_sell_price: price.avg_sell_price, // Use ONLY avg_sell_price field
          // Remove tcgplayer_market_price to avoid confusion
          last_updated: price.updated_at || price.date_recorded || new Date().toISOString()
        };
        console.log('🔄 Mapped price summary:', summary);
        return summary;
      });

      console.log('📋 Final price summaries:', priceSummaries);
      return priceSummaries;
    },
    enabled: cardIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCardPrice = (cardId: string, language?: string) => {
  return useQuery({
    queryKey: ['card-price', cardId, language],
    queryFn: async (): Promise<CardPriceSummary | null> => {
      if (!cardId) return null;

      console.log('🔍 useCardPrice - fetching price for cardId:', cardId, 'language:', language);

      // Build query with language filter if provided
      let query = supabase
        .from('card_prices' as any)
        .select('*')
        .eq('card_id', cardId);
      
      if (language) {
        query = query.eq('language', language);
      }

      // Order by updated_at descending to get latest first (fallback to date_recorded)
      // Note: Supabase only supports ordering by one column, so we order by updated_at
      // and handle download_id comparison client-side if needed
      const { data: prices, error } = await query
        .order('updated_at', { ascending: false, nullsFirst: false })
        .limit(100); // Get multiple records to find the latest by download_id if needed

      console.log('📊 card_prices query result:', { prices, error, dataLength: prices?.length });

      if (error) {
        console.error('❌ Error fetching card price:', error);
        throw error;
      }

      if (!prices || prices.length === 0) {
        console.log('⚠️ No price data found for card:', cardId, 'language:', language);
        return null;
      }

      // Helper function to parse download_id and convert to comparable format
      // download_id format: "2025/9/4/3" (year/month/day/batch)
      const parseDownloadId = (downloadId: string): number => {
        if (!downloadId) return 0;
        const parts = downloadId.split('/').map(Number);
        if (parts.length >= 3) {
          return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0) + (parts[3] || 0) * 0.01;
        }
        return 0;
      };

      // Find the latest price record by comparing download_id, date_recorded, and updated_at
      let latestPrice = (prices as any[])[0];
      let latestDownloadIdValue = parseDownloadId(latestPrice.download_id || '');
      
      (prices as any[]).forEach((price: any) => {
        const currentDownloadIdValue = parseDownloadId(price.download_id || '');
        
        if (currentDownloadIdValue > latestDownloadIdValue) {
          latestPrice = price;
          latestDownloadIdValue = currentDownloadIdValue;
        } else if (currentDownloadIdValue === 0 && latestDownloadIdValue === 0) {
          // If neither has download_id, compare by date_recorded
          if (price.date_recorded && latestPrice.date_recorded) {
            const currentDate = new Date(price.date_recorded).getTime();
            const existingDate = new Date(latestPrice.date_recorded).getTime();
            if (currentDate > existingDate) {
              latestPrice = price;
            }
          } else if (price.date_recorded && !latestPrice.date_recorded) {
            latestPrice = price;
          }
        }
      });

      const price = latestPrice;

      const summary: CardPriceSummary = {
        card_id: cardId,
        cardmarket_avg_sell_price: price.avg_sell_price, // Use ONLY avg_sell_price field
        // Remove tcgplayer_market_price to avoid confusion
        last_updated: price.updated_at || price.date_recorded || new Date().toISOString()
      };

      console.log('🔄 Single price summary:', summary);
      return summary;
    },
    enabled: !!cardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
