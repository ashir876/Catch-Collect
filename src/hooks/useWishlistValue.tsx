import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentPrices } from "./useCurrentPrices";
import React from "react";

export interface WishlistItem {
  id: number;
  card_id: string;
  user_id: string;
  created_at: string;
  priority: number; 
  price?: number; 
  notes?: string;
  card?: {
    name: string;
    set_name: string;
    rarity?: string;
    image_url?: string;
  };
}

export interface CurrentPriceData {
  card_id: string;
  price: number;
  currency: string;
  last_updated: string;
}

export interface WishlistValueData {
  manualValue: number;
  automaticValue: number;
  totalCards: number;
  totalCardIds: string[];
  manualCardIds: string[];
  automaticCardIds: string[];
}

export interface WishlistValueSummary {
  total_value_manual_eur: number;
  total_value_automatic_eur: number;
  total_cards: number;
  cards_with_manual_price: number;
  cards_with_automatic_price: number;
  cards_both_prices: number;
  manual_value_per_card: number;
  automatic_value_per_card: number;
  high_priority_cards: number;
  medium_priority_cards: number;
  low_priority_cards: number;
}

export function useWishlistValue() {
  const { user } = useAuth();

  // Get wishlist items with manual prices - following the pattern from useWishlistData
  const { data: wishlistItems, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist-value-items', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Try the full query first with price column
      let wishlistQuery = supabase
        .from('card_wishlist')
        .select('id, card_id, user_id, created_at, priority, price, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      let { data: wishlistItems, error: wishlistError } = await wishlistQuery;

      // If there's an error about missing columns, use fallback
      if (wishlistError) {
        console.warn('Wishlist price column not found, using fallback:', wishlistError.message);
        
        let fallbackQuery = supabase
          .from('card_wishlist')
          .select('id, card_id, user_id, created_at, priority')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const { data: fallbackItems, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          console.error('Error with fallback query:', fallbackError);
          throw fallbackError;
        }

        // Add default price and notes
        wishlistItems = fallbackItems?.map((item: any) => ({
          ...item,
          price: 0,
          notes: ''
        })) || [];
      }

      if (!wishlistItems || wishlistItems.length === 0) {
        return [];
      }

      return wishlistItems as unknown as WishlistItem[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  // Get current prices for all cards
  const cardIds = wishlistItems?.map(item => item.card_id) || [];
  const { data: currentPrices = [], isLoading: pricesLoading } = useCurrentPrices(cardIds);

  // Calculate values
  const wishlistValueData: WishlistValueData | null = React.useMemo(() => {
    if (!wishlistItems || !currentPrices) return null;

    let manualValue = 0;
    let automaticValue = 0;
    const manualCardIds: string[] = [];
    const automaticCardIds: string[] = [];
    const totalCardIds = [...new Set(cardIds)];

    // Process each wishlist item
    wishlistItems.forEach((item: WishlistItem) => {
      const priority = item.priority || 1; // Default to medium priority
      const price = item.price || 0;

      // Manual value (user-entered prices)
      if (price > 0) {
        manualValue += price;
        manualCardIds.push(item.card_id);
      }

      // Automatic value (from card_prices avg_sell_price)
      const priceData = currentPrices.find((priceData: CurrentPriceData) => priceData.card_id === item.card_id);
      if (priceData?.price && priceData.price > 0) {
        automaticValue += priceData.price;
        automaticCardIds.push(item.card_id);
      }
    });

    return {
      manualValue,
      automaticValue,
      totalCards: totalCardIds.length,
      totalCardIds,
      manualCardIds: [...new Set(manualCardIds)],
      automaticCardIds: [...new Set(automaticCardIds)]
    };
  }, [wishlistItems, currentPrices, cardIds]);

  // Create summary for display
  const wishlistValueSummary: WishlistValueSummary | null = React.useMemo(() => {
    if (!wishlistValueData || !wishlistItems) return null;

    const {
      manualValue,
      automaticValue,
      totalCards,
      manualCardIds,
      automaticCardIds
    } = wishlistValueData;

    const cardsBothPrices = manualCardIds.filter(id => automaticCardIds.includes(id)).length;
    const cardsWithManualPrice = manualCardIds.length;
    const cardsWithAutomaticPrice = automaticCardIds.length;

    // Count priority breakdown
    const priorityBreakdown = wishlistItems.reduce((acc, item) => {
      const priority = item.priority || 1;
      if (priority === 2) acc.high++;
      else if (priority === 1) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    return {
      total_value_manual_eur: manualValue,
      total_value_automatic_eur: automaticValue,
      total_cards: totalCards,
      cards_with_manual_price: cardsWithManualPrice,
      cards_with_automatic_price: cardsWithAutomaticPrice,
      cards_both_prices: cardsBothPrices,
      manual_value_per_card: cardsWithManualPrice > 0 ? manualValue / cardsWithManualPrice : 0,
      automatic_value_per_card: cardsWithAutomaticPrice > 0 ? automaticValue / cardsWithAutomaticPrice : 0,
      high_priority_cards: priorityBreakdown.high,
      medium_priority_cards: priorityBreakdown.medium,
      low_priority_cards: priorityBreakdown.low
    };
  }, [wishlistValueData, wishlistItems]);

  return {
    data: wishlistValueData,
    summary: wishlistValueSummary,
    isLoading: wishlistLoading || pricesLoading,
    error: null,
    // Helper function to format currency
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  };
}

