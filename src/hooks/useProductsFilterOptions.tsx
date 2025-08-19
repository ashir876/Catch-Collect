import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductsFilterOptions = (language: string = 'en') => {
  return useQuery({
    queryKey: ['products-filter-options', language],
    queryFn: async () => {
      // Get all products for the specified language
      const { data: products, error } = await supabase
        .from('products')
        .select('rarity, illustrator, category, stage, evolvefrom, set_id, set_name, types')
        .eq('language', language)
        .eq('on_stock', true);

      if (error) {
        console.error('Error fetching products for filter options:', error);
        throw error;
      }

      // Extract unique values for each filter
      const rarities = [...new Set(products?.map(p => p.rarity).filter(Boolean))].sort();
      const illustrators = [...new Set(products?.map(p => p.illustrator).filter(Boolean))].sort();
      const categories = [...new Set(products?.map(p => p.category).filter(Boolean))].sort();
      const stages = [...new Set(products?.map(p => p.stage).filter(Boolean))].sort();
      const evolveFroms = [...new Set(products?.map(p => p.evolvefrom).filter(Boolean))].sort();
      
      // Get unique sets with their names
      const setsMap = new Map();
      products?.forEach(p => {
        if (p.set_id && p.set_name) {
          setsMap.set(p.set_id, p.set_name);
        }
      });
      const sets = Array.from(setsMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));

      // Get unique types from all products
      const allTypes = new Set<string>();
      products?.forEach(p => {
        if (p.types && Array.isArray(p.types)) {
          p.types.forEach(type => allTypes.add(type));
        }
      });
      const types = Array.from(allTypes).sort();

      return {
        rarities,
        illustrators,
        categories,
        stages,
        evolveFroms,
        sets,
        types
      };
    },
  });
};
