
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
      console.log('useCollectionData - Starting query with user:', user?.id);
      console.log('useCollectionData - User object:', user);
      if (!user) {
        console.log('useCollectionData - No user found, returning empty array');
        return [];
      }

    
      
      // First, get the collection items from card_collections table
      console.log('useCollectionData - Querying card_collections for user:', user.id);
      const { data: collectionItems, error: collectionError } = await supabase
        .from('card_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collectionError) {
        console.error('useCollectionData - Collection query error:', collectionError);
      }

      console.log('useCollectionData - Raw collection items from database:', collectionItems);
      console.log('useCollectionData - First collection item details:', collectionItems[0] ? {
        id: collectionItems[0].id,
        idType: typeof collectionItems[0].id,
        card_id: collectionItems[0].card_id,
        user_id: collectionItems[0].user_id,
        condition: collectionItems[0].condition,
        price: collectionItems[0].price,
        notes: collectionItems[0].notes,
        created_at: collectionItems[0].created_at,
        // Log all available fields
        allFields: Object.keys(collectionItems[0]),
        fullObject: collectionItems[0]
      } : 'No items');

      if (collectionError) {
        console.error('Error fetching collection items:', collectionError);
        throw collectionError;
      }

      if (!collectionItems || collectionItems.length === 0) {
        return [];
      }

      // Then, get the card details for each collection item
      const cardIds = collectionItems.map(item => item.card_id);
      console.log('useCollectionData - Card IDs to fetch:', cardIds);
      
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('card_id', cardIds);

      if (cardsError) {
        console.error('Error fetching cards:', cardsError);
        throw cardsError;
      }

      console.log('useCollectionData - Fetched cards data:', cards);
      console.log('useCollectionData - Cards found:', cards?.length);
      if (cards && cards.length > 0) {
        console.log('useCollectionData - Sample card data:', {
          card_id: cards[0].card_id,
          name: cards[0].name,
          set_name: cards[0].set_name
        });
      }

      // Combine collection items with card data
      const data = collectionItems.map(collectionItem => {
        const card = cards?.find(c => c.card_id === collectionItem.card_id);
        console.log('useCollectionData - Combining data for card_id:', collectionItem.card_id, {
          foundCard: !!card,
          cardName: card?.name,
          cardSet: card?.set_name
        });
        return {
          ...collectionItem,
          cards: card
        };
      });

      console.log('useCollectionData - fetched data:', {
        collectionItemsCount: collectionItems.length,
        cardsCount: cards?.length,
        sampleItem: data[0],
        priceFields: data.map(item => ({ cardId: item.card_id, price: item.price })),
        // Add detailed logging of the first collection item
        firstCollectionItem: collectionItems[0] ? {
          id: collectionItems[0].id,
          idType: typeof collectionItems[0].id,
          card_id: collectionItems[0].card_id,
          user_id: collectionItems[0].user_id,
          condition: collectionItems[0].condition,
          price: collectionItems[0].price,
          notes: collectionItems[0].notes
        } : null,
        // Log all collection items with their IDs
        allCollectionItems: collectionItems.map(item => ({
          id: item.id,
          idType: typeof item.id,
          card_id: item.card_id
        }))
      });
      
      return data;
    },
    enabled: !!user,
  });
};

// Hook to check if a specific card is in the user's collection
export const useIsCardInCollection = (cardId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collection-check', user?.id, cardId],
    queryFn: async () => {
      if (!user || !cardId) return false;

      const { data, error } = await supabase
        .from('card_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking collection:', error);
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!cardId,
  });
};
