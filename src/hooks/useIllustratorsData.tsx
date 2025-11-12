import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useIllustratorsData = () => {
  return useQuery({
    queryKey: ['illustrators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cards')
        .select('illustrator')
        .not('illustrator', 'is', null)
        .not('illustrator', 'eq', '')
        .order('illustrator');

      if (error) {
        console.error('Error fetching illustrators:', error);
        throw error;
      }

      const uniqueIllustrators = [...new Set(data?.map(card => card.illustrator).filter(Boolean))];
      return uniqueIllustrators;
    },
  });
}; 