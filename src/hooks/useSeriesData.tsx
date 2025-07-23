
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSeriesData = (language: string = 'de') => {
  return useQuery({
    queryKey: ['series', language],
    queryFn: async () => {
      console.log('Fetching series data for language:', language);
      
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('language', language)
        .order('series_name');

      if (error) {
        console.error('Error fetching series:', error);
        throw error;
      }

      console.log('Series data fetched:', data);
      return data;
    },
  });
};
