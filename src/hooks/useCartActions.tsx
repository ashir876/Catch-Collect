
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';

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
      if (!user) {
        console.error('No user found in cart action');
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!item.article_number || !item.price) {
        console.error('Missing required fields:', item);
        throw new Error('Missing required product information');
      }
      
      console.log('Adding to cart:', { user: user.id, item });

      // Test database connection first
      try {
        console.log('Testing database connection to carts_with_id table...');
        const { data: testData, error: testError } = await (supabase as any)
          .from('carts_with_id')
          .select('count')
          .limit(1);
        
        console.log('Test query result:', { testData, testError });
        
        if (testError) {
          console.error('Database connection test failed:', testError);
          throw new Error(`Database connection failed: ${testError.message}`);
        }
        
        console.log('Database connection test successful');
      } catch (testError) {
        console.error('Database connection test error:', testError);
        throw new Error(`Database connection error: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
      }

      // Now try to add to cart - using type assertion to bypass TypeScript issues
      try {
        // First, ensure the product exists in the products table
        console.log('Ensuring product exists in products table...');
        const { error: productError } = await (supabase as any)
          .from('products')
          .upsert({
            article_number: item.article_number,
            card_id: item.article_number,
            name: item.article_number, // Use article_number as name for now
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
          throw new Error(`Failed to create product: ${productError.message}`);
        }
        console.log('Product created/updated successfully');

        console.log('Checking for existing cart item...');
        const { data: existingItems, error: fetchError } = await (supabase as any)
          .from('carts_with_id')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('article_number', item.article_number);

        console.log('Fetch existing items result:', { existingItems, fetchError });

        if (fetchError) {
          console.error('Error fetching existing cart items:', fetchError);
          throw fetchError;
        }

        const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;
        console.log('Existing item found:', existingItem);

        if (existingItem) {
          console.log('Updating existing cart item...');
          const { error } = await (supabase as any)
            .from('carts_with_id')
            .update({ quantity: existingItem.quantity + (item.quantity || 1) })
            .eq('id', existingItem.id);
          
          if (error) {
            console.error('Error updating existing cart item:', error);
            throw error;
          }
          console.log('Successfully updated existing cart item');
        } else {
          console.log('Inserting new cart item...');
          const insertData = {
            user_id: user.id,
            article_number: item.article_number,
            price: item.price,
            quantity: item.quantity || 1
          };
          console.log('Insert data:', insertData);
          
          const { error } = await (supabase as any)
            .from('carts_with_id')
            .insert(insertData);
          
          if (error) {
            console.error('Error inserting new cart item:', error);
            throw error;
          }
          console.log('Successfully inserted new cart item');
        }
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`);
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
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast({
        title: 'Error',
        description: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        const { error } = await (supabase as any).from('carts_with_id').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from('carts_with_id')
          .update({ quantity })
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
    onError: (error) => {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from('carts_with_id').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast({
        title: t('messages.removedFromCart'),
        description: t('cart.itemRemoved'),
      });
    },
    onError: (error) => {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      const { error } = await (supabase as any).from('carts_with_id').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
      toast({
        title: t('cart.cartCleared'),
        description: t('cart.allItemsRemoved'),
      });
    },
    onError: (error) => {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      });
    }
  });

  return {
    addToCart: addToCartMutation.mutateAsync,
    updateQuantity: updateQuantityMutation.mutateAsync,
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,
    isLoading: addToCartMutation.isPending || updateQuantityMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending
  };
};
