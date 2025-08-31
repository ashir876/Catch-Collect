
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
  // New filter options
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
    // New filter options
    category,
    stage,
    evolveFrom,
    retreatCost,
    regulationMark,
    formatLegality,
    weaknessType
  } = options;

  return useQuery({
    queryKey: ['cards', language, setId, limit, offset, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select('*')
        .order('name');

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (setId) {
        query = query.eq('set_id', setId);
      }

      if (searchTerm) {
        console.log('🔍 Searching for:', searchTerm);
        
        // Enhanced search logic to support specific card number patterns and cross-language search
        const trimmedSearchTerm = searchTerm.trim();
        
        // Check if it's a pure card number pattern (e.g., "123" or "123/456")
        const pureCardNumberPattern = /^(\d+)(?:\/(\d+))?$/;
        const pureCardNumberMatch = trimmedSearchTerm.match(pureCardNumberPattern);
        
        if (pureCardNumberMatch) {
          // Pure card number search
          const cardNumber = pureCardNumberMatch[1];
          const setTotal = pureCardNumberMatch[2];
          
          if (setTotal) {
            // Full card number format (e.g., "123/456") - use exact match
            console.log('🔍 Searching for exact card number:', `${cardNumber}/${setTotal}`);
            query = query.eq('card_number', `${cardNumber}/${setTotal}`);
          } else {
            // Partial card number (e.g., "123") - use word boundary matching
            console.log('🔍 Searching for partial card number:', cardNumber);
            // Use regex to match word boundaries to avoid partial matches
            query = query.or(`card_number.eq.${cardNumber},card_number.ilike.${cardNumber}/%`);
          }
        } else {
          // Check if it's a name + number pattern (e.g., "Pikachu 123/456")
          const nameNumberPattern = /^(.+?)\s+(\d+\/\d+)$/;
          const nameNumberMatch = trimmedSearchTerm.match(nameNumberPattern);
          
          if (nameNumberMatch) {
            // Name + card number search
            const cardName = nameNumberMatch[1].trim();
            const cardNumber = nameNumberMatch[2].trim();
            console.log('🔍 Searching for name + exact number:', cardName, cardNumber);
            query = query.ilike('name', `%${cardName}%`).eq('card_number', cardNumber);
          } else {
            // General search across multiple fields
            console.log('🔍 General search across name, card_number, and localid');
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

      // New filter implementations
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
        // Handle the JSON structure of legal field
        if (formatLegality === 'standard') {
          query = query.contains('legal', { standard: true });
        } else if (formatLegality === 'expanded') {
          query = query.contains('legal', { expanded: true });
        }
      }

      if (weaknessType && weaknessType !== 'all') {
        // Handle weakness type filtering (JSON array field)
        query = query.contains('weaknesses', [{ type: weaknessType }]);
      }

      // Collection and wishlist filters require additional queries
      if ((collectionFilter && collectionFilter !== 'all') || (wishlistFilter && wishlistFilter !== 'all')) {
        if (userId) {
          // For collection filter
          if (collectionFilter === 'in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);
            
            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              // No cards in collection, return empty result
              return [];
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

          // For wishlist filter
          if (wishlistFilter === 'in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);
            
            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              // No cards in wishlist, return empty result
              return [];
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

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching cards:', error);
        throw error;
      }

      // Deduplicate cards based on unique card identifier (localid or card_id)
      // This prevents showing multiple entries for the same card in different languages/sets
      if (data && searchTerm) {
        const uniqueCards = new Map();
        
        data.forEach(card => {
          // Use localid as primary key for deduplication, fallback to card_id
          const uniqueKey = card.localid || card.card_id;
          
          if (!uniqueCards.has(uniqueKey)) {
            uniqueCards.set(uniqueKey, card);
          } else {
            // If we already have this card, prefer the one that matches the search term in the name
            const existingCard = uniqueCards.get(uniqueKey);
            const currentNameMatch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
            const existingNameMatch = existingCard.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Prefer the card whose name matches the search term
            if (currentNameMatch && !existingNameMatch) {
              uniqueCards.set(uniqueKey, card);
            }
          }
        });
        
        return Array.from(uniqueCards.values());
      }

      return data;
    },
  });
};

// Hook to get total count of cards for pagination
export const useCardsCount = (options: Omit<CardsDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, setId, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType } = options;

  return useQuery({
    queryKey: ['cards-count', language, setId, searchTerm, rarity, type, hpMin, hpMax, illustrator, collectionFilter, wishlistFilter, userId, category, stage, evolveFrom, retreatCost, regulationMark, formatLegality, weaknessType],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (setId) {
        query = query.eq('set_id', setId);
      }

      if (searchTerm) {
        console.log('🔍 Counting search for:', searchTerm);
        
        // Enhanced search logic to support specific card number patterns and cross-language search
        const trimmedSearchTerm = searchTerm.trim();
        
        // Check if it's a pure card number pattern (e.g., "123" or "123/456")
        const pureCardNumberPattern = /^(\d+)(?:\/(\d+))?$/;
        const pureCardNumberMatch = trimmedSearchTerm.match(pureCardNumberPattern);
        
        if (pureCardNumberMatch) {
          // Pure card number search
          const cardNumber = pureCardNumberMatch[1];
          const setTotal = pureCardNumberMatch[2];
          
          if (setTotal) {
            // Full card number format (e.g., "123/456") - use exact match
            console.log('🔍 Counting for exact card number:', `${cardNumber}/${setTotal}`);
            query = query.eq('card_number', `${cardNumber}/${setTotal}`);
          } else {
            // Partial card number (e.g., "123") - use word boundary matching
            console.log('🔍 Counting for partial card number:', cardNumber);
            // Use regex to match word boundaries to avoid partial matches
            query = query.or(`card_number.eq.${cardNumber},card_number.ilike.${cardNumber}/%`);
          }
        } else {
          // Check if it's a name + number pattern (e.g., "Pikachu 123/456")
          const nameNumberPattern = /^(.+?)\s+(\d+\/\d+)$/;
          const nameNumberMatch = trimmedSearchTerm.match(nameNumberPattern);
          
          if (nameNumberMatch) {
            // Name + card number search
            const cardName = nameNumberMatch[1].trim();
            const cardNumber = nameNumberMatch[2].trim();
            console.log('🔍 Counting for name + exact number:', cardName, cardNumber);
            query = query.ilike('name', `%${cardName}%`).eq('card_number', cardNumber);
          } else {
            // General search across multiple fields
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

      // New filter implementations
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
        // Handle the JSON structure of legal field
        if (formatLegality === 'standard') {
          query = query.contains('legal', { standard: true });
        } else if (formatLegality === 'expanded') {
          query = query.contains('legal', { expanded: true });
        }
      }

      if (weaknessType && weaknessType !== 'all') {
        // Handle weakness type filtering (JSON array field)
        query = query.contains('weaknesses', [{ type: weaknessType }]);
      }

      // Collection and wishlist filters require additional queries
      if ((collectionFilter && collectionFilter !== 'all') || (wishlistFilter && wishlistFilter !== 'all')) {
        if (userId) {
          // For collection filter
          if (collectionFilter === 'in_collection') {
            const { data: collectionData } = await supabase
              .from('card_collections')
              .select('card_id')
              .eq('user_id', userId);
            
            if (collectionData && collectionData.length > 0) {
              const cardIds = collectionData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              // No cards in collection, return 0
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

          // For wishlist filter
          if (wishlistFilter === 'in_wishlist') {
            const { data: wishlistData } = await supabase
              .from('card_wishlist')
              .select('card_id')
              .eq('user_id', userId);
            
            if (wishlistData && wishlistData.length > 0) {
              const cardIds = wishlistData.map(item => item.card_id);
              query = query.in('card_id', cardIds);
            } else {
              // No cards in wishlist, return 0
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

      // For count queries with search terms, we need to handle deduplication
      if (searchTerm) {
        // Get the actual data to deduplicate, then count
        const { data, error: dataError } = await supabase
          .from('cards')
          .select('localid, card_id')
          .or(`name.ilike.%${searchTerm}%,card_number.ilike.%${searchTerm}%,localid.ilike.%${searchTerm}%`);

        if (dataError) {
          console.error('❌ Error fetching cards for count:', dataError);
          throw dataError;
        }

        // Deduplicate and count
        const uniqueCards = new Set();
        data.forEach(card => {
          const uniqueKey = card.localid || card.card_id;
          uniqueCards.add(uniqueKey);
        });

        return uniqueCards.size;
      } else {
        // For non-search queries, use the original count approach
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
