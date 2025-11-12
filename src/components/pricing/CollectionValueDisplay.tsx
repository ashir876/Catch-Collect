import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Euro } from 'lucide-react';
import { usePokemonPricing, CollectionValueSummary } from '@/hooks/usePokemonPricing';
import { useTranslation } from 'react-i18next';

interface CollectionValueDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
}

export function CollectionValueDisplay({ className, showRefreshButton = true }: CollectionValueDisplayProps) {
  const { t } = useTranslation();
  const { 
    loading, 
    error, 
    collectionValue, 
    fetchCollectionValue 
  } = usePokemonPricing();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const getValueChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getValueChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>{t('pricing.error.loading')}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCollectionValue}
              className="mt-2"
            >
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!collectionValue) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>{t('pricing.no.data')}</p>
            {showRefreshButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchCollectionValue}
                disabled={loading}
                className="mt-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t('pricing.refresh.prices')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>{t('pricing.total.value')}</span>
            {showRefreshButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchCollectionValue}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">
                  {t('pricing.usd.value')}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(collectionValue.total_value_usd, 'USD')}
              </div>
              {collectionValue.value_change_30d_usd !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${getValueChangeColor(collectionValue.value_change_30d_usd)}`}>
                  {getValueChangeIcon(collectionValue.value_change_30d_usd)}
                  <span>
                    {collectionValue.value_change_30d_usd > 0 ? '+' : ''}
                    {formatCurrency(collectionValue.value_change_30d_usd, 'USD')}
                  </span>
                  <span className="text-xs">
                    ({formatPercentage(Math.abs(collectionValue.value_change_30d_usd), collectionValue.total_value_usd)})
                  </span>
                </div>
              )}
            </div>

            {}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  {t('pricing.eur.value')}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(collectionValue.total_value_eur, 'EUR')}
              </div>
              {collectionValue.value_change_30d_eur !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${getValueChangeColor(collectionValue.value_change_30d_eur)}`}>
                  {getValueChangeIcon(collectionValue.value_change_30d_eur)}
                  <span>
                    {collectionValue.value_change_30d_eur > 0 ? '+' : ''}
                    {formatCurrency(collectionValue.value_change_30d_eur, 'EUR')}
                  </span>
                  <span className="text-xs">
                    ({formatPercentage(Math.abs(collectionValue.value_change_30d_eur), collectionValue.total_value_eur)})
                  </span>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {t('pricing.cards.in.collection')}
              </span>
              <Badge variant="secondary">
                {collectionValue.total_cards} {t('pricing.cards')}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {t('pricing.based.on.market.prices')}
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('pricing.price.sources')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>TCGPlayer (USD)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>CardMarket (EUR)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
