# Pokemon TCG API Integration with Pricing Data

This document describes the implementation of Pokemon TCG API integration for real-time pricing data in the Catch & Collect application.

## Overview

The integration provides:
- **Real-time pricing data** from TCGPlayer (USD) and CardMarket (EUR)
- **Price history tracking** with trend analysis
- **Collection value calculation** based on current market prices
- **Automatic price updates** with rate limiting
- **Multi-language support** (English, German, Dutch)

## API Configuration

### Pokemon TCG API Setup

1. **Get API Key** (Optional but recommended):
   - Visit: https://dev.pokemontcg.io
   - Register for a free account
   - Get your API key

2. **Environment Variables**:
   ```env
   VITE_POKEMON_TCG_API_KEY=your_api_key_here
   ```

3. **Rate Limits**:
   - Without API key: 1,000 requests/day, 30/minute
   - With API key: 20,000 requests/day, 30/minute

## Database Schema

### Price History Table

```sql
CREATE TABLE price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('tcgplayer', 'cardmarket')),
  price_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT unique_card_source_type_time 
    UNIQUE(card_id, source, price_type, recorded_at)
);
```

### Views

- **current_prices**: Latest prices for each card/source/type combination
- **price_trends**: 30-day price trends with statistics

### Functions

- **get_collection_value_summary()**: Calculate total collection value
- **get_card_price_history()**: Get price history for a specific card
- **update_card_price_manual()**: Manual price updates

## Components

### 1. CollectionValueDisplay

Displays total collection value with price changes.

```tsx
import { CollectionValueDisplay } from '@/components/pricing/CollectionValueDisplay';

<CollectionValueDisplay 
  className="mb-4" 
  showRefreshButton={true} 
/>
```

**Features:**
- Total value in USD and EUR
- 30-day value change
- Price source indicators
- Refresh functionality

### 2. CardPriceDisplay

Shows individual card prices with update functionality.

```tsx
import { CardPriceDisplay } from '@/components/pricing/CardPriceDisplay';

<CardPriceDisplay
  cardId="card-123"
  setCode="base1"
  cardNumber="4"
  cardName="Charizard"
  showHistory={true}
/>
```

**Features:**
- TCGPlayer market price (USD)
- CardMarket average price (EUR)
- All available price types
- Price history toggle
- Manual price updates

### 3. PriceTrendChart

Displays price trends with interactive charts.

```tsx
import { PriceTrendChart } from '@/components/pricing/PriceTrendChart';

<PriceTrendChart
  cardId="card-123"
  showControls={true}
/>
```

**Features:**
- Time range selection (7D, 30D, 90D, 1Y, All)
- Price change calculations
- Simple bar chart visualization
- Multiple price sources

## React Hook: usePokemonPricing

Centralized state management for pricing data.

```tsx
import { usePokemonPricing } from '@/hooks/usePokemonPricing';

const {
  loading,
  error,
  collectionValue,
  fetchCollectionValue,
  fetchCardPrices,
  updateCardPrices,
  getMarketPrice,
  getCardMarketPrice
} = usePokemonPricing();
```

**Key Methods:**
- `fetchCollectionValue()`: Get total collection value
- `fetchCardPrices(cardId)`: Get prices for specific card
- `updateCardPrices(cardId, setCode, cardNumber)`: Update card prices
- `getMarketPrice(cardId)`: Get TCGPlayer market price
- `getCardMarketPrice(cardId)`: Get CardMarket average price

## Service Class: PokemonTCGPriceUpdater

Handles API interactions with rate limiting.

```tsx
import { pokemonTCGService } from '@/lib/pokemonTCGService';

// Update single card
await pokemonTCGService.updateCardPrice(cardId, setCode, cardNumber);

// Update entire set
await pokemonTCGService.updateSetPrices(setId);

// Get collection value
const summary = await pokemonTCGService.getCollectionValueSummary(userId);
```

## Price Data Sources

### TCGPlayer (USD)
- **Market Price**: Current market value
- **Low Price**: Lowest available price
- **High Price**: Highest available price
- **Mid Price**: Average of low and high

