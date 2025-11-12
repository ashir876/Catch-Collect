
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

  const queryKey = [
    'series', 
    language || 'all', 
    limit, 
    offset, 
    searchTerm || ''
  ];

  return useQuery({
    queryKey,
    staleTime: 0, 
    refetchOnMount: true, 
    refetchOnWindowFocus: false, 
    queryFn: async () => {
      
      let query = supabase
        .from('series')
        .select('*')
        .order('series_name');

      if (language && language !== 'all') {
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

export const useSeriesCount = (options: Omit<SeriesDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, searchTerm } = options;

  const queryKey = [
    'series-count', 
    language || 'all', 
    searchTerm || ''
  ];

  return useQuery({
    queryKey,
    staleTime: 0, 
    refetchOnMount: true, 
    refetchOnWindowFocus: false, 
    queryFn: async () => {
    
      let query = supabase
        .from('series')
        .select('*', { count: 'exact', head: true });

      if (language && language !== 'all') {
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
