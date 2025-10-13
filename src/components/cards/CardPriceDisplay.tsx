import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardPriceSummary } from '@/hooks/useCardPrices';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, DollarSign, Euro } from 'lucide-react';

interface CardPriceDisplayProps {
  priceData?: CardPriceSummary | null;
  showSource?: boolean;
  showTrend?: boolean;
  compact?: boolean;
  className?: string;
}

export const CardPriceDisplay: React.FC<CardPriceDisplayProps> = ({
  priceData,
  showSource = true,
  showTrend = false,
  compact = false,
  className = ''
}) => {
  const { t } = useTranslation();

  if (!priceData) {
    return (
      <div className={`text-muted-foreground text-xs ${className}`}>
        {t('cards.noPriceData')}
      </div>
    );
  }

  const {
    tcgplayer_market_price,
    tcgplayer_low_price,
    tcgplayer_high_price,
    cardmarket_avg_sell_price,
    cardmarket_low_price,
    cardmarket_trend_price,
    last_updated
  } = priceData;

  const hasTCGPlayerPrice = tcgplayer_market_price || tcgplayer_low_price || tcgplayer_high_price;
  const hasCardMarketPrice = cardmarket_avg_sell_price || cardmarket_low_price || cardmarket_trend_price;

  if (!hasTCGPlayerPrice && !hasCardMarketPrice) {
    return (
      <div className={`text-muted-foreground text-xs ${className}`}>
        {t('cards.noPriceData')}
      </div>
    );
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getPriceTrend = (current: number, trend?: number) => {
    if (!trend) return null;
    if (current > trend) return 'up';
    if (current < trend) return 'down';
    return 'stable';
  };

  if (compact) {
    // Show only the primary price (TCGPlayer market price or CardMarket avg sell price)
    const primaryPrice = tcgplayer_market_price || cardmarket_avg_sell_price;
    const primaryCurrency = tcgplayer_market_price ? 'USD' : 'EUR';
    const primarySource = tcgplayer_market_price ? 'TCGPlayer' : 'CardMarket';

    if (!primaryPrice) return null;

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-sm font-semibold">
          {formatPrice(primaryPrice, primaryCurrency)}
        </span>
        {showSource && (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            {primarySource}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* TCGPlayer Prices */}
      {hasTCGPlayerPrice && (
        <div className="space-y-1">
          {showSource && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>TCGPlayer</span>
            </div>
          )}
          <div className="space-y-1">
            {tcgplayer_market_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatPrice(tcgplayer_market_price, 'USD')}
                </span>
                <span className="text-xs text-muted-foreground">Market</span>
              </div>
            )}
            {tcgplayer_low_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {formatPrice(tcgplayer_low_price, 'USD')}
                </span>
                <span className="text-xs text-muted-foreground">Low</span>
              </div>
            )}
            {tcgplayer_high_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {formatPrice(tcgplayer_high_price, 'USD')}
                </span>
                <span className="text-xs text-muted-foreground">High</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CardMarket Prices */}
      {hasCardMarketPrice && (
        <div className="space-y-1">
          {showSource && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Euro className="h-3 w-3" />
              <span>CardMarket</span>
            </div>
          )}
          <div className="space-y-1">
            {cardmarket_avg_sell_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {formatPrice(cardmarket_avg_sell_price, 'EUR')}
                </span>
                <span className="text-xs text-muted-foreground">Avg Sell</span>
              </div>
            )}
            {cardmarket_low_price && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {formatPrice(cardmarket_low_price, 'EUR')}
                </span>
                <span className="text-xs text-muted-foreground">Low</span>
              </div>
            )}
            {cardmarket_trend_price && showTrend && (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {formatPrice(cardmarket_trend_price, 'EUR')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Trend</span>
                  {getPriceTrend(cardmarket_avg_sell_price || 0, cardmarket_trend_price) === 'up' && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  {getPriceTrend(cardmarket_avg_sell_price || 0, cardmarket_trend_price) === 'down' && (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {last_updated && (
        <div className="text-xs text-muted-foreground pt-1 border-t">
          {t('cards.lastUpdated')}: {new Date(last_updated).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default CardPriceDisplay;
