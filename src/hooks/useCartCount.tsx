import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCartCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!user,
  });
}; 