
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CardsDataOptions {
  language?: string;
  setId?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
  rarity?: string;
  type?: string;
  hpMin?: number;
  hpMax?: number;
  illustrator?: string;
  collectionFilter?: string;
  wishlistFilter?: string;
  userId?: string;
  
  category?: string;
  stage?: string;
  evolveFrom?: string;
  retreatCost?: string;
  regulationMark?: string;
  formatLegality?: string;
  weaknessType?: string;
}

export const useCardsData = (options: CardsDataOptions = {}) => {
  const { 
    language, 
    setId, 
    limit, 
    offset = 0, 
    searchTerm,
    rarity,
    type,
    hpMin,
    hpMax,
    illustrator,
    collectionFilter,
    wishlistFilter,
    userId,
    
    category,
    stage,
    evolveFrom,
    retreatCost,
    regulationMark,
    formatLegality,
    weaknessType
  } = options;

  return useQuery({
    queryKey: ['cards-sorted', language, setId, limit, offset, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType],
    queryFn: async () => {
      // IMPORTANT: Get ALL matching data first, then sort, then apply limit/offset
      // This ensures proper numeric sorting of card numbers
      
      // Build the query without limit/offset first
      let cardsQuery = supabase
        .from('cards')
        .select('*');

      // Apply all the same filters to the cards query
      if (language) {
        cardsQuery = cardsQuery.eq('language', language);
      }

      if (setId) {
        cardsQuery = cardsQuery.eq('set_id', setId);
      }

      // Apply search filters (simplified version for now)
      if (searchTerm) {
        const trimmedSearchTerm = searchTerm.trim();
        cardsQuery = cardsQuery.or(`name.ilike.%${trimmedSearchTerm}%,card_number.ilike.%${trimmedSearchTerm}%,localid.ilike.%${trimmedSearchTerm}%`);
      }

      if (rarity && rarity !== 'all') {
        cardsQuery = cardsQuery.eq('rarity', rarity);
      }

      if (type && type !== 'all') {
        cardsQuery = cardsQuery.contains('types', [type]);
      }

      if (hpMin !== undefined && hpMin !== null) {
        cardsQuery = cardsQuery.gte('hp', hpMin);
      }

      if (hpMax !== undefined && hpMax !== null) {
        cardsQuery = cardsQuery.lte('hp', hpMax);
      }

      if (illustrator && illustrator !== 'all') {
        cardsQuery = cardsQuery.eq('illustrator', illustrator);
      }

      if (category && category !== 'all') {
        cardsQuery = cardsQuery.eq('category', category);
      }

      if (stage && stage !== 'all') {
        cardsQuery = cardsQuery.eq('stage', stage);
      }

      if (evolveFrom && evolveFrom !== 'all') {
        cardsQuery = cardsQuery.eq('evolvefrom', evolveFrom);
      }

      if (retreatCost && retreatCost !== 'all') {
        if (retreatCost === '4') {
          cardsQuery = cardsQuery.gte('retreat', 4);
        } else {
          cardsQuery = cardsQuery.eq('retreat', parseInt(retreatCost));
        }
      }

      if (regulationMark && regulationMark !== 'all') {
        cardsQuery = cardsQuery.eq('regulationmark', regulationMark);
      }

      if (formatLegality && formatLegality !== 'all') {
        if (formatLegality === 'standard') {
          cardsQuery = cardsQuery.contains('legal', { standard: true });
        } else if (formatLegality === 'expanded') {
          cardsQuery = cardsQuery.contains('legal', { expanded: true });
        }
      }

      if (weaknessType && weaknessType !== 'all') {
        cardsQuery = cardsQuery.contains('weaknesses', [{ type: weaknessType }]);
      }

      // Handle collection and wishlist filters
      if ((collectionFilter && collectionFilter !== 'all') || (wishlistFilter && wishlistFilter !== 'all')) {
        if (userId) {
          if (collectionFilter === 'in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);

            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              cardsQuery = cardsQuery.in('card_id', cardIds);
            } else {
              return [];
            }
          } else if (collectionFilter === 'not_in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);

            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              cardsQuery = cardsQuery.not('card_id', 'in', cardIds);
            }
          }

          if (wishlistFilter === 'in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);

            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              cardsQuery = cardsQuery.in('card_id', cardIds);
            } else {
              return [];
            }
          } else if (wishlistFilter === 'not_in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);

            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              cardsQuery = cardsQuery.not('card_id', 'in', cardIds);
            }
          }
        }
      }

      // Fetch ALL matching data first (NO limit/offset yet!)
      const { data: allCardsData, error: cardsError } = await cardsQuery;

      if (cardsError) {
        console.error('❌ Error fetching cards:', cardsError);
        throw cardsError;
      }

      if (!allCardsData || allCardsData.length === 0) {
        return [];
      }

      // Debug: Show data before sorting
      console.log('📄 Total cards loaded before sorting:', allCardsData.length);
      console.log('📄 First 10 cards loaded (showing sorting):', allCardsData.slice(0, 10).map((card, idx) => ({
        index: idx + 1,
        card_id: card.card_id,
        card_number: card.card_number,
        name: card.name?.substring(0, 20),
        language: card.language
      })));

      // Sort ALL cards by card number (numeric part before "/") BEFORE limiting
      console.log('🔢 Sorting ALL cards by card_number numerically...');

      const sortedAllCardsData = [...allCardsData].sort((a, b) => {
        const getCardNumber = (cardNumber: string | null) => {
          if (!cardNumber) return 999999; // Put nulls at the end
          // Extract numeric part before "/" (e.g., "10/102" -> 10, "2/102" -> 2)
          const match = cardNumber.match(/^(\d+)\//);
          return match ? parseInt(match[1]) : 999999;
        };

        const aNum = getCardNumber(a.card_number);
        const bNum = getCardNumber(b.card_number);

        console.log(`🔢 Comparing: "${a.card_number}" (${aNum}) vs "${b.card_number}" (${bNum}) = ${aNum - bNum}`);

        return aNum - bNum;
      });

      console.log('🔢 After sorting ALL cards - First 10:', sortedAllCardsData.slice(0, 10).map((card, idx) => ({
        index: idx + 1,
        card_number: card.card_number,
        name: card.name?.substring(0, 20)
      })));

      // Now apply pagination to the sorted data
      const paginatedCards = limit 
        ? sortedAllCardsData.slice(offset, offset + limit)
        : sortedAllCardsData;

      console.log(`📄 Paginated result: ${paginatedCards.length} cards (offset: ${offset}, limit: ${limit})`);

      // Get card IDs and languages for price lookup (from paginated data)
      const cardKeys = paginatedCards.map(card => ({
        card_id: card.card_id,
        language: card.language || 'en'
      }));

      // Fetch prices for these cards from card_prices table
      // Get all prices for these card_ids, we'll filter by language in the logic
      const { data: pricesData, error: pricesError } = await supabase
        .from('card_prices' as any)
        .select('*')
        .in('card_id', cardKeys.map(k => k.card_id));

      if (pricesError) {
        console.error('❌ Error fetching prices:', pricesError);
        // Don't throw error for prices, just continue without them
      }

      // Create a map of card_id+language to latest price data
      const priceMap = new Map();

      if (pricesData) {
        // Debug: Show first few prices
        console.log('💰 First 3 prices loaded:', pricesData.slice(0, 3).map(price => ({
          card_id: price.card_id,
          language: price.language,
          avg_sell_price: price.avg_sell_price,
          download_id: price.download_id,
          date_recorded: price.date_recorded
        })));

        // Group prices by card_id + language
        const priceGroups = new Map();

        pricesData.forEach((price: any) => {
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

          // Set both price and cardmarket_avg_sell_price for compatibility
          priceMap.set(key, {
            card_id: latestPrice.card_id,
            price: latestPrice.avg_sell_price,
            cardmarket_avg_sell_price: latestPrice.avg_sell_price,  // For TradingCard compatibility
            currency: 'EUR',
            source: 'cardmarket',
            last_updated: latestPrice.updated_at || latestPrice.date_recorded
          });
        });
      }

      // Combine paginated sorted cards with price data
      const cardsWithPrices = paginatedCards.map(card => {
        // Try to match by card_id + language first
        let priceKey = `${card.card_id}-${card.language || 'en'}`;
        let priceData = priceMap.get(priceKey);

        // If no match, try just card_id (in case cards don't have language)
        if (!priceData) {
          priceKey = `${card.card_id}-en`; // Default to 'en' for prices
          priceData = priceMap.get(priceKey);
        }

        // If still no match, try any language for this card_id
        if (!priceData) {
          for (const [key, data] of priceMap.entries()) {
            if (key.startsWith(`${card.card_id}-`)) {
              priceData = data;
              priceKey = key;
              break;
            }
          }
        }

        console.log(`🔗 Card ${card.card_id} (${card.language || 'no-lang'}) -> Price key: ${priceKey}, Found price:`, priceData ? `€${priceData.price}` : 'NO PRICE');

        return {
          ...card,
          priceData: priceData,
          price: priceData?.price || null  // Also set price at card level for TradingCard compatibility
        };
      });

      // Apply search deduplication if needed
      if (searchTerm) {
        const uniqueCards = new Map();

        cardsWithPrices.forEach(card => {
          const uniqueKey = card.localid || card.card_id;

          if (!uniqueCards.has(uniqueKey)) {
            uniqueCards.set(uniqueKey, card);
          } else {
            const existingCard = uniqueCards.get(uniqueKey);
            const currentNameMatch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
            const existingNameMatch = existingCard.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (currentNameMatch && !existingNameMatch) {
              uniqueCards.set(uniqueKey, card);
            }
          }
        });

        return Array.from(uniqueCards.values());
      }

      console.log(`📊 Final result: ${cardsWithPrices.length} cards with prices`);
      return cardsWithPrices;
    },
  });
};

