
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

export const useWishlistData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching wishlist data for user:', user.id);
      
      // First get the wishlist items
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('card_wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (wishlistError) {
        console.error('Error fetching wishlist:', wishlistError);
        throw wishlistError;
      }

      // If we have wishlist items, fetch the card details for each
      if (wishlistItems && wishlistItems.length > 0) {
        const cardIds = wishlistItems.map(item => item.card_id);
        
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .in('card_id', cardIds);
          
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
