import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { COLLECTION_QUERY_KEY } from "./useCollectionData";

export const useCollectionActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Callback functions for modal closing
  const [onCollectionSuccess, setOnCollectionSuccess] = useState<(() => void) | null>(null);

  // Add to Collection
  const addToCollection = useMutation({
    mutationFn: async ({ 
      cardId, 
      cardName, 
      cardLanguage,
      condition,
      price,
      date,
      notes,
      quantity,
      acquiredDate
    }: { 
      cardId: string; 
      cardName: string; 
      cardLanguage?: string;
      condition?: string;
      price?: number;
      date?: string;
      notes?: string;
      quantity?: number;
      acquiredDate?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

             // Check if already in collection
       const { data: existingItem, error: checkError } = await supabase
         .from('card_collections')
         .select('id')
         .eq('user_id', user.id)
         .eq('card_id', cardId)
         .single();

       if (checkError && checkError.code !== 'PGRST116') {
         throw checkError;
       }

       if (existingItem) {
         throw new Error("Card already in collection");
       }

      // Get card data
      let query = supabase.from('cards').select('*').eq('card_id', cardId);
      if (cardLanguage) {
        query = query.eq('language', cardLanguage);
      }
      const { data: cardData, error: cardError } = await query.single();

      if (cardError) {
        throw cardError;
      }

             // Add to collection
       const { error } = await supabase
         .from('card_collections')
         .insert({
           user_id: user.id,
           card_id: cardId,
           language: cardData.language,
           name: cardData.name,
           set_name: cardData.set_name,
           set_id: cardData.set_id,
           card_number: cardData.card_number,
           rarity: cardData.rarity,
           image_url: cardData.image_url,
           description: cardData.description,
           illustrator: cardData.illustrator,
           hp: cardData.hp,
           types: cardData.types,
           attacks: cardData.attacks,
           weaknesses: cardData.weaknesses,
           retreat: cardData.retreat,
           condition: condition || 'Near Mint',
           price: price || 0,
           notes: notes || '',
           created_at: date ? new Date(date).toISOString() : new Date().toISOString()
         });

             if (error) throw error;
      return { cardId, cardData };
    },
    onMutate: async ({ cardId, cardName }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: COLLECTION_QUERY_KEY(user?.id) });
      
      const previousData = queryClient.getQueryData(COLLECTION_QUERY_KEY(user?.id));
      
      queryClient.setQueryData(COLLECTION_QUERY_KEY(user?.id), (oldData: any) => {
        if (!oldData) return oldData;
        
        const newCollectionItem = {
          id: Date.now(),
          card_id: cardId,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          cards: { name: cardName }
        };
        
        return [newCollectionItem, ...oldData];
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(COLLECTION_QUERY_KEY(user?.id), context.previousData);
      }
      
             toast({
         title: t('messages.error'),
         description: error.message === "Card already in collection" 
           ? t('messages.alreadyInCollection') 
           : t('messages.collectionError'),
         variant: "destructive",
       });
    },
    onSuccess: (data) => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY(user?.id) });
      queryClient.invalidateQueries({ queryKey: ['collection-check', user?.id, data.cardId] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user?.id] });
      
      // Close modal if callback is set
      if (onCollectionSuccess) {
        onCollectionSuccess();
        setOnCollectionSuccess(null);
      }
      
      toast({
        title: t('messages.addedToCollection'),
        description: `${data.cardData.name} ${t('messages.addedToCollection').toLowerCase()}.`,
      });
    },
  });

  // Remove from Collection
  const removeFromCollection = useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('card_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);

      if (error) throw error;
      return { cardId };
    },
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: COLLECTION_QUERY_KEY(user?.id) });
      
      const previousData = queryClient.getQueryData(COLLECTION_QUERY_KEY(user?.id));
      
      queryClient.setQueryData(COLLECTION_QUERY_KEY(user?.id), (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((item: any) => item.card_id !== cardId);
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(COLLECTION_QUERY_KEY(user?.id), context.previousData);
      }
      
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY(user?.id) });
      queryClient.invalidateQueries({ queryKey: ['collection-check', user?.id, data.cardId] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user?.id] });
      
      toast({
        title: t('messages.removedFromCollection'),
        description: t('messages.removedFromCollectionDescription'),
      });
    },
  });

  return {
    addToCollection: addToCollection.mutate,
    removeFromCollection: removeFromCollection.mutate,
    isAddingToCollection: addToCollection.isPending,
    isRemovingFromCollection: removeFromCollection.isPending,
    setOnCollectionSuccess,
  };
};

