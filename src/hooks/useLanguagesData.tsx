import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useLanguagesData = () => {
  return useQuery({
    queryKey: ['available-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('language')
        .not('language', 'is', null); 

      if (error) {
        console.error('Error fetching available languages:', error);
        throw error;
      }

      const uniqueLanguages = [...new Set(data.map(item => item.language))]
        .filter(Boolean) 
        .sort();

      return uniqueLanguages;
    },
    staleTime: 5 * 60 * 1000, 
  });
};
