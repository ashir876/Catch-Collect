
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { CartItem } from "./useNewCartData";

interface AddToCartInput {
  article_number: string;
  price: number;
  quantity: number;
}

export const useCartActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (item: AddToCartInput) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existingItem } = await supabase
        .from('carts')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('article_number', item.article_number)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('carts')
          .update({ quantity: existingItem.quantity + (item.quantity || 1) })
          .eq('id', existingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            article_number: item.article_number,
            price: item.price,
            quantity: item.quantity || 1
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast({
        title: t('messages.addedToCart'),
        description: t('cart.itemAdded'),
      });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await supabase.from('carts').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carts')
          .update({ quantity })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('carts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast({
        title: t('messages.removedFromCart'),
        description: t('cart.itemRemoved'),
      });
    }
  });

  return {
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    isLoading: addToCartMutation.isPending || updateQuantityMutation.isPending || removeItemMutation.isPending
  };
};
