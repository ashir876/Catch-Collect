import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, TrendingUp, TrendingDown, Euro, Edit3 } from 'lucide-react';
import { useCollectionValue, CollectionValueSummary } from '@/hooks/useCollectionValue';
import { useTranslation } from 'react-i18next';

interface CollectionTotalValueDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
  compact?: boolean;
}

export function CollectionTotalValueDisplay({ 
  className, 
  showRefreshButton = true,
  compact = false 
}: CollectionTotalValueDisplayProps) {
  const { t } = useTranslation();
  const { 
    data: collectionValueData,
    summary: collectionValueSummary,
    isLoading, 
    error,
    formatCurrency 
  } = useCollectionValue();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">{t('pricing.loading.collection')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-4">
          <div className="text-center text-red-600">
            <p className="text-sm">{t('pricing.error.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!collectionValueSummary) {
    return (
      <Card className={className}>
        <CardContent className="pt-4">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">{t('pricing.no.data.collection')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    total_value_manual_eur,
    total_value_automatic_eur,
    total_cards,
    cards_with_manual_price,
    cards_with_automatic_price,
    cards_both_prices,
    manual_value_per_card,
    automatic_value_per_card
  } = collectionValueSummary;

  const valueDifference = total_value_manual_eur - total_value_automatic_eur;
  const hasValueDifference = Math.abs(valueDifference) > 0.01;

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>{t('pricing.collection.value')}</span>
            <Badge variant="secondary" className="text-xs">{total_cards} {t('pricing.cards')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('pricing.manual.value')}</div>
              <div className="text-base font-bold">{formatCurrency(total_value_manual_eur)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('pricing.automatic.value')}</div>
              <div className="text-base font-bold">{formatCurrency(total_value_automatic_eur)}</div>
            </div>
          </div>
          {hasValueDifference && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              valueDifference > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {valueDifference > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{formatCurrency(Math.abs(valueDifference))} {valueDifference > 0 ? t('pricing.higher') : t('pricing.lower')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-green-600" />
            {t('pricing.collection.value')}
          </span>
          <Badge variant="outline" className="text-xs">{total_cards} {t('pricing.cards')}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Manual Value Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs font-medium text-gray-600 truncate">
                  {t('pricing.manual.value')}
                </span>
                <Edit3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                {cards_with_manual_price}
              </Badge>
            </div>
            
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(total_value_manual_eur)}
            </div>
            
            {cards_with_manual_price > 0 && (
              <div className="text-xs text-muted-foreground">
                ⌀ {formatCurrency(manual_value_per_card)} {t('pricing.per.card')}
              </div>
            )}
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (total_value_manual_eur / Math.max(total_value_manual_eur, total_value_automatic_eur)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>

          {/* Automatic Value Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-xs font-medium text-gray-600 truncate">
                  {t('pricing.automatic.value')}
                </span>
                <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                {cards_with_automatic_price}
              </Badge>
            </div>
            
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(total_value_automatic_eur)}
            </div>
            
            {cards_with_automatic_price > 0 && (
              <div className="text-xs text-muted-foreground">
                ⌀ {formatCurrency(automatic_value_per_card)} {t('pricing.per.card')}
              </div>
            )}
            
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (total_value_automatic_eur / Math.max(total_value_manual_eur, total_value_automatic_eur)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Value Difference - Compact */}
        {hasValueDifference && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t('pricing.value.difference')}
              </span>
              <div className={`flex items-center gap-1 ${valueDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {valueDifference > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-semibold">
                  {formatCurrency(Math.abs(valueDifference))} {valueDifference > 0 ? t('pricing.higher') : t('pricing.lower')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Help Text - Compact */}
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>{t('pricing.manual.value')}:</strong> {t('pricing.manual.value.description')}</div>
            <div><strong>{t('pricing.automatic.value')}:</strong> {t('pricing.automatic.value.description')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CollectionTotalValueDisplay;

