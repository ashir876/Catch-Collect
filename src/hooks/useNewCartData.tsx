
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  id: string;
  user_id: string;
  article_number: string;
  price: number;
  quantity: number;
  created_at: string;
}

export const useNewCartData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('carts_with_id')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      return data as CartItem[];
    },
    enabled: !!user,
  });
};
