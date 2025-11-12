import { supabase } from '@/integrations/supabase/client';

export interface PokemonCardPrice {
  card_id: string;
  source: 'tcgplayer' | 'cardmarket';
  price_type: string;
  price: number;
  currency: string;
}

export interface PokemonCardData {
  id: string;
  name: string;
  set: {
    id: string;
    name: string;
  };
  number: string;
  tcgplayer?: {
    prices: Record<string, Record<string, number>>;
  };
  cardmarket?: {
    prices: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
}

export class PokemonTCGPriceUpdater {
  private apiKey: string;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly BASE_URL = 'https://api.pokemontcg.io/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchCardData(setCode: string, cardNumber: string): Promise<PokemonCardData | null> {
    await this.enforceRateLimit();
    
    const pokemonApiId = `${setCode}-${cardNumber}`;
    
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-Api-Key'] = this.apiKey;
      }

      const response = await fetch(
        `${this.BASE_URL}/cards/${pokemonApiId}`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Card not found: ${pokemonApiId}`);
          return null;
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching card ${pokemonApiId}:`, error);
      throw error;
    }
  }

  async searchCardByNameAndSet(name: string, setCode: string): Promise<PokemonCardData | null> {
    await this.enforceRateLimit();
    
    try {
      const normalizedName = this.normalizeCardName(name);
      const query = `name:"${normalizedName}" set.id:${setCode}`;
      
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['X-Api-Key'] = this.apiKey;
      }

      const response = await fetch(
        `${this.BASE_URL}/cards?q=${encodeURIComponent(query)}&pageSize=1`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error(`Error searching for card ${name} in set ${setCode}:`, error);
      throw error;
    }
  }

  async updateCardPrice(cardId: string, setCode: string, cardNumber: string): Promise<PokemonCardPrice[]> {
    const card = await this.fetchCardData(setCode, cardNumber);
    if (!card) {
      throw new Error(`Card not found: ${setCode}-${cardNumber}`);
    }

    const priceInserts: PokemonCardPrice[] = [];

    if (card.tcgplayer?.prices) {
      for (const [variant, prices] of Object.entries(card.tcgplayer.prices)) {
        if (prices && typeof prices === 'object') {
          for (const [priceType, value] of Object.entries(prices)) {
            if (typeof value === 'number' && value > 0) {
              priceInserts.push({
                card_id: cardId,
                source: 'tcgplayer',
                price_type: `${variant}_${priceType}`,
                price: value,
                currency: 'USD'
              });
            }
          }
        }
      }
    }

    if (card.cardmarket?.prices) {
      const cmPrices = card.cardmarket.prices;
      const priceFields = [
        'averageSellPrice',
        'lowPrice', 
        'trendPrice',
        'germanProLow',
        'suggestedPrice',
        'reverseHoloSell',
        'reverseHoloLow',
        'reverseHoloTrend',
        'lowPriceExPlus',
        'avg1',
        'avg7',
        'avg30',
        'reverseHoloAvg1',
        'reverseHoloAvg7',
        'reverseHoloAvg30'
      ];

      priceFields.forEach(field => {
        const value = cmPrices[field as keyof typeof cmPrices];
        if (typeof value === 'number' && value > 0) {
          priceInserts.push({
            card_id: cardId,
            source: 'cardmarket',
            price_type: field,
            price: value,
            currency: 'EUR'
          });
        }
      });
    }

    if (priceInserts.length > 0) {
      const { error } = await supabase
        .from('price_history' as any)
        .insert(priceInserts as any);

      if (error) {
        console.error('Error inserting price data:', error);
        throw error;
      }

      console.log(`✅ ${priceInserts.length} prices updated for ${card.name}`);
    }

    return priceInserts;
  }

  async batchUpdatePrices(cards: Array<{id: string, setCode: string, number: string}>): Promise<void> {
    const batchSize = 25; 
    
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(card => 
          this.updateCardPrice(card.id, card.setCode, card.number)
            .catch(err => console.error(`Error with ${card.id}:`, err))
        )
      );

      if (i + batchSize < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async updateSetPrices(setId: string): Promise<void> {
    
    const { data: cards, error } = await supabase
      .from('card_collections')
      .select('card_id, name, card_number')
      .eq('set_id', setId);

    if (error) {
      throw error;
    }

    if (!cards || cards.length === 0) {
      console.log(`No cards found for set ${setId}`);
      return;
    }

    const cardsToUpdate = cards
      .filter(card => card.card_number) 
      .map(card => ({
        id: card.card_id,
        setCode: setId,
        number: card.card_number!
      }));

    await this.batchUpdatePrices(cardsToUpdate);
  }

  async getCurrentPrices(cardId: string): Promise<PokemonCardPrice[]> {
    const { data, error } = await supabase
      .from('card_prices' as any)
      .select('*')
      .eq('card_id', cardId);

    if (error) {
      throw error;
    }

    const prices: PokemonCardPrice[] = [];
    if (data && data.length > 0) {
      const cardPrice = (data as any[])[0];
      if (cardPrice.avg_sell_price) {
        prices.push({
          card_id: cardId,
          source: 'cardmarket',
          price_type: 'averageSellPrice',
          price: cardPrice.avg_sell_price,
          currency: 'EUR'
        });
      }
      
    }

    return prices;
  }

  async getPriceHistory(cardId: string, days: number = 30): Promise<PokemonCardPrice[]> {
    console.log('pokemonTCGService: getPriceHistory called with cardId:', cardId, 'days:', days);
    try {
      console.log('pokemonTCGService: Calling Supabase RPC get_card_price_history');
    const { data, error } = await supabase
      .rpc('get_card_price_history' as any, {
        p_card_id: cardId,
        p_days: days
      });

      console.log('pokemonTCGService: Supabase response:', { data, error });

      if (error) {
        console.error('pokemonTCGService: Supabase error:', error);
        throw error;
      }

      console.log('pokemonTCGService: Returning data:', data);
      return data || [];
    } catch (error) {
      console.error('pokemonTCGService: Error fetching price history:', error);
      throw error;
    }
  }

  async getCollectionValueSummary(userId: string, language: string = 'DE'): Promise<{
    total_cards: number;
    total_value_usd: number;
    total_value_eur: number;
    value_change_30d_usd: number;
    value_change_30d_eur: number;
  } | null> {
    const { data, error } = await supabase
      .rpc('get_collection_value_summary' as any, {
        p_user_id: userId,
        p_language: language
      });

    if (error) {
      throw error;
    }

    return data?.[0] || null;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeWindow = 60 * 1000; 
    
    if (now - this.lastResetTime >= timeWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= 30) {
      const waitTime = timeWindow - (now - this.lastResetTime);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }
    
    this.requestCount++;
  }

  private normalizeCardName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[éè]/g, 'e')
      .replace(/&/g, 'and')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ') 
      .trim();
  }

  async findCardByNameAndNumber(name: string, setCode: string, number: string): Promise<PokemonCardData | null> {
    
    try {
      const card = await this.fetchCardData(setCode, number);
      if (card) return card;
    } catch (error) {
      console.warn(`Exact search failed for ${setCode}-${number}:`, error);
    }

    try {
      return await this.searchCardByNameAndSet(name, setCode);
    } catch (error) {
      console.warn(`Fuzzy search failed for ${name} in ${setCode}:`, error);
    }

    return null;
  }
}

export const pokemonTCGService = new PokemonTCGPriceUpdater(
  import.meta.env.VITE_POKEMON_TCG_API_KEY || ''
);
