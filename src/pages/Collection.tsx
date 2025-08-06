import { useState } from "react";
import { Search, TrendingUp, Package, Star, Grid3X3, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TradingCard from "@/components/cards/TradingCard";
import { useTranslation } from "react-i18next";
import { useCollectionData, COLLECTION_QUERY_KEY } from "@/hooks/useCollectionData";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const Collection = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "stats">("stats");

  // Fetch real collection data
  const { data: collectionItems = [], isLoading, error } = useCollectionData();

  // Transform collection data to match TradingCard component expectations
  const ownedCards = collectionItems.map((item: any) => ({
    id: item.card_id,
    name: item.cards?.name || 'Unknown Card',
    series: item.cards?.series_name || 'Unknown Series',
    set: item.cards?.set_name || 'Unknown Set',
    number: item.cards?.card_number || '',
    rarity: (item.cards?.rarity?.toLowerCase() as "common" | "rare" | "epic" | "legendary") || "common",
    type: item.cards?.types?.[0] || 'Normal',
    price: item.cards?.price || 0,
    image: item.cards?.image_url || '/placeholder.svg',
    inCollection: true,
    inWishlist: false,
    description: item.cards?.description || '',
    acquiredDate: item.created_at,
    condition: 'Near Mint'
  }));

  // Filter cards based on search term
  const filteredCards = ownedCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate collection statistics from real data
  const collectionStats = {
    totalCards: ownedCards.length,
    totalValue: ownedCards.reduce((sum, card) => sum + (card.price || 0), 0),
    totalSets: new Set(ownedCards.map(card => card.set)).size,
    completedSets: 0, // This would need more complex logic to calculate
    rarityBreakdown: {
      legendary: ownedCards.filter(card => card.rarity === 'legendary').length,
      epic: ownedCards.filter(card => card.rarity === 'epic').length,
      rare: ownedCards.filter(card => card.rarity === 'rare').length,
      common: ownedCards.filter(card => card.rarity === 'common').length
    }
  };

  // Calculate set progress (simplified version)
  const setProgress = Array.from(new Set(ownedCards.map(card => card.set))).map(setName => {
    const setCards = ownedCards.filter(card => card.set === setName);
    return {
      id: setName,
      name: setName,
      series: setCards[0]?.series || 'Unknown Series',
      owned: setCards.length,
      total: 0, // This would need to be fetched from sets table
      percentage: 0 // This would need total cards in set
    };
  }).slice(0, 5); // Show top 5 sets

  const handleRemoveFromCollection = async (cardId: string, cardName: string) => {
    if (!user) return;
    
    // Optimistic update - remove the card from the cache immediately
    const previousData = queryClient.getQueryData(COLLECTION_QUERY_KEY(user.id));
    queryClient.setQueryData(COLLECTION_QUERY_KEY(user.id), (old: any) => {
      if (!old) return old;
      return old.filter((item: any) => item.card_id !== cardId);
    });
    
    try {
      const { error } = await supabase
        .from('card_collections')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);
        
      if (error) throw error;
      
      // Invalidate and refetch the collection data to ensure consistency
      await queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY(user.id) });
      
      toast({
        title: t("messages.removedFromCollection"),
        description: `${cardName} ${t("messages.hasBeenRemovedFromCollection")}`,
      });
    } catch (err) {
      console.error('Error removing from collection:', err);
      
      // Revert optimistic update on error
      queryClient.setQueryData(COLLECTION_QUERY_KEY(user.id), previousData);
      
      toast({
        title: t("messages.error"),
        description: t("messages.collectionRemoveError"),
        variant: "destructive"
      });
    }
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">{t("auth.loginRequired")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("auth.loginRequiredCollection")}
          </p>
          <Link to="/auth">
            <Button>{t("auth.signIn")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('collection.title')}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">{t('collection.loadError')}</h3>
          <p className="text-muted-foreground">
            {t('collection.loadErrorSubtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
            <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {t('collection.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('collection.subtitle')}
          </p>
        </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={viewMode === "stats" ? "default" : "outline"}
          onClick={() => setViewMode("stats")}
        >
          <BarChart className="mr-2 h-4 w-4" />
          {t('collection.statistics')}
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          onClick={() => setViewMode("cards")}
        >
          <Grid3X3 className="mr-2 h-4 w-4" />
          {t('collection.cards')}
        </Button>
      </div>

      {viewMode === "stats" ? (
        <div className="space-y-8">
          {/* Collection Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('collection.totalCards')}</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('collection.cardsInCollection')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('collection.totalValue')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF {collectionStats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('collection.estimatedValue')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('collection.sets')}</CardTitle>
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.totalSets}</div>
                <p className="text-xs text-muted-foreground">
                  {t('collection.differentSets')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('collection.legendaryCards')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.rarityBreakdown.legendary}</div>
                <p className="text-xs text-muted-foreground">
                  {t('collection.rarestCards')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rarity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t('collection.rarityBreakdown')}</CardTitle>
              <CardDescription>{t('collection.rarityBreakdownDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-legendary/10 text-legendary border-legendary">Legendary</Badge>
                    <span>{collectionStats.rarityBreakdown.legendary} {t('collection.cards')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {collectionStats.totalCards > 0 ? ((collectionStats.rarityBreakdown.legendary / collectionStats.totalCards) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={collectionStats.totalCards > 0 ? (collectionStats.rarityBreakdown.legendary / collectionStats.totalCards) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-epic/10 text-epic border-epic">Epic</Badge>
                    <span>{collectionStats.rarityBreakdown.epic} {t('collection.cards')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {collectionStats.totalCards > 0 ? ((collectionStats.rarityBreakdown.epic / collectionStats.totalCards) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={collectionStats.totalCards > 0 ? (collectionStats.rarityBreakdown.epic / collectionStats.totalCards) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rare/10 text-rare border-rare">Rare</Badge>
                    <span>{collectionStats.rarityBreakdown.rare} {t('collection.cards')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {collectionStats.totalCards > 0 ? ((collectionStats.rarityBreakdown.rare / collectionStats.totalCards) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={collectionStats.totalCards > 0 ? (collectionStats.rarityBreakdown.rare / collectionStats.totalCards) * 100 : 0} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-common/10 text-common border-common">Common</Badge>
                    <span>{collectionStats.rarityBreakdown.common} {t('collection.cards')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {collectionStats.totalCards > 0 ? ((collectionStats.rarityBreakdown.common / collectionStats.totalCards) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={collectionStats.totalCards > 0 ? (collectionStats.rarityBreakdown.common / collectionStats.totalCards) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Set Progress */}
          {setProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('collection.setProgress')}</CardTitle>
                <CardDescription>{t('collection.setProgressDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {setProgress.map((set) => (
                    <div key={set.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{set.name}</h4>
                          <p className="text-sm text-muted-foreground">{set.series}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{set.owned} {t('collection.cards')}</div>
                          <div className="text-sm text-muted-foreground">{t('collection.inThisSet')}</div>
                        </div>
                      </div>
                      <Progress value={set.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('collection.searchCards')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className="relative">
                <TradingCard
                  {...card}
                  onAddToCollection={() => handleRemoveFromCollection(card.id, card.name)}
                  onAddToWishlist={() => {}}
                  onAddToCart={() => {}}
                  hidePriceAndBuy={true}
                  disableHoverEffects={true}
                />
                <div className="absolute top-2 right-2 z-30">
                  <Badge variant="secondary" className="text-xs">
                    {card.condition}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? t('collection.noCardsFound') : t('collection.emptyCollection')}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? t('collection.tryDifferentSearch') : t('collection.emptyCollectionSubtitle')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Collection;