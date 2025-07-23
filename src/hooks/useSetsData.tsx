
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSetsData = (language: string = 'de', seriesId?: string) => {
  return useQuery({
    queryKey: ['sets', language, seriesId],
    queryFn: async () => {
      console.log('Fetching sets data:', { language, seriesId });
      
      let query = supabase
        .from('sets')
        .select('*')
        .eq('language', language)
        .order('name');

      if (seriesId) {
        query = query.eq('series_id', seriesId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sets:', error);
        throw error;
      }

      console.log('Sets data fetched:', data?.length, 'sets');
      return data;
    },
  });
};
