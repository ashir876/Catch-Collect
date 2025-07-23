
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductsData = (language: string = 'de', limit: number = 50) => {
  return useQuery({
    queryKey: ['products', language, limit],
    queryFn: async () => {
      console.log('Fetching products data:', { language, limit });
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('language', language)
        .eq('on_stock', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products data fetched:', data?.length, 'products');
      return data;
    },
  });
};
