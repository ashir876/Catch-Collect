
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useCollectionData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['collection', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching collection data for user:', user.id);
      
      const { data, error } = await supabase
        .from('card_collections')
        .select(`
          *,
          cards!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collection:', error);
        throw error;
      }

      console.log('Collection data fetched:', data?.length, 'cards');
      return data;
    },
    enabled: !!user,
  });
};