### CardMarket (EUR)
- **Average Sell Price**: Average selling price
- **Low Price**: Lowest available price
- **Trend Price**: Price trend indicator
- **German Pro Low**: German professional seller low price
- **Suggested Price**: Recommended selling price

## Usage Examples

### 1. Display Collection Value

```tsx
import { CollectionValueDisplay } from '@/components/pricing/CollectionValueDisplay';

function CollectionPage() {
  return (
    <div>
      <h1>My Collection</h1>
      <CollectionValueDisplay />
    </div>
  );
}
```

### 2. Show Card Prices in Detail View

```tsx
import { CardPriceDisplay } from '@/components/pricing/CardPriceDisplay';

function CardDetailPage({ card }) {
  return (
    <div>
      <h1>{card.name}</h1>
      <CardPriceDisplay
        cardId={card.id}
        setCode={card.set_id}
        cardNumber={card.card_number}
        cardName={card.name}
        showHistory={true}
      />
    </div>
  );
}
```

### 3. Price Trends in Card Grid

```tsx
import { PriceTrendChart } from '@/components/pricing/PriceTrendChart';

function CardGrid({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => (
        <div key={card.id}>
          <img src={card.image_url} alt={card.name} />
          <h3>{card.name}</h3>
          <PriceTrendChart cardId={card.id} showControls={false} />
        </div>
      ))}
    </div>
  );
}
```

### 4. Manual Price Updates

```tsx
import { usePokemonPricing } from '@/hooks/usePokemonPricing';

function AdminPanel() {
  const { updateSetPrices, loading } = usePokemonPricing();

  const handleUpdateSet = async (setId: string) => {
    try {
      await updateSetPrices(setId);
      alert('Prices updated successfully!');
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleUpdateSet('base1')}
        disabled={loading}
      >
        Update Base Set Prices
      </button>
    </div>
  );
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **API Rate Limiting**: Automatic delays between requests
2. **Network Errors**: Retry mechanisms with exponential backoff
3. **Missing Data**: Graceful fallbacks for cards without pricing
4. **User Feedback**: Loading states and error messages

## Performance Considerations

1. **Caching**: Price data is cached in React state
2. **Batch Updates**: Multiple cards updated in batches
3. **Rate Limiting**: Respects API limits automatically
4. **Lazy Loading**: Prices loaded on demand

## Monitoring and Analytics

Track pricing data usage:

```tsx
// Log price updates
console.log(`✅ ${priceInserts.length} prices updated for ${card.name}`);

// Monitor API usage
console.log(`API requests: ${requestCount}/30 per minute`);
```

## Future Enhancements

1. **Advanced Charts**: Integration with Chart.js or D3.js
2. **Price Alerts**: Notifications for significant price changes
3. **Portfolio Tracking**: Investment tracking features
4. **Market Analysis**: Advanced price analytics
5. **Export Features**: CSV/PDF reports

## Troubleshooting

### Common Issues

1. **No Price Data**:
   - Check if card has valid set code and number
   - Verify API key is configured
   - Check rate limits

2. **Slow Updates**:
   - API rate limiting is active
   - Large collections may take time
   - Check network connectivity

3. **Incorrect Prices**:
   - Verify card identification (set code + number)
   - Check price source (TCGPlayer vs CardMarket)
   - Ensure currency conversion is correct

### Debug Mode

Enable debug logging:

```tsx
// In pokemonTCGService.ts
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('API Request:', `${BASE_URL}/cards/${pokemonApiId}`);
}
```

## Support

For issues with the Pokemon TCG API integration:

1. Check the [Pokemon TCG API documentation](https://docs.pokemontcg.io/)
2. Verify your API key and rate limits
3. Review the error logs in browser console
4. Test with a simple card first (e.g., base1-4 for Charizard)

## License

This integration uses the Pokemon TCG API which is free for non-commercial use. For commercial applications, review the [API terms of service](https://dev.pokemontcg.io/terms).
