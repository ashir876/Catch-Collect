import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentPrices = (cardIds: string[]) => {
  return useQuery({
    queryKey: ['current-prices', cardIds],
    queryFn: async () => {
      if (!cardIds || cardIds.length === 0) return [];

      console.log('useCurrentPrices - fetching prices for cardIds:', cardIds);

      // Directly query the current_prices view for the specific card IDs
      const { data, error } = await supabase
        .from('price_history')
        .select('card_id, source, price_type, price, currency, recorded_at')
        .in('card_id', cardIds)
        .order('recorded_at', { ascending: false });

      console.log('useCurrentPrices - query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('Error fetching current prices:', error);
        return [];
      }

      // Get the latest price for each card (since we ordered by recorded_at DESC)
      const latestPrices = new Map();
      data?.forEach((price: any) => {
        const key = `${price.card_id}-${price.source}-${price.price_type}`;
        if (!latestPrices.has(key)) {
          latestPrices.set(key, price);
        }
      });

      // Convert back to array and prefer TCGPlayer USD prices
      const prices = Array.from(latestPrices.values());
      const result = cardIds.map(cardId => {
        // Prefer TCGPlayer normal_market USD, then CardMarket averageSellPrice EUR
        const tcgplayerPrice = prices.find(p => 
          p.card_id === cardId && 
          p.source === 'tcgplayer' && 
          p.price_type === 'normal_market' && 
          p.currency === 'USD'
        );
        
        const cardmarketPrice = prices.find(p => 
          p.card_id === cardId && 
          p.source === 'cardmarket' && 
          p.price_type === 'averageSellPrice' && 
          p.currency === 'EUR'
        );

        return tcgplayerPrice || cardmarketPrice;
      }).filter(Boolean);

      return result;
    },
    enabled: cardIds.length > 0,
  });
};
