
import { useState } from "react";
import { Search, Heart, ShoppingCart, TrendingUp, Trash2, MessageSquare, Clock, AlertCircle } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

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
    
    try {
      const { error } = await supabase
        .from('card_wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('card_id', cardId);
        
      if (error) throw error;
      
      toast({
        title: t("messages.removedFromWishlist"),
        description: `${cardName} ${t("messages.hasBeenRemovedFromWishlist")}`,
      });
      
      // Manually trigger a refetch of the wishlist data
      // This will be handled by the useQuery invalidation
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast({
        title: t("messages.error"),
        description: t("messages.wishlistRemoveError"),
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = (cardId: string, cardName: string) => {
    toast({
      title: t("messages.addedToCart"),
      description: `${cardName} ${t("messages.hasBeenAddedToCart")}`,
    });
  };

  const handleRequestPrice = (cardId: string, cardName: string) => {
    toast({
      title: t("messages.priceRequest"),
      description: `${t("messages.priceRequestSent")} ${cardName}`,
    });
  };

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
      price: item.card.price || 0,
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t("wishlist.title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("wishlist.subtitle")}
        </p>
      </div>

      {/* Wishlist Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("wishlist.cardsOnWishlist")}</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              {wishlistItems.filter(i => i.card?.price).length} {t("wishlist.available")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("wishlist.totalValue")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">CHF {totalWishlistValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">
              {t("wishlist.average")}: CHF {wishlistItems.length ? (totalWishlistValue / wishlistItems.length).toFixed(2) : "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("wishlist.highPriority")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wishlistItems.filter(i => i.priority === 2).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("wishlist.highPriorityCards")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("wishlist.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
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
              onAddToCart={() => handleAddToCart(item.card_id, card.name)}
              // New overlay actions for wishlist
              onRequestPrice={() => handleRequestPrice(item.card_id, card.name)}
              onRemoveFromWishlist={() => handleRemoveFromWishlist(item.card_id, card.name)}
              // Pass priority and price for badges
              priority={item.priority === 2 ? "high" : item.priority === 1 ? "medium" : "low"}
              priceAvailable={!!item.card?.price}
              // Pass translation function for badge text
              getPriorityText={() => getPriorityText(item.priority, t)}
              getPriorityColor={() => getPriorityColor(item.priority)}
              inWishlist={true}
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

      {/* Action Buttons */}
      {totalCount > 0 && (
        <div className="flex justify-center gap-4 mt-8 pt-8 border-t">
          <Button variant="outline" size="lg">
            <MessageSquare className="mr-2 h-4 w-4" />
            {t("wishlist.requestAllPrices")}
          </Button>
          <Button size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t("wishlist.buyAvailableCards")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