export const useCardsCount = (options: Omit<CardsDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, setId, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType } = options;

  return useQuery({
    queryKey: ['cards-count', language, setId, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      if (language) {
        query = query.eq('language', language);
      }

      if (setId) {
        query = query.eq('set_id', setId);
      }

      if (searchTerm) {
        console.log('🔍 Counting search for:', searchTerm);

        const trimmedSearchTerm = searchTerm.trim();

        const pureCardNumberPattern = /^(\d+)(?:\/(\d+))?$/;
        const pureCardNumberMatch = trimmedSearchTerm.match(pureCardNumberPattern);
        
        if (pureCardNumberMatch) {
          
          const cardNumber = pureCardNumberMatch[1];
          const setTotal = pureCardNumberMatch[2];
          
          if (setTotal) {
            
            console.log('🔍 Counting for exact card number:', `${cardNumber}/${setTotal}`);
            query = query.eq('card_number', `${cardNumber}/${setTotal}`);
          } else {
            
            console.log('🔍 Counting for partial card number:', cardNumber);
            
            query = query.or(`card_number.eq.${cardNumber},card_number.ilike.${cardNumber}/%`);
          }
        } else {
          
          const nameNumberPattern = /^(.+?)\s+(\d+\/\d+)$/;
          const nameNumberMatch = trimmedSearchTerm.match(nameNumberPattern);
          
          if (nameNumberMatch) {
            
            const cardName = nameNumberMatch[1].trim();
            const cardNumber = nameNumberMatch[2].trim();
            console.log('🔍 Counting for name + exact number:', cardName, cardNumber);
            query = query.ilike('name', `%${cardName}%`).eq('card_number', cardNumber);
          } else {
            
            console.log('🔍 General count search across name, card_number, and localid');
            query = query.or(`name.ilike.%${trimmedSearchTerm}%,card_number.ilike.%${trimmedSearchTerm}%,localid.ilike.%${trimmedSearchTerm}%`);
          }
        }
      }

      if (rarity && rarity !== 'all') {
        query = query.eq('rarity', rarity);
      }

      if (type && type !== 'all') {
        query = query.contains('types', [type]);
      }

      if (hpMin !== undefined && hpMin !== null) {
        query = query.gte('hp', hpMin);
      }

      if (hpMax !== undefined && hpMax !== null) {
        query = query.lte('hp', hpMax);
      }

      if (illustrator && illustrator !== 'all') {
        query = query.eq('illustrator', illustrator);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (stage && stage !== 'all') {
        query = query.eq('stage', stage);
      }

      if (evolveFrom && evolveFrom !== 'all') {
        query = query.eq('evolvefrom', evolveFrom);
      }

      if (retreatCost && retreatCost !== 'all') {
        if (retreatCost === '4') {
          query = query.gte('retreat', 4);
        } else {
          query = query.eq('retreat', parseInt(retreatCost));
        }
      }

      if (regulationMark && regulationMark !== 'all') {
        query = query.eq('regulationmark', regulationMark);
      }

      if (formatLegality && formatLegality !== 'all') {
        
        if (formatLegality === 'standard') {
          query = query.contains('legal', { standard: true });
        } else if (formatLegality === 'expanded') {
          query = query.contains('legal', { expanded: true });
        }
      }

      if (weaknessType && weaknessType !== 'all') {
        
        query = query.contains('weaknesses', [{ type: weaknessType }]);
      }

      if ((collectionFilter && collectionFilter !== 'all') || (wishlistFilter && wishlistFilter !== 'all')) {
        if (userId) {
          
          if (collectionFilter === 'in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);
            
            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              
              return 0;
            }
          } else if (collectionFilter === 'not_in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);
            
            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              query = query.not('card_id', 'in', cardIds);
            }
          }

          if (wishlistFilter === 'in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);
            
            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              
              return 0;
            }
          } else if (wishlistFilter === 'not_in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);
            
            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              query = query.not('card_id', 'in', cardIds);
            }
          }
        }
      }

      if (searchTerm) {
        
        const { data, error: dataError } = await supabase
          .from('cards')
          .select('localid, card_id')
          .or(`name.ilike.%${searchTerm}%,card_number.ilike.%${searchTerm}%,localid.ilike.%${searchTerm}%`);

        if (dataError) {
          console.error('❌ Error fetching cards for count:', dataError);
          throw dataError;
        }

        const uniqueCards = new Set();
        data.forEach(card => {
          const uniqueKey = card.localid || card.card_id;
          uniqueCards.add(uniqueKey);
        });

        return uniqueCards.size;
      } else {
        
        const { count, error } = await query;

        if (error) {
          console.error('❌ Error fetching cards count:', error);
          throw error;
        }

        return count || 0;
      }
    },
  });
};
