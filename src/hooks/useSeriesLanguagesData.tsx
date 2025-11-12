import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSeriesLanguagesData = () => {
  return useQuery({
    queryKey: ['available-series-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('series')
        .select('language')
        .not('language', 'is', null); 

      if (error) {
        console.error('Error fetching available series languages:', error);
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
