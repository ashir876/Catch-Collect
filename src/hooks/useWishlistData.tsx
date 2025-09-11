
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
  price?: number; // User's desired price
  notes?: string; // User's notes
  
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

    
      
      // First get the wishlist items with pagination
      let wishlistQuery = supabase
        .from('card_wishlist')
        .select('id, card_id, user_id, created_at, priority, set_id, series_id, language, price, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (priority !== undefined) {
        wishlistQuery = wishlistQuery.eq('priority', priority);
      }

      if (limit) {
        wishlistQuery = wishlistQuery.range(offset, offset + limit - 1);
      }

      let { data: wishlistItems, error: wishlistError } = await wishlistQuery;

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        
        // If the error is due to missing columns, try without price and notes
        if (wishlistError.message?.includes('column') && wishlistError.message?.includes('does not exist')) {
          console.warn('Price or notes columns not found, falling back to basic query');
          
          let fallbackQuery = supabase
            .from('card_wishlist')
            .select('id, card_id, user_id, created_at, priority, set_id, series_id, language')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (priority !== undefined) {
            fallbackQuery = fallbackQuery.eq('priority', priority);
          }

          if (limit) {
            fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
          }

          const { data: fallbackItems, error: fallbackError } = await fallbackQuery;
          
          if (fallbackError) {
            console.error('Error with fallback query:', fallbackError);
            throw fallbackError;
          }
          
          // Add default values for missing columns
          const itemsWithDefaults = fallbackItems?.map((item: any) => ({
            ...item,
            price: 0,
            notes: ''
          })) || [];
          
          wishlistItems = itemsWithDefaults;
        } else {
          throw wishlistError;
        }
      }

      // If we have wishlist items, fetch the card details for each
      if (wishlistItems && wishlistItems.length > 0) {
        const cardIds = wishlistItems.map((item: any) => item.card_id);
        
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
        const enhancedWishlistItems = wishlistItems.map((item: any) => {
          const cardData = cardsData?.find((card: any) => card.card_id === item.card_id);
          return {
            ...item,
            card: cardData || undefined
          };
        });
        

        return enhancedWishlistItems as WishlistItem[];
      }
      
      
      return (wishlistItems || []) as unknown as WishlistItem[];
    },
    enabled: !!user,
    staleTime: 0, // Always consider data stale to ensure real-time updates
    refetchOnWindowFocus: false, // Don't refetch on window focus
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

      return count || 0;
    },
    enabled: !!user,
    staleTime: 0, // Always consider data stale to ensure real-time updates
    refetchOnWindowFocus: false, // Don't refetch on window focus
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
        .eq('card_id', cardId);

      if (error) {
        console.error('Error checking wishlist:', error);
        throw error;
      }

      return data && data.length > 0;
    },
    enabled: !!user && !!cardId,
  });
};
