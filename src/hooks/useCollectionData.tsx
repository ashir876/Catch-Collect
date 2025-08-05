
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
      if (!user) return [];

    
      
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

      // Then, get the card details for each collection item
      const cardIds = collectionItems.map(item => item.card_id);
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('card_id', cardIds);

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        throw cardsError;
      }

      // Combine collection items with card data
      const data = collectionItems.map(collectionItem => {
        const card = cards?.find(c => c.card_id === collectionItem.card_id);
        return {
          ...collectionItem,
          cards: card
        };
      });

      
      return data;
    },
    enabled: !!user,
  });
};
