import React, { useState } from "react";
import { Search, TrendingUp, Package, Star, Grid3X3, List, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TradingCard from "@/components/cards/TradingCard";
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";
import { useTranslation } from "react-i18next";
import { useCollectionData, COLLECTION_QUERY_KEY } from "@/hooks/useCollectionData";
import { useCurrentPrices } from "@/hooks/useCurrentPrices";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CollectionValueDisplay } from "@/components/pricing/CollectionValueDisplay";
import { PriceTrendChart } from "@/components/pricing/PriceTrendChart";
import { CollectionValueChart } from "@/components/pricing/CollectionValueChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Collection = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "stats">("stats");
  const [cardViewMode, setCardViewMode] = useState<"grid" | "list">("grid");

  const [rarityFilter, setRarityFilter] = useState("all");
  const [setFilter, setSetFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<"name" | "rarity" | "set" | "date" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isPriceTrendModalOpen, setIsPriceTrendModalOpen] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<any>(null);

  const { data: collectionItems = [], isLoading, error } = useCollectionData();

  React.useEffect(() => {
    console.log('Collection - Data changed:', {
      itemsCount: collectionItems.length,
      isLoading,
      hasError: !!error,
      sampleItem: collectionItems[0] ? {
        id: collectionItems[0].id,
        card_id: collectionItems[0].card_id,
        condition: collectionItems[0].condition,
        price: collectionItems[0].price,
        notes: collectionItems[0].notes
      } : null
    });
  }, [collectionItems, isLoading, error]);

  console.log('Collection - Raw collection items:', collectionItems);

  const cardIds = collectionItems.map(item => item.card_id);

  const { data: currentPrices = [], isLoading: pricesLoading, error: pricesError } = useCurrentPrices(cardIds);

  console.log('Collection Debug:', {
    collectionItems: collectionItems.length,
    cardIds: cardIds,
    currentPrices: currentPrices.length,
    pricesLoading,
    pricesError
  });

  console.log('Collection - Processing collection items:', collectionItems.length);
  const ownedCards = collectionItems.map((item: any) => {
    
    const marketPrice = currentPrices.find((price: any) => price.card_id === item.card_id);

    console.log('Collection card processing:', {
      cardId: item.card_id,
      cardName: item.cards?.name,
      itemPrice: item.price,
      itemPriceType: typeof item.price,
      marketPrice: marketPrice?.price,
      hasMarketPrice: !!marketPrice,
      currentPricesLength: currentPrices.length,
      itemId: item.id, 
      itemIdType: typeof item.id, 
      fullItem: item
    });

    const mockMarketPrice = !marketPrice && item.cards?.rarity ? {
      price: item.cards.rarity === 'legendary' ? 150.00 : 
             item.cards.rarity === 'epic' ? 75.00 :
             item.cards.rarity === 'rare' ? 25.00 : 5.00,
      source: 'tcgplayer',
      currency: 'USD',
      recorded_at: new Date().toISOString()
    } : null;
    
    return {
      id: item.card_id, 
      cardId: item.card_id, 
      name: item.cards?.name || 'Unknown Card',
      series: item.series_name || item.cards?.series_name || 'Unknown Series',
      set: item.cards?.set_name || 'Unknown Set',
      number: item.cards?.card_number || '',
      rarity: mapDatabaseRarityToComponent(item.cards?.rarity || "Common"),
      type: item.cards?.types?.[0] || 'Normal',
      image: item.cards?.image_url || '/placeholder.svg',
      inCollection: true,
      inWishlist: false,
      description: item.cards?.description || '',
      acquiredDate: item.created_at,
      condition: item.condition || 'Near Mint',
      myPrice: item.price || 0, 
      marketPrice: marketPrice?.price || mockMarketPrice?.price || 0, 
      marketSource: marketPrice?.source || mockMarketPrice?.source || 'tcgplayer',
      marketCurrency: marketPrice?.currency || mockMarketPrice?.currency || 'USD',
      marketRecordedAt: marketPrice?.recorded_at || mockMarketPrice?.recorded_at || new Date().toISOString(),
      notes: item.notes || '',
      quantity: item.quantity || 1,
      language: item.language || 'en',
      
      collectionItemId: item.id,
      
      cardData: item.cards ? {
        card_id: item.card_id,
        name: item.cards.name,
        set_name: item.cards.set_name,
        set_id: item.cards.set_id,
        card_number: item.cards.card_number,
        rarity: item.cards.rarity,
        types: item.cards.types,
        hp: item.cards.hp,
        image_url: item.cards.image_url,
        description: item.cards.description,
        illustrator: item.cards.illustrator,
        attacks: item.cards.attacks,
        weaknesses: item.cards.weaknesses,
        retreat: item.cards.retreat,
        set_symbol_url: item.cards.set_symbol_url,
        language: item.language
      } : undefined,
      
      instanceId: `${item.card_id}-${item.condition}-${item.price}-${item.created_at}`,
    };
  });

  if (ownedCards.length > 0) {
    console.log('First owned card structure:', {
      id: ownedCards[0].id,
      collectionItemId: ownedCards[0].collectionItemId,
      cardId: ownedCards[0].cardId,
      name: ownedCards[0].name,
      itemId: collectionItems[0]?.id,
      itemIdType: typeof collectionItems[0]?.id
    });
  }

  const handleCardClick = (card: any) => {
    setSelectedCardForModal(card);
    setIsPriceTrendModalOpen(true);
  };

  const uniqueSets = Array.from(new Set(ownedCards.map(card => card.set))).sort();

   const filteredCards = ownedCards
     .filter(card => {
       const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
       const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
       const matchesSet = setFilter === "all" || card.set === setFilter;

       let matchesPrice = true;
       if (priceFilter !== "all") {
         const cardPrice = priceFilter === "myPrice" ? card.myPrice : card.marketPrice;
         const minPrice = parseFloat(priceRange.min) || 0;
         const maxPrice = parseFloat(priceRange.max) || Infinity;
         
         matchesPrice = typeof cardPrice === 'number' && cardPrice >= minPrice && cardPrice <= maxPrice;
       }
       
       return matchesSearch && matchesRarity && matchesSet && matchesPrice;
     })
     .sort((a, b) => {
       let comparison = 0;
       
       switch (sortBy) {
         case "name":
           comparison = a.name.localeCompare(b.name);
           break;
         case "rarity":
           const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
           comparison = (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0) - 
                       (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0);
           break;
         case "set":
           comparison = a.set.localeCompare(b.set);
           break;
         case "date":
           comparison = new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime();
           break;
         case "price":
           const aPrice = a.myPrice || a.marketPrice || 0;
           const bPrice = b.myPrice || b.marketPrice || 0;
           comparison = aPrice - bPrice;
           break;
       }
       
       return sortOrder === "asc" ? comparison : -comparison;
     });

  const debugCollectionData = () => {
    console.log('=== COLLECTION DATA DEBUG ===');
    console.log('Collection Items:', collectionItems);
    console.log('Current Prices:', currentPrices);
    console.log('Owned Cards:', ownedCards);
    console.log('Filtered Cards:', filteredCards);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugCollectionData = debugCollectionData;
      console.log('🔍 Debug function available: debugCollectionData()');
    }
     }, [collectionItems, currentPrices, ownedCards, filteredCards]);

  const collectionStats = {
    totalCards: ownedCards.length,
    totalValue: 0, 
    totalSets: new Set(ownedCards.map(card => card.set)).size,
    completedSets: 0, 
    rarityBreakdown: {
      legendary: ownedCards.filter(card => card.rarity === 'legendary').length,
      epic: ownedCards.filter(card => card.rarity === 'epic').length,
      rare: ownedCards.filter(card => card.rarity === 'rare').length,
      common: ownedCards.filter(card => card.rarity === 'common').length
    }
  };

  const mostExpensiveCard = ownedCards.reduce((mostExpensive, card) => {
    const cardValue = card.marketPrice || card.myPrice || 0;
    const mostExpensiveValue = mostExpensive.marketPrice || mostExpensive.myPrice || 0;
    return cardValue > mostExpensiveValue ? card : mostExpensive;
  }, ownedCards[0]);

  const legendaryCards = ownedCards.filter(card => card.rarity === 'legendary');
  const topLegendaryCard = legendaryCards.length > 0
    ? legendaryCards.reduce((best, card) => {
        const value = card.marketPrice || card.myPrice || 0;
        const bestValue = best.marketPrice || best.myPrice || 0;
        return value > bestValue ? card : best;
      }, legendaryCards[0])
    : null;

  const setNames = Array.from(new Set(ownedCards.map(card => card.set))).sort();
  const setWithCardCounts = setNames.map(setName => {
    const cardCount = ownedCards.filter(card => card.set === setName).length;
    return `${setName} (${cardCount} cards)`;
  });

  const setProgress = Array.from(new Set(ownedCards.map(card => card.set))).map(setName => {
    const setCards = ownedCards.filter(card => card.set === setName);
    return {
      id: setName,
      name: setName,
      series: setCards[0]?.series || 'Unknown Series',
      owned: setCards.length,
      total: 0, 
      percentage: 0 
    };
  }).slice(0, 5); 

  const handleRemoveFromCollection = async (collectionItemId: string | number, cardName: string) => {
    if (!user) return;

    let previousData: any = null;
    if (user?.id) {
      previousData = queryClient.getQueryData(COLLECTION_QUERY_KEY(user.id));
      queryClient.setQueryData(COLLECTION_QUERY_KEY(user.id), (old: any) => {
        if (!old) return old;
        return old.filter((item: any) => item.id !== Number(collectionItemId));
      });
    }
    
    try {
      
      const { error } = await supabase
        .from('card_collections')
        .delete()
        .eq('id', Number(collectionItemId))
        .eq('user_id', user.id as string);
        
      if (error) throw error;

      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY(user.id) });
        await queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      }
      
      toast({
        title: t("messages.removedFromCollection"),
        description: `${cardName} ${t("messages.hasBeenRemovedFromCollection")}`,
      });
    } catch (err) {
      console.error('Error removing from collection:', err);

      if (user?.id && previousData) {
        queryClient.setQueryData(COLLECTION_QUERY_KEY(user.id), previousData);
      }
      
      toast({
        title: t("messages.error"),
        description: t("messages.collectionRemoveError"),
        variant: "destructive"
      });
    }
  };

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
        {}
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

      {}
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
          {}
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
                {mostExpensiveCard && (
                  <div className="mt-4 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleCardClick(mostExpensiveCard)}>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-36 sm:w-28 sm:h-40 bg-white rounded border overflow-hidden flex-shrink-0 relative">
                        <img
                          src={mostExpensiveCard.image}
                          alt={mostExpensiveCard.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {}
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0 h-5">
                            💎
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-semibold truncate">{mostExpensiveCard.name}</p>
                        <p className="text-base sm:text-lg text-muted-foreground">
                          {(mostExpensiveCard.marketPrice || mostExpensiveCard.myPrice || 0).toFixed(2)} CHF
                        </p>
                        <p className="text-sm text-green-600 font-medium">
                          Highest Value Card
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <CollectionValueDisplay />

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
                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {setNames.map((setName) => {
                    const setCards = ownedCards.filter(card => card.set === setName);
                    const cardCount = setCards.length;
                    const setImage = setCards[0]?.image || '/placeholder.svg';
                    
                    return (
                      <div 
                        key={setName}
                        className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => {
                          
                          setSetFilter(setName);
                          setViewMode("cards");
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-10 bg-white rounded border overflow-hidden flex-shrink-0">
                            <img
                              src={setImage}
                              alt={setName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{setName}</p>
                            <p className="text-xs text-muted-foreground">{cardCount} cards</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('collection.legendaryCards')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.rarityBreakdown.legendary}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {t('collection.rarestCards')}
                </p>
                {topLegendaryCard ? (
                  <div className="mt-2 p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleCardClick(topLegendaryCard)}>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-36 sm:w-28 sm:h-40 bg-white rounded border overflow-hidden flex-shrink-0 relative">
                        <img
                          src={topLegendaryCard.image}
                          alt={topLegendaryCard.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0 h-5">
                            ★
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-semibold truncate">{topLegendaryCard.name}</p>
                        <p className="text-base sm:text-lg text-muted-foreground">
                          {(topLegendaryCard.marketPrice || topLegendaryCard.myPrice || 0).toFixed(2)} CHF
                        </p>
                        <p className="text-sm text-purple-700 font-medium">Top Legendary</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{t('collection.noLegendaryCards', 'No legendary cards yet')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {}
          {}

                                 {}
            <Card>
              <CardHeader>
                <CardTitle>{t('collection.value.development')}</CardTitle>
                <CardDescription>{t('collection.value.trends.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CollectionValueChart showControls={true} />
              </CardContent>
            </Card>

          {}
          {}
        </div>
      ) : (
                 <div className="space-y-6">
           {}
           <div className="space-y-4">
             {}
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
               <Input
                 placeholder={t('collection.searchCards')}
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="pl-10"
               />
             </div>

             {}
             <div className="flex flex-wrap gap-4 items-center">
               {}
               <div className="flex items-center gap-2">
                 <label className="text-sm font-medium">{t('collection.filterByRarity')}:</label>
                 <select
                   value={rarityFilter}
                   onChange={(e) => setRarityFilter(e.target.value)}
                   className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">{t('collection.allRarities')}</option>
                   <option value="common">{t('collection.common')}</option>
                   <option value="rare">{t('collection.rare')}</option>
                   <option value="epic">{t('collection.epic')}</option>
                   <option value="legendary">{t('collection.legendary')}</option>
                 </select>
               </div>

               {}
               <div className="flex items-center gap-2">
                 <label className="text-sm font-medium">{t('collection.filterBySet')}:</label>
                 <select
                   value={setFilter}
                   onChange={(e) => setSetFilter(e.target.value)}
                   className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">{t('collection.allSets')}</option>
                   {uniqueSets.map((set) => (
                     <option key={set} value={set}>{set}</option>
                   ))}
                 </select>
               </div>

               {}
               <div className="flex items-center gap-2">
                 <label className="text-sm font-medium">{t('collection.sortBy')}:</label>
                 <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value as "name" | "rarity" | "set" | "date" | "price")}
                   className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="name">{t('collection.sortByName')}</option>
                   <option value="rarity">{t('collection.sortByRarity')}</option>
                   <option value="set">{t('collection.sortBySet')}</option>
                   <option value="date">{t('collection.sortByDate')}</option>
                   <option value="price">{t('collection.sortByPrice')}</option>
                 </select>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                   className="px-2"
                 >
                   {sortOrder === "asc" ? "↑" : "↓"}
                 </Button>
               </div>

                               {}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{t('collection.filterByPrice')}:</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t('collection.allPrices')}</option>
                    <option value="myPrice">{t('collection.myPrice')}</option>
                    <option value="marketPrice">{t('collection.marketPrice')}</option>
                  </select>
                </div>

                {}
                {priceFilter !== "all" && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">{t('collection.priceRange')}:</label>
                    <input
                      type="number"
                      placeholder={t('collection.minPrice')}
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-sm text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder={t('collection.maxPrice')}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {}
                {(searchTerm || rarityFilter !== "all" || setFilter !== "all" || priceFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setRarityFilter("all");
                      setSetFilter("all");
                      setPriceFilter("all");
                      setPriceRange({ min: "", max: "" });
                      setSortBy("name");
                      setSortOrder("asc");
                    }}
                  >
                    {t('collection.clearFilters')}
                  </Button>
                )}
             </div>

             {}
             <div className="text-sm text-muted-foreground">
               {t('collection.showing')} {filteredCards.length} {t('collection.of')} {ownedCards.length} {t('collection.cards')}
             </div>
           </div>

           {}
           <div className="flex justify-end mb-6">
             <div className="flex gap-2">
               <Button
                 variant={cardViewMode === "grid" ? "default" : "outline"}
                 onClick={() => setCardViewMode("grid")}
                 size="sm"
               >
                 <Grid3X3 className="h-4 w-4" />
               </Button>
               <Button
                 variant={cardViewMode === "list" ? "default" : "outline"}
                 onClick={() => setCardViewMode("list")}
                 size="sm"
               >
                 <List className="h-4 w-4" />
               </Button>
             </div>
           </div>

                     {}
                       {cardViewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredCards.map((card) => (
                  <div key={card.instanceId || card.id} className="flex flex-col">
                    <div className="relative">
                                             <TradingCard
                         {...card}
                         inCollection={true}
                         inWishlist={false}
                         isOwned={true}
                         isWishlisted={false}
                         onAddToCollection={() => {}} 
                         onAddToWishlist={() => {}}
                         onAddToCart={() => {}}
                         onViewDetails={() => handleCardClick(card)}
                         hidePriceAndBuy={false}
                         disableHoverEffects={true}
                         cardData={card.cardData}
                         collectionItemId={card.collectionItemId}
                         showRemoveButton={true}
                         onRemove={(id) => handleRemoveFromCollection(card.collectionItemId, card.name)}
                         hideCollectedLabel={true}
                       />
                      {}
                      <div className="absolute top-2 right-10 z-30">
                        <Badge variant="secondary" className="text-xs">
                          {card.condition}
                        </Badge>
                      </div>
                    </div>
                    
                  </div>
                ))}
              </div>
                     ) : (
             <div className="space-y-2">
               {filteredCards.map((card) => (
                 <div 
                   key={card.instanceId || card.id} 
                   className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                   onClick={() => handleCardClick(card)}
                 >
                   <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border-2 border-black flex-shrink-0">
                     <img
                       src={card.image}
                       alt={card.name}
                       className="w-full h-full object-contain"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = '/placeholder.svg';
                       }}
                     />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-start justify-between">
                       <div className="flex-1 min-w-0">
                         <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                         <p className="text-muted-foreground text-xs mb-1">#{card.number}</p>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs bg-muted px-2 py-1 rounded">{card.set}</span>
                           <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{card.rarity}</span>
                           <span className="text-xs bg-muted px-2 py-1 rounded">{card.condition}</span>
                         </div>
                         <p className="text-xs text-muted-foreground">
                           {t('collection.acquired')}: {new Date(card.acquiredDate).toLocaleDateString()}
                         </p>
                         {}
                         <div className="flex items-center gap-4 mt-2">
                           {typeof card.myPrice === 'number' && (
                             <div className="text-xs">
                               <span className="text-muted-foreground">Your Price:</span>
                               <span className="ml-1 font-medium">CHF {card.myPrice.toFixed(2)}</span>
                             </div>
                           )}
                           {typeof card.marketPrice === 'number' && (
                             <div className="text-xs">
                               <span className="text-muted-foreground">Market Price:</span>
                               <span className="ml-1 font-medium">{card.marketCurrency || 'USD'} {card.marketPrice.toFixed(2)}</span>
                             </div>
                           )}
                         </div>
                       </div>
                       <div className="flex flex-col items-end gap-2">
                                                   <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromCollection(card.collectionItemId, card.name);
                            }}
                            className="h-8 px-2"
                          >
                            {t('collection.remove')}
                          </Button>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}

                     {}
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

             {}
       {selectedCardForModal && (
         <Dialog open={isPriceTrendModalOpen} onOpenChange={setIsPriceTrendModalOpen}>
                       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle>{t('pricing.price.trends.for')} {selectedCardForModal.name}</DialogTitle>
             </DialogHeader>
                           <div className="w-full h-[500px] overflow-hidden">
                <PriceTrendChart
                  cardId={selectedCardForModal.id}
                  showControls={true}
                />
              </div>
           </DialogContent>
         </Dialog>
       )}
    </div>
  );
};

export default Collection;