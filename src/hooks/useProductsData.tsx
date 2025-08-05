
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductsData = (language: string = 'de', limit: number = 50) => {
  return useQuery({
    queryKey: ['products', language, limit],
    queryFn: async () => {
    
      
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

      
      return data;
    },
  });
};
