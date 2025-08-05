
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
    language, 
    limit, 
    offset = 0, 
    searchTerm 
  } = options;

  return useQuery({
    queryKey: ['series', language, limit, offset, searchTerm],
    queryFn: async () => {
    
      
      let query = supabase
        .from('series')
        .select('*')
        .order('series_name');

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

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

      
      return data;
    },
  });
};

// Hook to get total count of series for pagination
export const useSeriesCount = (options: Omit<SeriesDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, searchTerm } = options;

  return useQuery({
    queryKey: ['series-count', language, searchTerm],
    queryFn: async () => {
    
      
      let query = supabase
        .from('series')
        .select('*', { count: 'exact', head: true });

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (searchTerm) {
        query = query.ilike('series_name', `%${searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching series count:', error);
        throw error;
      }

      
      return count || 0;
    },
  });
};
