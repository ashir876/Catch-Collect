
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SeriesDataOptions {
  language?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
}

export const useSeriesData = (options: SeriesDataOptions = {}) => {
  const { 
    language = 'de', 
    limit, 
    offset = 0, 
    searchTerm 
  } = options;

  return useQuery({
    queryKey: ['series', language, limit, offset, searchTerm],
    queryFn: async () => {
      console.log('Fetching series data:', { language, limit, offset, searchTerm });
      
      let query = supabase
        .from('series')
        .select('*')
        .eq('language', language)
        .order('series_name');

      if (searchTerm) {
        query = query.ilike('series_name', `%${searchTerm}%`);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching series:', error);
        throw error;
      }

      console.log('Series data fetched:', data?.length, 'series');
      return data;
    },
  });
};

// Hook to get total count of series for pagination
export const useSeriesCount = (options: Omit<SeriesDataOptions, 'limit' | 'offset'> = {}) => {
  const { language = 'de', searchTerm } = options;

  return useQuery({
    queryKey: ['series-count', language, searchTerm],
    queryFn: async () => {
      console.log('Fetching series count:', { language, searchTerm });
      
      let query = supabase
        .from('series')
        .select('*', { count: 'exact', head: true })
        .eq('language', language);

      if (searchTerm) {
        query = query.ilike('series_name', `%${searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching series count:', error);
        throw error;
      }

      console.log('Series count fetched:', count);
      return count || 0;
    },
  });
};
