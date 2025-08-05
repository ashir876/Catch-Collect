
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CardsDataOptions {
  language?: string;
  setId?: string;
  limit?: number;
  offset?: number;
  searchTerm?: string;
}

export const useCardsData = (options: CardsDataOptions = {}) => {
  const { 
    language, 
    setId, 
    limit, 
    offset = 0, 
    searchTerm 
  } = options;

  return useQuery({
    queryKey: ['cards', language, setId, limit, offset, searchTerm],
    queryFn: async () => {
    
      
      let query = supabase
        .from('cards')
        .select('*')
        .order('name');

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (setId) {
        query = query.eq('set_id', setId);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cards:', error);
        throw error;
      }

      
      return data;
    },
  });
};

// Hook to get total count of cards for pagination
export const useCardsCount = (options: Omit<CardsDataOptions, 'limit' | 'offset'> = {}) => {
  const { language, setId, searchTerm } = options;

  return useQuery({
    queryKey: ['cards-count', language, setId, searchTerm],
    queryFn: async () => {
    
      
      let query = supabase
        .from('cards')
        .select('*', { count: 'exact', head: true });

      // Only filter by language if explicitly provided
      if (language) {
        query = query.eq('language', language);
      }

      if (setId) {
        query = query.eq('set_id', setId);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { count, error } = await query;

      if (error) {
        console.error('Error fetching cards count:', error);
        throw error;
      }

      
      return count || 0;
    },
  });
};
