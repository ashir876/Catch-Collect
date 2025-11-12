import React from 'react';
import { CardPriceSummary } from '@/hooks/useCardPrices';

interface CardPriceDisplayProps {
  priceData?: CardPriceSummary | null;
  showSource?: boolean;
  showTrend?: boolean;
  compact?: boolean;
  className?: string;
}

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const CardPriceDisplay: React.FC<CardPriceDisplayProps> = ({
  priceData,
  showSource = false,
  showTrend = false,
  compact = false,
  className = ''
}) => {

  let avgPrice: number | null = null;
  
  if (priceData?.cardmarket_avg_sell_price != null) {
    const rawPrice = priceData.cardmarket_avg_sell_price;
    avgPrice = typeof rawPrice === 'string' ? parseFloat(rawPrice) : Number(rawPrice);

    if (isNaN(avgPrice)) {
      console.warn('🔍 CardPriceDisplay - Invalid price value:', {
        rawPrice,
        type: typeof rawPrice,
        priceData
      });
      avgPrice = null;
    }
  }

  React.useEffect(() => {
    if (priceData) {
      console.log('💰 CardPriceDisplay render:');
      console.log('  ✅ Has priceData:', !!priceData);
      console.log('  📦 priceData object keys:', Object.keys(priceData));
      console.log('  💵 cardmarket_avg_sell_price:', priceData.cardmarket_avg_sell_price, '(type:', typeof priceData.cardmarket_avg_sell_price + ')');
      console.log('  🔄 Converted price:', avgPrice, '(type:', typeof avgPrice + ')');
      console.log('  ✅ Will display:', avgPrice != null && avgPrice > 0 && !isNaN(avgPrice));
      console.log('  📄 Full priceData:', JSON.stringify(priceData, null, 2));

      if (!('cardmarket_avg_sell_price' in priceData)) {
        console.error('❌ CRITICAL: cardmarket_avg_sell_price field NOT FOUND in priceData!');
        console.error('❌ Available fields:', Object.keys(priceData));
      }
    } else {
      console.log('💰 CardPriceDisplay render: NO priceData provided');
    }
  }, [priceData, avgPrice]);

  if (!priceData || avgPrice == null || avgPrice <= 0 || isNaN(avgPrice)) {
    if (compact) {
      return (
        <div className={`text-xs text-muted-foreground italic ${className}`}>
          No price data found
        </div>
      );
    }
    
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {showSource ? 'CardMarket Avg' : 'Price'}
          </span>
          <span className="text-xs text-muted-foreground italic">
            No price data found
          </span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div 
        className={`text-xs font-semibold text-primary ${className}`}
        data-testid="card-price-display-compact"
        style={{ visibility: 'visible', opacity: 1 }}
      >
        {formatCurrency(avgPrice, 'EUR')}
      </div>
    );
  }

  return (
    <div 
      className={`space-y-1 ${className}`}
      data-testid="card-price-display-full"
      style={{ visibility: 'visible', opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {showSource ? 'CardMarket Avg' : 'Price'}
        </span>
        <span 
          className="text-sm font-semibold text-primary"
          style={{ color: 'inherit', display: 'inline-block' }}
        >
          {formatCurrency(avgPrice, 'EUR')}
        </span>
      </div>
      {priceData.last_updated && showTrend && (
        <div className="text-[10px] text-muted-foreground">
          Updated {new Date(priceData.last_updated).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default CardPriceDisplay;
