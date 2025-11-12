
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
  
  product_name?: string;
  product_image?: string;
  product_rarity?: string;
}

export const useNewCartData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('carts_with_id')
        .select(`
          *,
          products!carts_article_number_fkey (
            name,
            image_url,
            rarity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      const transformedData = data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        article_number: item.article_number,
        price: item.price,
        quantity: item.quantity,
        created_at: item.created_at,
        product_name: item.products?.name,
        product_image: item.products?.image_url,
        product_rarity: item.products?.rarity,
      })) || [];

      return transformedData as CartItem[];
    },
    enabled: !!user,
  });
};
