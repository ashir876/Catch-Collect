import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { pokemonTCGService, PokemonCardPrice } from '@/lib/pokemonTCGService';
import { supabase } from '@/integrations/supabase/client';

export interface CollectionValueSummary {
  total_cards: number;
  total_value_usd: number;
  total_value_eur: number;
  value_change_30d_usd: number;
  value_change_30d_eur: number;
}

export interface PriceHistoryData {
  recorded_at: string;
  source: string;
  price_type: string;
  price: number;
  currency: string;
}

export function usePokemonPricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collectionValue, setCollectionValue] = useState<CollectionValueSummary | null>(null);
  const [priceCache, setPriceCache] = useState<Record<string, PokemonCardPrice[]>>({});

  // Get collection value summary
  const fetchCollectionValue = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const summary = await pokemonTCGService.getCollectionValueSummary(user.id);
      setCollectionValue(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection value');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get current prices for a specific card
  const fetchCardPrices = useCallback(async (cardId: string) => {
    if (priceCache[cardId]) {
      return priceCache[cardId];
    }

    setLoading(true);
    setError(null);

    try {
      const prices = await pokemonTCGService.getCurrentPrices(cardId);
      setPriceCache(prev => ({ ...prev, [cardId]: prices }));
      return prices;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch card prices');
      return [];
    } finally {
      setLoading(false);
    }
  }, [priceCache]);

  // Get price history for a specific card
  const fetchPriceHistory = useCallback(async (cardId: string, days: number = 30): Promise<PriceHistoryData[]> => {
    console.log('usePokemonPricing: fetchPriceHistory called with cardId:', cardId, 'days:', days);
    setLoading(true);
    setError(null);

    try {
      console.log('usePokemonPricing: Calling pokemonTCGService.getPriceHistory');
      const history = await pokemonTCGService.getPriceHistory(cardId, days);
      console.log('usePokemonPricing: Received history from service:', history);
      return history as PriceHistoryData[];
    } catch (err) {
      console.error('usePokemonPricing: Error fetching price history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price history');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update prices for a specific card
  const updateCardPrices = useCallback(async (cardId: string, setCode: string, cardNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const prices = await pokemonTCGService.updateCardPrice(cardId, setCode, cardNumber);
      
      // Update cache
      setPriceCache(prev => ({ ...prev, [cardId]: prices }));
      
      // Refresh collection value if user is logged in
      if (user) {
        await fetchCollectionValue();
      }

      return prices;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update card prices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCollectionValue]);

  // Update prices for all cards in a set
  const updateSetPrices = useCallback(async (setId: string) => {
    setLoading(true);
    setError(null);

    try {
      await pokemonTCGService.updateSetPrices(setId);
      
      // Clear cache to force refresh
      setPriceCache({});
      
      // Refresh collection value if user is logged in
      if (user) {
        await fetchCollectionValue();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update set prices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCollectionValue]);

  // Get market price for a card (TCGPlayer market price)
  const getMarketPrice = useCallback((cardId: string): number | null => {
    const prices = priceCache[cardId];
    if (!prices) return null;

    const marketPrice = prices.find(
      price => price.source === 'tcgplayer' && price.price_type === 'normal_market'
    );

    return marketPrice?.price || null;
  }, [priceCache]);

  // Get CardMarket average price for a card
  const getCardMarketPrice = useCallback((cardId: string): number | null => {
    const prices = priceCache[cardId];
    if (!prices) return null;

    const cardMarketPrice = prices.find(
      price => price.source === 'cardmarket' && price.price_type === 'averageSellPrice'
    );

    return cardMarketPrice?.price || null;
  }, [priceCache]);

  // Get all prices for a card
  const getCardPrices = useCallback((cardId: string): PokemonCardPrice[] => {
    return priceCache[cardId] || [];
  }, [priceCache]);

  // Clear price cache
  const clearCache = useCallback(() => {
    setPriceCache({});
  }, []);

  // Subscribe to real-time price updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('price_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'price_history'
      }, (payload) => {
        // Refresh collection value when new prices are added
        fetchCollectionValue();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCollectionValue]);

  // Initial load of collection value
  useEffect(() => {
    if (user) {
      fetchCollectionValue();
    }
  }, [user, fetchCollectionValue]);

  return {
    loading,
    error,
    collectionValue,
    fetchCollectionValue,
    fetchCardPrices,
    fetchPriceHistory,
    updateCardPrices,
    updateSetPrices,
    getMarketPrice,
    getCardMarketPrice,
    getCardPrices,
    clearCache
  };
}
