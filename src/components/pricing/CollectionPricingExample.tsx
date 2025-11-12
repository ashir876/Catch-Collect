import React from 'react';
import { CollectionValueDisplay } from './CollectionValueDisplay';
import { CardPriceDisplay } from './CardPriceDisplay';
import { PriceTrendChart } from './PriceTrendChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { usePokemonPricing } from '@/hooks/usePokemonPricing';
import { useTranslation } from '@/i18n';

interface CollectionPricingExampleProps {
  className?: string;
}

export function CollectionPricingExample({ className }: CollectionPricingExampleProps) {
  const { t } = useTranslation();
  const { updateSetPrices, loading } = usePokemonPricing();

  const handleUpdateAllPrices = async () => {
    try {
      
      await updateSetPrices('base1');
      console.log('Prices updated successfully!');
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollectionValueDisplay />
        
        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('pricing.quick.actions')}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpdateAllPrices}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t('pricing.update.all.prices')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {t('pricing.update.description')}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>TCGPlayer (USD)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>CardMarket (EUR)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Charizard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src="https://images.pokemontcg.io/base1/4.png" 
                alt="Charizard" 
                className="w-full rounded-lg"
              />
              <div className="text-sm text-gray-600">
                <p><strong>Set:</strong> Base Set</p>
                <p><strong>Number:</strong> 4/102</p>
                <p><strong>Rarity:</strong> Holo Rare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <CardPriceDisplay
          cardId="base1-4"
          setCode="base1"
          cardNumber="4"
          cardName="Charizard"
          showHistory={true}
        />

        {}
        <PriceTrendChart
          cardId="base1-4"
          showControls={true}
        />
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>{t('pricing.information')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">TCGPlayer (USD)</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Market Price: Current market value</li>
                <li>• Low Price: Lowest available price</li>
                <li>• High Price: Highest available price</li>
                <li>• Mid Price: Average of low and high</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">CardMarket (EUR)</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Average Sell Price: Average selling price</li>
                <li>• Low Price: Lowest available price</li>
                <li>• Trend Price: Price trend indicator</li>
                <li>• German Pro Low: German professional seller low</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CollectionWithPricing() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{t('collection.title')}</h1>
        <p className="text-muted-foreground">{t('collection.subtitle')}</p>
      </div>

      {}
      <CollectionPricingExample className="mb-8" />

      {}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">{t('collection.your.cards')}</h2>
        {}
      </div>
    </div>
  );
}
