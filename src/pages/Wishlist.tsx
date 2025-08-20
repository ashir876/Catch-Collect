
import React, { useState } from "react";
import { Search, Heart, Package, Star, Grid3X3, List, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TradingCard from "@/components/cards/TradingCard";
import { useToast } from "@/hooks/use-toast";
import { useWishlistData, useWishlistCount, WishlistItem } from "@/hooks/useWishlistData";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { PriceTrendChart } from "@/components/pricing/PriceTrendChart";
import { WishlistValueChart } from "@/components/pricing/WishlistValueChart";
import { CollectionValueDisplay } from "@/components/pricing/CollectionValueDisplay";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentPrices } from "@/hooks/useCurrentPrices";

// Map priority number to text
const getPriorityText = (priority: number, t: any) => {
  switch (priority) {
    case 2:
      return t("wishlist.highPriority");
    case 1:
      return t("wishlist.mediumPriority");
    case 0:
      return t("wishlist.lowPriority");
    default:
      return t("wishlist.mediumPriority");
  }
};

// Map priority number to color
const getPriorityColor = (priority: number): "default" | "secondary" | "destructive" => {
  switch (priority) {
    case 2:
      return "destructive";
    case 1:
      return "default";
    case 0:
      return "secondary";
    default:
      return "secondary";
  }
};

