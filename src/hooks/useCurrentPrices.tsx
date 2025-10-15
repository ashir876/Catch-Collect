import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentPrices = (cardIds: string[]) => {
  return useQuery({
    queryKey: ['current-prices', cardIds],
    queryFn: async () => {
      if (!cardIds || cardIds.length === 0) return [];

      console.log('🔍 useCurrentPrices - fetching prices for cardIds:', cardIds);

      // Query the card_prices table for the specific card IDs
      const { data, error } = await supabase
        .from('card_prices')
        .select('*')
        .in('card_id', cardIds);

      console.log('📊 useCurrentPrices - query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('❌ Error fetching current prices:', error);
        return [];
      }

      // Convert to the expected format, using avg_sell_price as the primary price
      const result = cardIds.map(cardId => {
        const priceData = data?.find(p => p.card_id === cardId);
        if (!priceData) return null;

        return {
          card_id: cardId,
          source: priceData.source || 'cardmarket',
          price_type: 'avg_sell_price',
          price: priceData.avg_sell_price || priceData.price, // Prefer avg_sell_price
          currency: 'USD'
        };
      }).filter(Boolean);

      console.log('📋 useCurrentPrices - final result:', result);
      return result;
    },
    enabled: cardIds.length > 0,
  });
};
