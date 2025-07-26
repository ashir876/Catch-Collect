
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SetsDataOptions {
  language?: string;
  seriesId?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
}

export const useSetsData = (options: SetsDataOptions = {}) => {
  const { 
    language, 
    seriesId, 
    limit, 
    offset = 0, 
    searchTerm 
  } = options;

  return useQuery({
    queryKey: ['sets', language, seriesId, limit, offset, searchTerm],
    queryFn: async () => {
      console.log('Fetching sets data:', { language, seriesId, limit, offset, searchTerm });
      
      let query = supabase
        .from('sets')
        .select('*')
        .order('name');

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (seriesId) {
        query = query.eq('series_id', seriesId);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
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

// Hook to get total count of sets for pagination
export const useSetsCount = (options: Omit<SetsDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, seriesId, searchTerm } = options;

  return useQuery({
    queryKey: ['sets-count', language, seriesId, searchTerm],
    queryFn: async () => {
      console.log('Fetching sets count:', { language, seriesId, searchTerm });
      
      let query = supabase
        .from('sets')
        .select('*', { count: 'exact', head: true });

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (seriesId) {
        query = query.eq('series_id', seriesId);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching sets count:', error);
        throw error;
      }

      console.log('Sets count fetched:', count);
      return count || 0;
    },
  });
};
