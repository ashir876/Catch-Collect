
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SetsDataOptions {
  language?: string;
  seriesId?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
  sortBy?: string;
}

export const useSetsData = (options: SetsDataOptions = {}) => {
  const { 
    language, 
    seriesId, 
    limit, 
    offset = 0, 
    searchTerm,
    sortBy = 'newest'
  } = options;

  const queryKey = [
    'sets', 
    language || 'all', 
    seriesId || 'all', 
    limit, 
    offset, 
    searchTerm || '',
    sortBy
  ];

  return useQuery({
    queryKey,
    staleTime: 0, 
    refetchOnMount: true, 
    refetchOnWindowFocus: false, 
    queryFn: async () => {
      
      let query = supabase
        .from('sets')
        .select('*');

      switch (sortBy) {
        case 'oldest':
          query = query.order('release_date', { ascending: true, nullsFirst: true }).order('name', { ascending: true });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('release_date', { ascending: false, nullsFirst: false }).order('name', { ascending: true });
          break;
      }

      if (language && language !== 'all') {
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
      return data;
    },
  });
};

export const useSetsCount = (options: Omit<SetsDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, seriesId, searchTerm } = options;

  const queryKey = [
    'sets-count', 
    language || 'all', 
    seriesId || 'all', 
    searchTerm || ''
  ];

  return useQuery({
    queryKey,
    staleTime: 0, 
    refetchOnMount: true, 
    refetchOnWindowFocus: false, 
    queryFn: async () => {
    
      let query = supabase
        .from('sets')
        .select('*', { count: 'exact', head: true });

      if (language && language !== 'all') {
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

      return count || 0;
    },
  });
};