export const useWishlistActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Callback functions for modal closing
  const [onWishlistSuccess, setOnWishlistSuccess] = useState<(() => void) | null>(null);



  // Add to Wishlist
  const addToWishlist = useMutation({
    mutationFn: async ({ 
      cardId, 
      cardName, 
      cardLanguage, 
      priority = 1, 
      notes = "",
      price = 0
    }: { 
      cardId: string; 
      cardName: string; 
      cardLanguage?: string; 
      priority?: number | string; 
      notes?: string; 
      price?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Check if already in wishlist
      const { data: existingItems, error: checkError } = await supabase
        .from('card_wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId);

      if (checkError) throw checkError;

      if (existingItems && existingItems.length > 0) {
        throw new Error("Card already in wishlist");
      }

      // Get card data
      let query = supabase.from('cards').select('language').eq('card_id', cardId);
      if (cardLanguage) {
        query = query.eq('language', cardLanguage);
      }
      const { data: cardData, error: cardError } = await query.single();

      if (cardError) throw cardError;

      // Convert priority string to number
      let priorityNumber = 1; // default medium
      if (typeof priority === 'string') {
        switch (priority) {
          case 'low':
            priorityNumber = 0;
            break;
          case 'high':
            priorityNumber = 2;
            break;
          default:
            priorityNumber = 1; // medium
        }
      } else {
        priorityNumber = priority;
      }

      // Add to wishlist - try with price and notes first, fallback to basic insert if columns don't exist
      let insertData: any = {
        user_id: user.id,
        card_id: cardId,
        language: cardData.language || 'en',
        priority: priorityNumber
      };

      // Try to add price and notes if they exist
      if (price !== undefined) {
        insertData.price = price;
      }
      if (notes !== undefined) {
        insertData.notes = notes;
      }

      const { error } = await supabase
        .from('card_wishlist')
        .insert(insertData);

      if (error) {
        console.error('Supabase insert error:', error);
        // If it's a column error, provide a more helpful message
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          throw new Error('Database schema needs to be updated. Please run the SQL script to add price and notes columns.');
        }
        throw error;
      }
      return { cardId, cardName };
    },
    onMutate: async ({ cardId, cardName }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });
      
      const previousData = queryClient.getQueryData(['wishlist', user?.id]);
      
      queryClient.setQueryData(['wishlist', user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        
        const newWishlistItem = {
          id: Date.now(),
          card_id: cardId,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          priority: 1,
          card: { name: cardName }
        };
        
        return [newWishlistItem, ...oldData];
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['wishlist', user?.id], context.previousData);
      }
      
      let errorMessage = t('messages.wishlistError');
      if (error.message === "Card already in wishlist") {
        errorMessage = t('messages.alreadyInWishlist');
      } else if (error.message.includes('Database schema needs to be updated')) {
        errorMessage = 'Database needs to be updated. Please contact support or run the provided SQL script.';
      }
      
      toast({
        title: t('messages.error'),
        description: errorMessage,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', user?.id, data.cardId] });
      
      // Close modal if callback is set
      if (onWishlistSuccess) {
        onWishlistSuccess();
        setOnWishlistSuccess(null);
      }
      
      toast({
        title: t('messages.addedToWishlist'),
        description: `${data.cardName} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    },
  });

  // Remove from Wishlist
  const removeFromWishlist = useMutation({
    mutationFn: async ({ cardId }: { cardId: string }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('card_wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);

      if (error) throw error;
      return { cardId };
    },
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist', user?.id] });
      
      const previousData = queryClient.getQueryData(['wishlist', user?.id]);
      
      queryClient.setQueryData(['wishlist', user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((item: any) => item.card_id !== cardId);
      });

      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['wishlist', user?.id], context.previousData);
      }
      
      toast({
        title: t('messages.error'),
        description: t('messages.wishlistError'),
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-check', user?.id, data.cardId] });
      
      toast({
        title: t('messages.removedFromWishlist'),
        description: t('messages.removedFromWishlistDescription'),
      });
    },
  });

  return {
    addToWishlist: addToWishlist.mutate,
    removeFromWishlist: removeFromWishlist.mutate,
    isAddingToWishlist: addToWishlist.isPending,
    isRemovingFromWishlist: removeFromWishlist.isPending,
    setOnWishlistSuccess,
  };
};
