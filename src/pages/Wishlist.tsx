
import { useState } from "react";
import { Search, Heart, TrendingUp, Clock, AlertCircle } from "lucide-react";
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
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { PriceTrendChart } from "@/components/pricing/PriceTrendChart";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [setFilter, setSetFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "rarity" | "set" | "priority" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Get priority value for filtering
  const getPriorityValue = (priorityFilter: string) => {
    if (priorityFilter === "all") return undefined;
    return priorityFilter === "high" ? 2 : priorityFilter === "medium" ? 1 : 0;
  };

  // Fetch wishlist data with pagination
  const { data: wishlistItems = [], isLoading, error } = useWishlistData({
    limit: itemsPerPage,
    offset,
    priority: getPriorityValue(priorityFilter),
    searchTerm: searchTerm || undefined
  });

  // Fetch total count for pagination
  const { data: totalCount = 0 } = useWishlistCount({
    priority: getPriorityValue(priorityFilter),
    searchTerm: searchTerm || undefined
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to first page when filters change
  const handleFilterChange = (newPriorityFilter: string) => {
    setPriorityFilter(newPriorityFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  // Calculate total wishlist value (this would need to be calculated from all items, not just current page)
  const totalWishlistValue = wishlistItems.reduce((sum, item) => sum + (item.card?.price || 0), 0);

  const handleRemoveFromWishlist = async (cardId: string, cardName: string) => {
    if (!user) return;
    
    // Optimistic update - remove the card from all wishlist caches immediately
    const wishlistQueryKey = ['wishlist', user.id];
    const previousData = queryClient.getQueryData(wishlistQueryKey);
    
    queryClient.setQueryData(wishlistQueryKey, (old: any) => {
      if (!old) return old;
      return old.filter((item: any) => item.card_id !== cardId);
    });
    
    // Also update the count query
    queryClient.setQueryData(['wishlist', user.id, undefined, undefined, undefined, undefined], (old: any) => {
      if (typeof old === 'number') return Math.max(0, old - 1);
      return old;
    });
    
    try {
      const { error } = await supabase
        .from('card_wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);
        
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

  // Removed handleAddToCart and handleRequestPrice functions for cleaner UI

  // Create card objects for the TradingCard component from wishlist items
  const createCardObject = (item: WishlistItem) => {
    if (!item.card) return null;
    
    return {
      id: item.card_id,
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
      availability: "in-stock"
    };
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
          <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
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



      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("wishlist.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t('wishlist.filterByPriority')}:</label>
            <div className="flex gap-1">
              <Button
                variant={priorityFilter === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange("all")}
                size="sm"
              >
                {t("common.all")}
              </Button>
              <Button
                variant={priorityFilter === "high" ? "default" : "outline"}
                onClick={() => handleFilterChange("high")}
                size="sm"
              >
                {t("wishlist.highPriority")}
              </Button>
              <Button
                variant={priorityFilter === "medium" ? "default" : "outline"}
                onClick={() => handleFilterChange("medium")}
                size="sm"
              >
                {t("wishlist.mediumPriority")}
              </Button>
              <Button
                variant={priorityFilter === "low" ? "default" : "outline"}
                onClick={() => handleFilterChange("low")}
                size="sm"
              >
                {t("wishlist.lowPriority")}
              </Button>
            </div>
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
              {Array.from(new Set(wishlistItems.map(item => item.card?.set_name).filter(Boolean))).sort().map((set) => (
                <option key={set} value={set}>{set}</option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t('wishlist.sortBy')}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "rarity" | "set" | "priority" | "date")}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">{t('wishlist.sortByName')}</option>
              <option value="rarity">{t('wishlist.sortByRarity')}</option>
              <option value="set">{t('wishlist.sortBySet')}</option>
              <option value="priority">{t('wishlist.sortByPriority')}</option>
              <option value="date">{t('wishlist.sortByDate')}</option>
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

          {/* Clear Filters */}
          {(searchTerm || priorityFilter !== "all" || rarityFilter !== "all" || setFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setPriorityFilter("all");
                setRarityFilter("all");
                setSetFilter("all");
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
          {t('wishlist.showing')} {wishlistItems.length} {t('wishlist.of')} {totalCount} {t('wishlist.cards')}
        </div>
      </div>

      {/* Pagination Info */}
      {totalCount > 0 && (
        <div className="mb-4">
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {wishlistItems.map((item) => {
          const card = createCardObject(item);
          if (!card) return null;
          
          return (
            <TradingCard
              key={item.id}
              {...card}
              onAddToCollection={() => {}}
              onAddToWishlist={() => handleRemoveFromWishlist(item.card_id, card.name)}
              // Pass priority for badges
              priority={item.priority === 2 ? "high" : item.priority === 1 ? "medium" : "low"}
              // Pass translation function for badge text
              getPriorityText={() => getPriorityText(item.priority, t)}
              getPriorityColor={() => getPriorityColor(item.priority)}
              inWishlist={true}
              hidePriceAndBuy={true}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("wishlist.noCardsFound")}</h3>
          <p className="text-muted-foreground">
            {searchTerm ? t("wishlist.tryDifferentSearch") : t("wishlist.emptyWishlistSubtitle")}
          </p>
        </div>
      )}

      {/* Price Trends Chart */}
      {wishlistItems.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('pricing.price.trends')}</CardTitle>
              <CardDescription>{t('pricing.price.trends.for')} {wishlistItems[0].card?.name || 'Sample Card'}</CardDescription>
            </CardHeader>
            <CardContent>
              <PriceTrendChart
                cardId={wishlistItems[0].card_id}
                showControls={true}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons - Removed for cleaner UI */}
    </div>
  );
};

export default Wishlist;
