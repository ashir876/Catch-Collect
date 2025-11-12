import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityItem {
  id: string;
  type: 'purchase' | 'wishlist' | 'collection';
  description: string;
  date: string;
  value?: number;
  card_id?: string;
  set_name?: string;
  card_name?: string;
}

export const useRecentActivity = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-activity', user?.id, limit],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!user) return [];

      try {
        const activities: ActivityItem[] = [];

        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
        } else if (orders) {
          
          for (const order of orders) {
            const { data: product } = await supabase
              .from('products')
              .select('name, set_name')
              .eq('article_number', order.article_number)
              .single();

            activities.push({
              id: `order-${order.id}`,
              type: 'purchase',
              description: product ? `${product.name} gekauft` : `Bestellung #${order.id}`,
              date: order.created_at || new Date().toISOString(),
              value: order.total || 0,
              card_name: product?.name,
              set_name: product?.set_name,
            });
          }
        }

        const { data: collectionItems, error: collectionError } = await supabase
          .from('card_collections')
          .select('*, cards(name, set_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (collectionError) {
          console.error('Error fetching collection items:', collectionError);
        } else if (collectionItems) {
          for (const item of collectionItems) {
            activities.push({
              id: `collection-${item.id}`,
              type: 'collection',
              description: item.cards?.name ? `${item.cards.name} zur Sammlung hinzugefügt` : 'Karte zur Sammlung hinzugefügt',
              date: item.created_at,
              card_id: item.card_id,
              card_name: item.cards?.name,
              set_name: item.cards?.set_name,
            });
          }
        }

        const { data: wishlistItems, error: wishlistError } = await supabase
          .from('card_wishlist')
          .select('*, cards(name, set_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (wishlistError) {
          console.error('Error fetching wishlist items:', wishlistError);
        } else if (wishlistItems) {
          for (const item of wishlistItems) {
            activities.push({
              id: `wishlist-${item.id}`,
              type: 'wishlist',
              description: item.cards?.name ? `${item.cards.name} zur Wunschliste hinzugefügt` : 'Karte zur Wunschliste hinzugefügt',
              date: item.created_at,
              card_id: item.card_id,
              card_name: item.cards?.name,
              set_name: item.cards?.set_name,
            });
          }
        }

        return activities
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);

      } catch (error) {
        console.error('Error in useRecentActivity:', error);
        throw error;
      }
    },
    enabled: !!user,
  });
}; 