
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  id: number;
  user_id: string;
  article_number: string;
  quantity: number;
  price: number;
  created_at: string;
  product_name?: string;
  product_image?: string;
  product_rarity?: string;
  product_condition?: string;
}

export const useNewCartData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('carts')
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
