import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, DollarSign, Euro, TrendingUp, TrendingDown } from 'lucide-react';
import { usePokemonPricing, PriceHistoryData } from '@/hooks/usePokemonPricing';
import { useTranslation } from 'react-i18next';

interface CardPriceDisplayProps {
  cardId: string;
  setCode: string;
  cardNumber: string;
  cardName: string;
  className?: string;
  showHistory?: boolean;
}

export function CardPriceDisplay({ 
  cardId, 
  setCode, 
  cardNumber, 
  cardName, 
  className,
  showHistory = false 
}: CardPriceDisplayProps) {
  const { t } = useTranslation();
  const { 
    loading, 
    error, 
    fetchCardPrices, 
    updateCardPrices, 
    fetchPriceHistory,
    getMarketPrice,
    getCardMarketPrice,
    getCardPrices
  } = usePokemonPricing();

  const [priceHistory, setPriceHistory] = useState<PriceHistoryData[]>([]);
  const [showPriceHistory, setShowPriceHistory] = useState(showHistory);

  const marketPrice = getMarketPrice(cardId);
  const cardMarketPrice = getCardMarketPrice(cardId);
  const allPrices = getCardPrices(cardId);

  useEffect(() => {
    if (cardId) {
      fetchCardPrices(cardId);
    }
  }, [cardId, fetchCardPrices]);

  useEffect(() => {
    if (showPriceHistory && cardId) {
      fetchPriceHistory(cardId, 30).then(setPriceHistory);
    }
  }, [showPriceHistory, cardId, fetchPriceHistory]);

  const handleUpdatePrices = async () => {
    try {
      await updateCardPrices(cardId, setCode, cardNumber);
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPriceChangeIcon = (currentPrice: number, historicalPrice: number) => {
    if (currentPrice > historicalPrice) return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (currentPrice < historicalPrice) return <TrendingDown className="h-3 w-3 text-red-500" />;
    return null;
  };

  const getPriceChangeColor = (currentPrice: number, historicalPrice: number) => {
    if (currentPrice > historicalPrice) return 'text-green-600';
    if (currentPrice < historicalPrice) return 'text-red-600';
    return 'text-gray-600';
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>{t('pricing.error.loading.card')}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpdatePrices}
              className="mt-2"
            >
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{t('pricing.card.prices')}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleUpdatePrices}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TCGPlayer Market Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                TCGPlayer Market
              </span>
            </div>
            <div className="text-lg font-bold">
              {marketPrice ? formatCurrency(marketPrice, 'USD') : t('pricing.no.data')}
            </div>
          </div>

          {/* CardMarket Average Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                CardMarket Average
              </span>
            </div>
            <div className="text-lg font-bold">
              {cardMarketPrice ? formatCurrency(cardMarketPrice, 'EUR') : t('pricing.no.data')}
            </div>
          </div>
        </div>

        {/* All Available Prices */}
        {allPrices.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{t('pricing.all.prices')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {allPrices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {price.source === 'tcgplayer' ? (
                      <DollarSign className="h-3 w-3 text-green-600" />
                    ) : (
                      <Euro className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="font-medium">
                      {price.source === 'tcgplayer' ? 'TCGPlayer' : 'CardMarket'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {price.price_type}
                    </Badge>
                  </div>
                  <span className="font-bold">
                    {formatCurrency(price.price, price.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price History Toggle */}
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPriceHistory(!showPriceHistory)}
            className="w-full"
          >
            {showPriceHistory ? t('pricing.hide.history') : t('pricing.show.history')}
          </Button>
        </div>

        {/* Price History */}
        {showPriceHistory && priceHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">{t('pricing.price.history')}</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {priceHistory.slice(0, 10).map((record, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{formatDate(record.recorded_at)}</span>
                    <Badge variant="outline" className="text-xs">
                      {record.source}
                    </Badge>
                    <span className="text-gray-600">{record.price_type}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(record.price, record.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Price Data */}
        {allPrices.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">{t('pricing.no.price.data')}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUpdatePrices}
              className="mt-2"
            >
              {t('pricing.fetch.prices')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
