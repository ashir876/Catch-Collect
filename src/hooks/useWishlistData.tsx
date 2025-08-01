
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WishlistItem {
  id: number;
  card_id: string;
  user_id: string;
  created_at: string;
  priority: number; // 0 = low, 1 = medium, 2 = high
  set_id?: string;
  series_id?: string;
  language?: string;
  
  // Card information (joined with cards table)
  card?: {
    name: string;
    set_name: string;
    series_name?: string;
    rarity?: string;
    image_url?: string;
    price?: number;
    number?: string;
    set_id?: string;
    type?: string;
  }
}

export interface WishlistDataOptions {
  limit?: number;
  offset?: number;
  priority?: number;
  searchTerm?: string;
}

export const useWishlistData = (options: WishlistDataOptions = {}) => {
  const { user } = useAuth();
  const { limit, offset = 0, priority, searchTerm } = options;

  return useQuery({
    queryKey: ['wishlist', user?.id, limit, offset, priority, searchTerm],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching wishlist data for user:', user.id, { limit, offset, priority, searchTerm });
      
      // First get the wishlist items with pagination
      let wishlistQuery = supabase
        .from('card_wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (priority !== undefined) {
        wishlistQuery = wishlistQuery.eq('priority', priority);
      }

      if (limit) {
        wishlistQuery = wishlistQuery.range(offset, offset + limit - 1);
      }

      const { data: wishlistItems, error: wishlistError } = await wishlistQuery;

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        throw wishlistError;
      }

      // If we have wishlist items, fetch the card details for each
      if (wishlistItems && wishlistItems.length > 0) {
        const cardIds = wishlistItems.map(item => item.card_id);
        
        let cardsQuery = supabase
          .from('cards')
          .select('*')
          .in('card_id', cardIds);

        if (searchTerm) {
          cardsQuery = cardsQuery.ilike('name', `%${searchTerm}%`);
        }
          
        const { data: cardsData, error: cardsError } = await cardsQuery;
          
        if (cardsError) {
          console.error('Error fetching card details:', cardsError);
          throw cardsError;
        }
        
        // Combine the wishlist items with their card details
        const enhancedWishlistItems = wishlistItems.map(item => {
          const cardData = cardsData.find(card => card.card_id === item.card_id);
          return {
            ...item,
            card: cardData || undefined
          };
        });
        
        console.log('Wishlist data fetched:', enhancedWishlistItems.length, 'cards');
        return enhancedWishlistItems as WishlistItem[];
      }
      
      console.log('Wishlist is empty');
      return wishlistItems as WishlistItem[];
    },
    enabled: !!user,
  });
};

// Hook to get total count of wishlist items for pagination
export const useWishlistCount = (options: Omit<WishlistDataOptions, 'limit' | 'offset'> = {}) => {
  const { user } = useAuth();
  const { priority, searchTerm } = options;

  return useQuery({
    queryKey: ['wishlist-count', user?.id, priority, searchTerm],
    queryFn: async () => {
      if (!user) return 0;

      console.log('Fetching wishlist count for user:', user.id, { priority, searchTerm });
      
      let query = supabase
        .from('card_wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (priority !== undefined) {
        query = query.eq('priority', priority);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching wishlist count:', error);
        throw error;
      }

      console.log('Wishlist count fetched:', count);
      return count || 0;
    },
    enabled: !!user,
  });
};

// Hook to check if a specific card is in the user's wishlist
export const useIsCardInWishlist = (cardId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist-check', user?.id, cardId],
    queryFn: async () => {
      if (!user || !cardId) return false;

      const { data, error } = await supabase
        .from('card_wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking wishlist:', error);
        throw error;
      }

      return !!data;
    },
    enabled: !!user && !!cardId,
  });
};
