
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Export the query key for cache invalidation
export const COLLECTION_QUERY_KEY = (userId?: string) => ['collection', userId];

export const useCollectionData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: COLLECTION_QUERY_KEY(user?.id),
    queryFn: async () => {
      if (!user) {
        return [];
      }

    
      
      // First, get the collection items from card_collections table
      const { data: collectionItems, error: collectionError } = await supabase
        .from('card_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collectionError) {
        console.error('Error fetching collection items:', collectionError);
        throw collectionError;
      }

      if (!collectionItems || collectionItems.length === 0) {
        return [];
      }

      // Get unique card IDs and languages to optimize the query
      const uniqueCardIds = [...new Set(collectionItems.map(item => item.card_id))];
      const uniqueLanguages = [...new Set(collectionItems.map(item => item.language))];
      
      // Fetch all cards in a single query instead of multiple individual queries
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('card_id', uniqueCardIds)
        .in('language', uniqueLanguages);

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        throw cardsError;
      }

      // Fetch series information for the cards
      const setIds = cards?.map(card => card.set_id).filter(Boolean) || [];
      let seriesData = {};
      
      if (setIds.length > 0) {
        const { data: seriesResults, error: seriesError } = await supabase
          .from('series_sets')
          .select('set_id, series_name')
          .in('set_id', setIds);
        
        if (!seriesError && seriesResults) {
          seriesData = seriesResults.reduce((acc, item) => {
            acc[item.set_id] = item.series_name;
            return acc;
          }, {});
        }
      }

      // Create a lookup map for cards by card_id and language
      const cardLookup = new Map();
      cards?.forEach(card => {
        const key = `${card.card_id}-${card.language}`;
        cardLookup.set(key, card);
      });

      // Combine collection items with card data
      const data = collectionItems.map((collectionItem) => {
        const key = `${collectionItem.card_id}-${collectionItem.language}`;
        const card = cardLookup.get(key);
        
        // Use the card data from the cards table if available, otherwise fall back to collection data
        const finalCardData = card ? {
          ...card,
          series_name: seriesData[card.set_id] || null
        } : {
          card_id: collectionItem.card_id,
          name: collectionItem.name,
          set_name: collectionItem.set_name,
          set_id: collectionItem.set_id,
          card_number: collectionItem.card_number,
          rarity: collectionItem.rarity,
          image_url: collectionItem.image_url,
          description: collectionItem.description,
          illustrator: collectionItem.illustrator,
          hp: collectionItem.hp,
          types: collectionItem.types,
          attacks: collectionItem.attacks,
          weaknesses: collectionItem.weaknesses,
          retreat: collectionItem.retreat,
          language: collectionItem.language,
          series_name: null
        };
        
        return {
          ...collectionItem,
          cards: finalCardData
        };
      });
      
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};

// Hook to check if a specific card is in the user's collection
export const useIsCardInCollection = (cardId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collection-check', user?.id, cardId],
    queryFn: async () => {
      if (!user || !cardId) return false;

      console.log('useIsCardInCollection - Checking card:', cardId, 'for user:', user.id);

      const { data, error } = await supabase
        .from('card_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId);

      if (error) {
        console.error('Error checking collection:', error);
        throw error;
      }

      const result = data && data.length > 0;
      console.log('useIsCardInCollection - Result for card:', cardId, 'isInCollection:', result, 'data:', data, 'timestamp:', new Date().toISOString());
      
      return result;
    },
    enabled: !!user && !!cardId,
    staleTime: 0, // Always consider data stale to ensure fresh updates
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
};
