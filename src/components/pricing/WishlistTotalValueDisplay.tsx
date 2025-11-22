import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, TrendingUp, TrendingDown, Euro, Info, Edit3, Heart } from 'lucide-react';
import { useWishlistValue, WishlistValueSummary } from '@/hooks/useWishlistValue';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WishlistTotalValueDisplayProps {
  className?: string;
  showRefreshButton?: boolean;
  compact?: boolean;
}

export function WishlistTotalValueDisplay({ 
  className, 
  showRefreshButton = true,
  compact = false 
}: WishlistTotalValueDisplayProps) {
  const { t } = useTranslation();
  const { 
    data: wishlistValueData,
    summary: wishlistValueSummary,
    isLoading, 
    error,
    formatCurrency 
  } = useWishlistValue();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>{t('pricing.loading.wishlist')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>{t('pricing.error.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wishlistValueSummary) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>{t('pricing.no.data.wishlist')}</p>
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
    automatic_value_per_card,
    high_priority_cards,
    medium_priority_cards,
    low_priority_cards
  } = wishlistValueSummary;

  const valueDifference = total_value_manual_eur - total_value_automatic_eur;
  const hasValueDifference = Math.abs(valueDifference) > 0.01;

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              {t('pricing.wishlist.value')}
            </span>
            <Badge variant="secondary">{total_cards} {t('pricing.cards')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('pricing.manual.value')}</div>
              <div className="text-lg font-bold">{formatCurrency(total_value_manual_eur)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t('pricing.automatic.value')}</div>
              <div className="text-lg font-bold">{formatCurrency(total_value_automatic_eur)}</div>
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
    <div className={`grid gap-4 ${className}`}>
      {/* Main Value Display */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              {t('pricing.wishlist.value')}
            </span>
            <Badge variant="outline">{total_cards} {t('pricing.cards')}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Value Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-shrink">
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-gray-600 truncate">
                    {t('pricing.manual.value')} (EUR)
                  </span>
                  <Edit3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                <Badge variant="secondary" className="flex-shrink-0 whitespace-nowrap">
                  {cards_with_manual_price} {t('pricing.cards.with.price')}
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(total_value_manual_eur)}
              </div>
              
              {cards_with_manual_price > 0 && (
                <div className="text-sm text-muted-foreground">
                  ⌀ {formatCurrency(manual_value_per_card)} {t('pricing.per.card')}
                </div>
              )}
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (total_value_manual_eur / Math.max(total_value_manual_eur, total_value_automatic_eur)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Automatic Value Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-shrink">
                  <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm font-medium text-gray-600 truncate">
                    {t('pricing.automatic.value')} (EUR)
                  </span>
                  <RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
                <Badge variant="secondary" className="flex-shrink-0 whitespace-nowrap">
                  {cards_with_automatic_price} {t('pricing.cards.with.price')}
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(total_value_automatic_eur)}
              </div>
              
              {cards_with_automatic_price > 0 && (
                <div className="text-sm text-muted-foreground">
                  ⌀ {formatCurrency(automatic_value_per_card)} {t('pricing.per.card')}
                </div>
              )}
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (total_value_automatic_eur / Math.max(total_value_manual_eur, total_value_automatic_eur)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Value Difference */}
          {hasValueDifference && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('pricing.value.difference')}
                </span>
                <div className={`flex items-center gap-1 ${valueDifference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {valueDifference > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-semibold">
                    {formatCurrency(Math.abs(valueDifference))} {valueDifference > 0 ? t('pricing.higher') : t('pricing.lower')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t('pricing.priority.breakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-muted-foreground">{t('pricing.high.priority')}</div>
              <div className="font-semibold text-red-600">{high_priority_cards}</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-muted-foreground">{t('pricing.medium.priority')}</div>
              <div className="font-semibold text-blue-600">{medium_priority_cards}</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-muted-foreground">{t('pricing.low.priority')}</div>
              <div className="font-semibold text-gray-600">{low_priority_cards}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>{t('pricing.manual.value')}:</strong> {t('pricing.manual.value.description.wishlist')}</p>
            <p><strong>{t('pricing.automatic.value')}:</strong> {t('pricing.automatic.value.description')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WishlistTotalValueDisplay;

