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
  // Get the avg_sell_price from card_prices table
  const avgPrice = priceData?.cardmarket_avg_sell_price;

  // Show "No price data found" message if no price data or price is 0/null
  if (!priceData || !avgPrice || avgPrice === 0) {
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
      <div className={`text-xs font-semibold text-primary ${className}`}>
        {formatCurrency(avgPrice, 'EUR')}
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {showSource ? 'CardMarket Avg' : 'Price'}
        </span>
        <span className="text-sm font-semibold text-primary">
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
