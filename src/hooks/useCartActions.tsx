
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

interface AddToCartInput {
  article_number: string;
  price: number;
  quantity: number;
  product_name?: string;
  product_image?: string;
  product_rarity?: string;
}

export const useCartActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async (item: AddToCartInput) => {
      if (!user) {
        console.error('No user found in cart action');
        throw new Error('User not authenticated');
      }
      
      console.log('Adding to cart:', { user: user.id, item });

      // First, try to create a product entry if it doesn't exist
      // This handles the foreign key constraint issue
      try {
        const { error: productError } = await supabase
          .from('products')
          .upsert({
            article_number: item.article_number,
            card_id: item.article_number,
            name: item.product_name || item.article_number,
            price: item.price,
            language: 'en',
            set_id: 'shop',
            set_name: 'Shop Item',
            condition_symbol: 'NM',
            on_stock: true,
            stock: 999
          }, {
            onConflict: 'article_number'
          });

        if (productError) {
          console.error('Error creating/updating product:', productError);
          // Continue anyway - the cart insert might still work
        }
      } catch (error) {
        console.error('Error with product upsert:', error);
        // Continue anyway
      }

      // Now try to add to cart
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
        
        if (error) {
          console.error('Error updating existing cart item:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('carts')
          .insert({
            user_id: user.id,
            article_number: item.article_number,
            price: item.price,
            quantity: item.quantity || 1
          });
        
        if (error) {
          console.error('Error inserting new cart item:', error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast({
        title: t('messages.addedToCart'),
        description: 'Item has been added to your cart',
      });
    },
    onError: (error) => {
      console.error('Cart error details:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
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
