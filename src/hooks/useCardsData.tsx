
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCardsData = (language: string = 'de', setId?: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['cards', language, setId, limit],
    queryFn: async () => {
      console.log('Fetching cards data:', { language, setId, limit });
      
      let query = supabase
        .from('cards')
        .select('*')
        .eq('language', language)
        .order('name')
        .limit(limit);

      if (setId) {
        query = query.eq('set_id', setId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cards:', error);
        throw error;
      }

      console.log('Cards data fetched:', data?.length, 'cards');
      return data;
    },
  });
};
