import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentPrices } from "./useCurrentPrices";
import React from "react";

export interface CollectionItem {
  id: string;
  card_id: string;
  price?: number;
  quantity?: number;
  condition?: string;
  created_at: string;
  language?: string;
  name?: string;
  set_name?: string;
  set_id?: string;
  card_number?: string;
  rarity?: string;
  image_url?: string;
  description?: string;
  illustrator?: string;
  hp?: number;
  types?: string[];
  attacks?: unknown;
  weaknesses?: unknown;
  retreat?: number;
  cards?: {
    card_id: string;
    name: string;
    set_name: string;
    rarity: string;
    image_url: string;
    language: string;
  };
}

export interface CurrentPriceData {
  card_id: string;
  price: number;
  currency: string;
  last_updated: string;
}

export interface CollectionValueData {
  manualValue: number;
  automaticValue: number;
  totalCards: number;
  totalCardIds: string[];
  manualCardIds: string[];
  automaticCardIds: string[];
}

export interface CollectionValueSummary {
  total_value_manual_eur: number;
  total_value_automatic_eur: number;
  total_cards: number;
  cards_with_manual_price: number;
  cards_with_automatic_price: number;
  cards_both_prices: number;
  manual_value_per_card: number;
  automatic_value_per_card: number;
}

export function useCollectionValue() {
  const { user } = useAuth();

  // Get collection items with manual prices - same structure as useCollectionData
  const { data: collectionItems, isLoading: collectionLoading } = useQuery({
    queryKey: ['collection-value-items', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: collectionItems, error: collectionError } = await supabase
        .from('card_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (collectionError) {
        console.error('Error fetching collection items:', collectionError);
        throw collectionError;
      }

      if (!collectionItems || collectionItems.length === 0) {
        return [];
      }

      return collectionItems as unknown as CollectionItem[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });

  // Get current prices for all cards
  const cardIds = collectionItems?.map(item => item.card_id) || [];
  const { data: currentPrices = [], isLoading: pricesLoading } = useCurrentPrices(cardIds);

  // Calculate values
  const collectionValueData: CollectionValueData | null = React.useMemo(() => {
    if (!collectionItems || !currentPrices) return null;

    let manualValue = 0;
    let automaticValue = 0;
    const manualCardIds: string[] = [];
    const automaticCardIds: string[] = [];
    const totalCardIds = [...new Set(cardIds)];

    // Process each collection item
    collectionItems.forEach((item: CollectionItem) => {
      const quantity = item.quantity || 1;
      const price = item.price || 0;

      // Manual value (user-entered prices)
      if (price > 0) {
        manualValue += price * quantity;
        manualCardIds.push(item.card_id);
      }

      // Automatic value (from card_prices avg_sell_price)
      const priceData = currentPrices.find((priceData: CurrentPriceData) => priceData.card_id === item.card_id);
      if (priceData?.price && priceData.price > 0) {
        automaticValue += priceData.price * quantity;
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
  }, [collectionItems, currentPrices, cardIds]);

  // Create summary for display
  const collectionValueSummary: CollectionValueSummary | null = React.useMemo(() => {
    if (!collectionValueData) return null;

    const {
      manualValue,
      automaticValue,
      totalCards,
      manualCardIds,
      automaticCardIds
    } = collectionValueData;

    const cardsBothPrices = manualCardIds.filter(id => automaticCardIds.includes(id)).length;
    const cardsWithManualPrice = manualCardIds.length;
    const cardsWithAutomaticPrice = automaticCardIds.length;

    return {
      total_value_manual_eur: manualValue,
      total_value_automatic_eur: automaticValue,
      total_cards: totalCards,
      cards_with_manual_price: cardsWithManualPrice,
      cards_with_automatic_price: cardsWithAutomaticPrice,
      cards_both_prices: cardsBothPrices,
      manual_value_per_card: cardsWithManualPrice > 0 ? manualValue / cardsWithManualPrice : 0,
      automatic_value_per_card: cardsWithAutomaticPrice > 0 ? automaticValue / cardsWithAutomaticPrice : 0
    };
  }, [collectionValueData]);

  return {
    data: collectionValueData,
    summary: collectionValueSummary,
    isLoading: collectionLoading || pricesLoading,
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

