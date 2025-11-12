
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Order {
  id: number;
  article_number: string; 
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: any[]; 
}

export const useOrdersData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      return (orders || []) as Order[];
    },
    enabled: !!user,
  });
};
