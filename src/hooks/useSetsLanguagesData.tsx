import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSetsLanguagesData = () => {
  return useQuery({
    queryKey: ['available-sets-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('language')
        .not('language', 'is', null); 

      if (error) {
        console.error('Error fetching available sets languages:', error);
        throw error;
      }

      const uniqueLanguages = [...new Set(data.map(item => item.language))]
        .filter(Boolean) 
        .sort();

      console.log('🔍 Sets language data from database:', {
        totalRecords: data.length,
        allLanguages: data.map(item => item.language),
        uniqueLanguages: uniqueLanguages,
        uniqueCount: uniqueLanguages.length
      });

      return uniqueLanguages;
    },
    staleTime: 5 * 60 * 1000, 
  });
};
