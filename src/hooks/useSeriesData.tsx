
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

  // Create a simpler query key
  const queryKey = [
    'series', 
    language || 'all', 
    limit, 
    offset, 
    searchTerm || ''
  ];
  


  return useQuery({
    queryKey,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    queryFn: async () => {
      
      let query = supabase
        .from('series')
        .select('*')
        .order('series_name');

      // Filter by language if provided
      if (language && language !== 'all') {
        query = query.eq('language', language);
      }

      // Filter by search term if provided
      if (searchTerm) {
        query = query.ilike('series_name', `%${searchTerm}%`);
      }

      // Apply pagination if limit is provided
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

  // Create a simpler query key
  const queryKey = [
    'series-count', 
    language || 'all', 
    searchTerm || ''
  ];

  return useQuery({
    queryKey,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    queryFn: async () => {
    
      let query = supabase
        .from('series')
        .select('*', { count: 'exact', head: true });

      // Filter by language if provided
      if (language && language !== 'all') {
        query = query.eq('language', language);
      }

      // Filter by search term if provided
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
