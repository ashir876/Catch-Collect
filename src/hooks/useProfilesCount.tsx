import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUsersCount = () => {
  return useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching users count:', error);
        throw error;
      }

      return count || 0;
    },
  });
};
