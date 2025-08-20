
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
      // Create a more specific query to get the exact cards we need
      const cardQueries = collectionItems.map(item => 
        supabase
          .from('cards')
          .select('*')
          .eq('card_id', item.card_id)
          .eq('language', item.language)
          .single()
      );
      
      console.log('useCollectionData - Fetching cards for collection items:', collectionItems.length);
      
      const cardResults = await Promise.all(cardQueries);
      const cards = cardResults
        .map(result => result.data)
        .filter(card => card !== null); // Filter out any null results
      
      const cardsError = cardResults.find(result => result.error)?.error;

      // Fetch series information for the cards
      const setIds = cards.map(card => card.set_id).filter(Boolean);
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
      const data = collectionItems.map((collectionItem, index) => {
        const card = cards[index]; // Since we fetched cards in the same order as collection items
        console.log('useCollectionData - Combining data for card_id:', collectionItem.card_id, {
          foundCard: !!card,
          cardName: card?.name,
          cardSet: card?.set_name,
          collectionName: collectionItem.name,
          language: collectionItem.language
        });
        
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
