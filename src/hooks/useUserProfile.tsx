import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  loyalty_points: number | null;
  account_type: string | null;
  role: string;
  // Stats
  totalCards: number;
  totalValue: number;
  setsCompleted: number;
  wishlistItems: number;
  ordersPlaced: number;
}

export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;

      try {
        // Get user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }

        if (!userData) {
          throw new Error('User not found');
        }

        // Get collection count
        const { count: collectionCount, error: collectionError } = await supabase
          .from('card_collections')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (collectionError) {
          console.error('Error fetching collection count:', collectionError);
          throw collectionError;
        }

        // Get wishlist count
        const { count: wishlistCount, error: wishlistError } = await supabase
          .from('card_wishlist')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (wishlistError) {
          console.error('Error fetching wishlist count:', wishlistError);
          throw wishlistError;
        }

        // Get orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (ordersError) {
          console.error('Error fetching orders count:', ordersError);
          throw ordersError;
        }

        // Calculate total collection value (sum of prices)
        const { data: collectionItems, error: valueError } = await supabase
          .from('card_collections')
          .select('price')
          .eq('user_id', user.id)
          .not('price', 'is', null);

        if (valueError) {
          console.error('Error fetching collection values:', valueError);
          throw valueError;
        }

        const totalValue = collectionItems?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

        // For now, we'll set sets completed to 0 as it requires more complex logic
        // This could be calculated by grouping by set_id and counting complete sets
        const setsCompleted = 0;

        return {
          user_id: userData.user_id,
          email: userData.email,
          full_name: userData.full_name,
          avatar_url: userData.avatar_url,
          created_at: userData.created_at,
          loyalty_points: userData.loyalty_points,
          account_type: userData.account_type,
          role: userData.role,
          totalCards: collectionCount || 0,
          totalValue,
          setsCompleted,
          wishlistItems: wishlistCount || 0,
          ordersPlaced: ordersCount || 0,
        };
      } catch (error) {
        console.error('Error in useUserProfile:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
}; 