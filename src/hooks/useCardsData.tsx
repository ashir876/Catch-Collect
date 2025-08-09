
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
        query = query.or(`name.ilike.%${searchTerm}%,card_number.ilike.%${searchTerm}%`);
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
        query = query.or(`name.ilike.%${searchTerm}%,card_number.ilike.%${searchTerm}%`);
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

      const { count, error } = await query;

      if (error) {
        console.error('❌ Error fetching cards count:', error);
        throw error;
      }

      return count || 0;
    },
  });
};
