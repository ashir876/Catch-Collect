import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentPrices = (cardIds: string[]) => {
  return useQuery({
    queryKey: ['current-prices', cardIds],
    queryFn: async () => {
      if (!cardIds || cardIds.length === 0) return [];

      console.log('🔍 useCurrentPrices - fetching prices for cardIds:', cardIds);

      const { data, error } = await supabase
        .from('card_prices' as any)
        .select('*')
        .in('card_id', cardIds);

      console.log('📊 useCurrentPrices - query result:', { data, error, dataLength: data?.length });

      if (error) {
        console.error('❌ Error fetching current prices:', error);
        return [];
      }

      // ✅ IMPLEMENTIERE CARDS.TSX LOGIC - Neueste Preise nach download_id wählen
      const priceGroups = new Map();
      
      if (data) {
        // Debug: Show first few prices
        console.log('💰 First 3 prices loaded:', data.slice(0, 3).map((price: any) => ({
          card_id: price.card_id,
          language: price.language,
          avg_sell_price: price.avg_sell_price,
          download_id: price.download_id,
          date_recorded: price.date_recorded
        })));

        // Group prices by card_id + language
        data.forEach((price: any) => {
          const key = `${price.card_id}-${price.language || 'en'}`;
          if (!priceGroups.has(key)) {
            priceGroups.set(key, []);
          }
          priceGroups.get(key).push(price);
        });

        // For each group, find the latest price using download_id logic
        const parseDownloadId = (downloadId: string): number => {
          if (!downloadId) return 0;
          const parts = downloadId.split('/').map(Number);
          if (parts.length >= 3) {
            return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0) + (parts[3] || 0) * 0.01;
          }
          return 0;
        };

        const priceMap = new Map();
        
        priceGroups.forEach((prices: any[], key: string) => {
          console.log(`🔄 Processing ${prices.length} price(s) for ${key}`);

          if (prices.length === 1) {
            console.log(`  📄 Single price: €${prices[0].avg_sell_price} (download_id: "${prices[0].download_id}")`);
          } else {
            console.log(`  📄 Multiple prices found, selecting latest by download_id:`);
            prices.forEach((p, idx) => {
              console.log(`    ${idx + 1}. €${p.avg_sell_price} (download_id: "${p.download_id}")`);
            });
          }

          let latestPrice = prices[0];
          let latestDownloadIdValue = parseDownloadId(latestPrice.download_id || '');

          prices.forEach((price: any) => {
            const currentDownloadIdValue = parseDownloadId(price.download_id || '');

            if (currentDownloadIdValue > latestDownloadIdValue) {
              latestPrice = price;
              latestDownloadIdValue = currentDownloadIdValue;
            } else if (currentDownloadIdValue === 0 && latestDownloadIdValue === 0) {
              // Fallback to date_recorded if download_id parsing fails
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

          console.log(`🏆 SELECTED for ${key}: €${latestPrice.avg_sell_price} (download_id: "${latestPrice.download_id}")`);

          priceMap.set(key, {
            card_id: latestPrice.card_id,
            avg_sell_price: latestPrice.avg_sell_price,  // KORREKT: avg_sell_price direkt verwenden
            last_updated: latestPrice.updated_at || latestPrice.date_recorded
          });
        });

        // Return result in same format as before
        const result = cardIds.map(cardId => {
          // Try to match by card_id + language first
          let priceKey = `${cardId}-en`; // Default to 'en' for prices
          let priceData = priceMap.get(priceKey);

          // If no match, try any language for this card_id
          if (!priceData) {
            for (const [key, data] of priceMap.entries()) {
              if (key.startsWith(`${cardId}-`)) {
                priceData = data;
                priceKey = key;
                break;
              }
            }
          }

          if (!priceData) return null;

          return {
            card_id: cardId,
            source: 'cardmarket',
            price_type: 'avg_sell_price',
            price: priceData.avg_sell_price,  // KORREKT: avg_sell_price statt cardmarket_avg_sell_price
            currency: 'USD',
            last_updated: priceData.last_updated
          };
        }).filter(Boolean);

        console.log('📋 useCurrentPrices - final result with latest prices:', result);
        return result;
      }

      return [];
    },
    enabled: cardIds.length > 0,
  });
};