const Wishlist = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "stats">("stats");
  const [cardViewMode, setCardViewMode] = useState<"grid" | "list">("grid");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [setFilter, setSetFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<"name" | "rarity" | "set" | "priority" | "date" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Modal state for price trends
  const [isPriceTrendModalOpen, setIsPriceTrendModalOpen] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<any>(null);

  // Fetch wishlist data
  const { data: wishlistItems = [], isLoading, error } = useWishlistData({
    limit: 1000, // Get all items for statistics
    offset: 0,
    priority: undefined,
    searchTerm: undefined
  });

  // Get card IDs for price fetching
  const cardIds = wishlistItems.map(item => item.card_id);
  
  // Fetch current prices for the cards
  const { data: currentPrices = [], isLoading: pricesLoading, error: pricesError } = useCurrentPrices(cardIds);

  // Create card objects for the TradingCard component from wishlist items
  const createCardObject = (item: WishlistItem) => {
    if (!item.card) return null;
    
    // Find current market price for this card
    const marketPrice = currentPrices.find((price: any) => price.card_id === item.card_id);
    
    // Fallback mock price for testing (remove this once real prices work)
    const mockMarketPrice = !marketPrice && item.card?.rarity ? {
      price: item.card.rarity === 'legendary' ? 150.00 : 
             item.card.rarity === 'epic' ? 75.00 :
             item.card.rarity === 'rare' ? 25.00 : 5.00,
      source: 'tcgplayer',
      currency: 'USD',
      recorded_at: new Date().toISOString()
    } : null;
    
    return {
      id: item.id?.toString() || item.card_id, // Use item.id if available, fallback to card_id
      card_id: item.card_id, // Add the card_id as a separate field for reference
      name: item.card.name || t("cards.unknownCard"),
      series: item.card.series_name || "",
      set: item.card.set_name || "",
      number: item.card.number || "",
      rarity: (item.card.rarity?.toLowerCase() as "common" | "rare" | "epic" | "legendary") || "common",
      type: item.card.type || "",
      image: item.card.image_url || "/placeholder.svg",
      inCollection: false,
      inWishlist: true,
      priority: item.priority === 2 ? "high" : item.priority === 1 ? "medium" : "low" as "high" | "medium" | "low",
      availability: "in-stock",
      // Add prices for wishlist items
      myPrice: item.price || 0, // Use the price from wishlist item
      marketPrice: marketPrice?.price || mockMarketPrice?.price || 0, // Use real market price or mock
      marketSource: marketPrice?.source || mockMarketPrice?.source || 'tcgplayer',
      marketCurrency: marketPrice?.currency || mockMarketPrice?.currency || 'USD',
      marketRecordedAt: marketPrice?.recorded_at || mockMarketPrice?.recorded_at || new Date().toISOString(),
      acquiredDate: item.created_at
    };
  };

  // Transform wishlist data to match TradingCard component expectations
  const wishlistCards = wishlistItems
    .map(item => createCardObject(item))
    .filter(Boolean);

  // Handle card click to show price trends modal
  const handleCardClick = (card: any) => {
    setSelectedCardForModal(card);
    setIsPriceTrendModalOpen(true);
  };

  // Get unique sets for filter dropdown
  const uniqueSets = Array.from(new Set(wishlistCards.map(card => card.set))).sort();

  // Filter and sort cards
  const filteredCards = wishlistCards
    .filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "all" || 
        (priorityFilter === "high" && card.priority === "high") ||
        (priorityFilter === "medium" && card.priority === "medium") ||
        (priorityFilter === "low" && card.priority === "low");
      const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
      const matchesSet = setFilter === "all" || card.set === setFilter;
      
      // Price filtering
      let matchesPrice = true;
      if (priceFilter !== "all") {
        const cardPrice = priceFilter === "myPrice" ? card.myPrice : card.marketPrice || 0;
        const minPrice = parseFloat(priceRange.min) || 0;
        const maxPrice = parseFloat(priceRange.max) || Infinity;
        
        matchesPrice = typeof cardPrice === 'number' && cardPrice >= minPrice && cardPrice <= maxPrice;
      }
      
      return matchesSearch && matchesPriority && matchesRarity && matchesSet && matchesPrice;
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
        case "priority":
          const priorityOrder = { low: 0, medium: 1, high: 2 };
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "date":
          comparison = new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime();
          break;
        case "price":
          const aPrice = a.marketPrice || 0;
          const bPrice = b.marketPrice || 0;
          comparison = aPrice - bPrice;
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Calculate wishlist statistics
  const wishlistStats = {
    totalCards: wishlistCards.length,
    totalValue: wishlistCards.reduce((sum, card) => sum + (card.marketPrice || 0), 0),
    totalSets: new Set(wishlistCards.map(card => card.set)).size,
    priorityBreakdown: {
      high: wishlistCards.filter(card => card.priority === 'high').length,
      medium: wishlistCards.filter(card => card.priority === 'medium').length,
      low: wishlistCards.filter(card => card.priority === 'low').length
    },
    rarityBreakdown: {
      legendary: wishlistCards.filter(card => card.rarity === 'legendary').length,
      epic: wishlistCards.filter(card => card.rarity === 'epic').length,
      rare: wishlistCards.filter(card => card.rarity === 'rare').length,
      common: wishlistCards.filter(card => card.rarity === 'common').length
    }
  };

  // Find the most expensive card
  const mostExpensiveCard = wishlistCards.reduce((mostExpensive, card) => {
    const cardValue = card.marketPrice || 0;
    const mostExpensiveValue = mostExpensive.marketPrice || 0;
    return cardValue > mostExpensiveValue ? card : mostExpensive;
  }, wishlistCards[0]);

  // Get set names with card counts
  const setNames = Array.from(new Set(wishlistCards.map(card => card.set))).sort();

  const handleRemoveFromWishlist = async (wishlistItemId: string, cardName: string) => {
    if (!user) return;
    
    // Optimistic update - remove the card from all wishlist caches immediately
    const wishlistQueryKey = ['wishlist', user.id];
    const previousData = queryClient.getQueryData(wishlistQueryKey);
    
    queryClient.setQueryData(wishlistQueryKey, (old: any) => {
      if (!old) return old;
      return old.filter((item: any) => {
        const itemId = item.id?.toString() || item.card_id;
        return itemId !== wishlistItemId;
      });
    });
    
    try {
      // Check if wishlistItemId is a number (wishlist item ID) or string (card_id)
      const isNumericId = !isNaN(parseInt(wishlistItemId));
      
      let deleteQuery = supabase
        .from('card_wishlist')
        .delete()
        .eq('user_id', user.id);
      
      if (isNumericId) {
        deleteQuery = deleteQuery.eq('id', parseInt(wishlistItemId));
      } else {
        deleteQuery = deleteQuery.eq('card_id', wishlistItemId);
      }
      
      const { error } = await deleteQuery;
        
      if (error) throw error;
      
      // Invalidate all wishlist queries to refetch the data
      await queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });
      
      toast({
        title: t("messages.removedFromWishlist"),
        description: `${cardName} ${t("messages.hasBeenRemovedFromWishlist")}`,
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      
      // Revert optimistic update on error
      queryClient.setQueryData(wishlistQueryKey, previousData);
      
      toast({
        title: t("messages.error"),
        description: t("messages.wishlistRemoveError"),
        variant: "destructive"
      });
    }
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">{t("auth.loginRequired")}</h3>
          <p className="text-muted-foreground mb-6">
            {t("auth.loginRequiredWishlist")}
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
        <h1 className="text-3xl font-bold mb-8">{t("wishlist.title")}</h1>
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
          <Heart className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">{t("wishlist.loadError")}</h3>
          <p className="text-muted-foreground">
            {t("wishlist.loadErrorSubtitle")}
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
            {t("wishlist.title")}
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
          {t("wishlist.subtitle")}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={viewMode === "stats" ? "default" : "outline"}
          onClick={() => setViewMode("stats")}
        >
          <BarChart className="mr-2 h-4 w-4" />
          {t('wishlist.statistics')}
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          onClick={() => setViewMode("cards")}
        >
          <Grid3X3 className="mr-2 h-4 w-4" />
          {t('wishlist.cards')}
        </Button>
      </div>

      {viewMode === "stats" ? (
        <div className="space-y-8">
          {/* Wishlist Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('wishlist.totalCards')}</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wishlistStats.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('wishlist.cardsInWishlist')}
                </p>
                {mostExpensiveCard && (
                  <div className="mt-3 p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => handleCardClick(mostExpensiveCard)}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-10 bg-white rounded border overflow-hidden flex-shrink-0 relative">
                        <img
                          src={mostExpensiveCard.image}
                          alt={mostExpensiveCard.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        {/* Highest Value Tag */}
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-yellow-500 text-black text-xs px-1 py-0 h-4">
                            💎
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{mostExpensiveCard.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(mostExpensiveCard.marketPrice || 0).toFixed(2)} CHF
                        </p>
                        <p className="text-xs text-green-600 font-medium">
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
                <CardTitle className="text-sm font-medium">{t('wishlist.sets')}</CardTitle>
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wishlistStats.totalSets}</div>
                <p className="text-xs text-muted-foreground">
                  {t('wishlist.differentSets')}
                </p>
                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {setNames.slice(0, 6).map((setName) => {
                    const setCards = wishlistCards.filter(card => card.set === setName);
                    const cardCount = setCards.length;
                    const setImage = setCards[0]?.image || '/placeholder.svg';
                    
                    return (
                      <div 
                        key={setName}
                        className="p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => {
                          // Filter to show only cards from this set
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
                <CardTitle className="text-sm font-medium">{t('wishlist.legendaryCards')}</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{wishlistStats.rarityBreakdown.legendary}</div>
                <p className="text-xs text-muted-foreground">
                  {t('wishlist.rarestCards')}
                </p>
              </CardContent>
            </Card>
          </div>



          {/* Wishlist Value Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t('wishlist.value.development')}</CardTitle>
              <CardDescription>{t('wishlist.value.trends.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <WishlistValueChart showControls={true} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('wishlist.searchCards')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t('wishlist.filterByPriority')}:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('wishlist.allPriorities')}</option>
                  <option value="high">{t('wishlist.highPriority')}</option>
                  <option value="medium">{t('wishlist.mediumPriority')}</option>
                  <option value="low">{t('wishlist.lowPriority')}</option>
                </select>
              </div>

              {/* Rarity Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t('wishlist.filterByRarity')}:</label>
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('wishlist.allRarities')}</option>
                  <option value="common">{t('wishlist.common')}</option>
                  <option value="rare">{t('wishlist.rare')}</option>
                  <option value="epic">{t('wishlist.epic')}</option>
                  <option value="legendary">{t('wishlist.legendary')}</option>
                </select>
              </div>

              {/* Set Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t('wishlist.filterBySet')}:</label>
                <select
                  value={setFilter}
                  onChange={(e) => setSetFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('wishlist.allSets')}</option>
                  {uniqueSets.map((set) => (
                    <option key={set} value={set}>{set}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t('wishlist.sortBy')}:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "name" | "rarity" | "set" | "priority" | "date" | "price")}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">{t('wishlist.sortByName')}</option>
                  <option value="rarity">{t('wishlist.sortByRarity')}</option>
                  <option value="set">{t('wishlist.sortBySet')}</option>
                  <option value="priority">{t('wishlist.sortByPriority')}</option>
                  <option value="date">{t('wishlist.sortByDate')}</option>
                  <option value="price">{t('wishlist.sortByPrice')}</option>
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

              {/* Price Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">{t('wishlist.filterByPrice')}:</label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('wishlist.allPrices')}</option>
                  <option value="myPrice">{t('wishlist.myPrice')}</option>
                  <option value="marketPrice">{t('wishlist.marketPrice')}</option>
                </select>
              </div>

              {/* Price Range Inputs */}
              {priceFilter !== "all" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{t('wishlist.priceRange')}:</label>
                  <input
                    type="number"
                    placeholder={t('wishlist.minPrice')}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <span className="text-sm text-muted-foreground">-</span>
                  <input
                    type="number"
                    placeholder={t('wishlist.maxPrice')}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {/* Clear Filters */}
              {(searchTerm || priorityFilter !== "all" || rarityFilter !== "all" || setFilter !== "all" || priceFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setPriorityFilter("all");
                    setRarityFilter("all");
                    setSetFilter("all");
                    setPriceFilter("all");
                    setPriceRange({ min: "", max: "" });
                    setSortBy("name");
                    setSortOrder("asc");
                  }}
                >
                  {t('wishlist.clearFilters')}
                </Button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {t('wishlist.showing')} {filteredCards.length} {t('wishlist.of')} {wishlistCards.length} {t('wishlist.cards')}
            </div>
          </div>

          {/* View Mode Toggle */}
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

          {/* Cards Display */}
          {cardViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map((card) => (
                <div key={card.id} className="relative">
                  <TradingCard
                    {...card}
                    inCollection={false}
                    inWishlist={true}
                    isOwned={false}
                    isWishlisted={true}
                    onAddToCollection={() => {}}
                    onAddToWishlist={(e: any) => {
                      e?.stopPropagation?.();
                      handleRemoveFromWishlist(card.id, card.name);
                    }}
                    onAddToCart={() => {}}
                    onViewDetails={() => handleCardClick(card)}
                    hidePriceAndBuy={false}
                    disableHoverEffects={true}
                    priority={card.priority}
                    getPriorityText={() => getPriorityText(card.priority === 'high' ? 2 : card.priority === 'medium' ? 1 : 0, t)}
                    getPriorityColor={() => getPriorityColor(card.priority === 'high' ? 2 : card.priority === 'medium' ? 1 : 0)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCards.map((card) => (
                <div 
                  key={card.id} 
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
                          <Badge variant={getPriorityColor(card.priority === 'high' ? 2 : card.priority === 'medium' ? 1 : 0)} className="text-xs">
                            {getPriorityText(card.priority === 'high' ? 2 : card.priority === 'medium' ? 1 : 0, t)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('wishlist.added')}: {new Date(card.acquiredDate).toLocaleDateString()}
                        </p>
                        {/* Price Information */}
                        <div className="flex items-center gap-4 mt-2">
                          {typeof card.marketPrice === 'number' && card.marketPrice > 0 && (
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
                            handleRemoveFromWishlist(card.id, card.name);
                          }}
                          className="h-8 px-2"
                        >
                          {t('wishlist.remove')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? t('wishlist.noCardsFound') : t('wishlist.emptyWishlist')}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? t('wishlist.tryDifferentSearch') : t('wishlist.emptyWishlistSubtitle')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Price Trends Modal */}
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

export default Wishlist;
