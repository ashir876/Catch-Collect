import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SetProgress {
  set_id: string;
  set_name: string;
  total_cards: number;
  collected_cards: number;
  wishlist_cards: number;
  completion_percentage: number;
  is_completed: boolean;
}

export const useSetProgress = (setId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['set-progress', user?.id, setId || 'all'],
    queryFn: async (): Promise<SetProgress[]> => {
      if (!user) return [];

      try {
        // Get all sets with their total card counts
        const { data: setsData, error: setsError } = await supabase
          .from('sets')
          .select('set_id, name, total')
          .order('name');

        if (setsError) throw setsError;

        // Filter by specific set if provided
        const filteredSets = setId ? setsData.filter(set => set.set_id === setId) : setsData;

        // Get collection counts per set - fetch card details separately
        const { data: collectionData, error: collectionError } = await supabase
          .from('card_collections')
          .select('card_id')
          .eq('user_id', user.id);

        if (collectionError) throw collectionError;

        // Get wishlist counts per set - fetch card details separately
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('card_wishlist')
          .select('card_id')
          .eq('user_id', user.id);

        if (wishlistError) throw wishlistError;
        


        // Get set_id for each collected card, deduplicating by card_id per set
        let collectionCounts: Record<string, number> = {};
        
        if (collectionData.length > 0) {
          const cardIds = collectionData.map(item => item.card_id);
          const { data: collectionCards, error: cardsError } = await supabase
            .from('cards')
            .select('card_id, set_id')
            .in('card_id', cardIds);
          
          if (cardsError) throw cardsError;
          
          // Use a Set per set_id to ensure unique card_ids are counted only once
          const setToUniqueCards = new Map<string, Set<string>>();
          collectionCards.forEach(card => {
            if (!card.set_id || !card.card_id) return;
            if (!setToUniqueCards.has(card.set_id)) {
              setToUniqueCards.set(card.set_id, new Set());
          }
            setToUniqueCards.get(card.set_id)!.add(card.card_id);
          });
          
          // Convert Set sizes to counts
          setToUniqueCards.forEach((cardSet, setId) => {
            collectionCounts[setId] = cardSet.size;
          });
        }

        // Get set_id for each card in wishlist - use a more direct approach
        let wishlistCounts: Record<string, number> = {};
        
        if (wishlistData.length > 0) {
          // Get all card details in one query to avoid duplicates
          const cardIds = wishlistData.map(item => item.card_id);
          const { data: wishlistCards, error: cardsError } = await supabase
            .from('cards')
            .select('card_id, set_id')
            .in('card_id', cardIds);
          
          if (cardsError) throw cardsError;
          
          // Count cards per set - each card should only be counted once
          // Use a Set to ensure unique card IDs per set
          const setCardMap = new Map<string, Set<string>>();
          wishlistCards.forEach(card => {
            if (card.set_id) {
              if (!setCardMap.has(card.set_id)) {
                setCardMap.set(card.set_id, new Set());
              }
              setCardMap.get(card.set_id)!.add(card.card_id);
            }
          });
          
          // Convert Set sizes to counts
          setCardMap.forEach((cardSet, setId) => {
            wishlistCounts[setId] = cardSet.size;
          });
        }

        // Calculate progress for each set
        const progress: SetProgress[] = filteredSets.map(set => {
          const totalCards = set.total || 0;
          const collectedCards = collectionCounts[set.set_id] || 0;
          const wishlistCards = wishlistCounts[set.set_id] || 0;
          const completionPercentage = totalCards > 0 ? Math.round((collectedCards / totalCards) * 100) : 0;
          const isCompleted = collectedCards >= totalCards && totalCards > 0;



          return {
            set_id: set.set_id,
            set_name: set.name,
            total_cards: totalCards,
            collected_cards: collectedCards,
            wishlist_cards: wishlistCards,
            completion_percentage: completionPercentage,
            is_completed: isCompleted
          };
        });

        return progress;
      } catch (error) {
        console.error('Error fetching set progress:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
};

// Hook to get progress for a single set
export const useSingleSetProgress = (setId: string) => {
  const { data: allProgress = [] } = useSetProgress();
  return allProgress.find(progress => progress.set_id === setId);
};
