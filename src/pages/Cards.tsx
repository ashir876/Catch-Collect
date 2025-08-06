
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, ShoppingCart, Star, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import TradingCard from "@/components/cards/TradingCard";
import { useToast } from "@/hooks/use-toast";
import { useCardsData, useCardsCount } from "@/hooks/useCardsData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { useQueryClient } from "@tanstack/react-query";
import { COLLECTION_QUERY_KEY } from "@/hooks/useCollectionData";
import { useWishlistData } from "@/hooks/useWishlistData";
import CardWithWishlist from "@/components/cards/CardWithWishlist";
import LanguageFilter from "@/components/LanguageFilter";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import React from "react"; // Added missing import
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";

const Cards = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const setFilter = searchParams.get("set");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hpRange, setHpRange] = useState({ min: "", max: "" });
  const [illustratorFilter, setIllustratorFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [wishlistFilter, setWishlistFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 items per page for more compact view
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch cards data with all filters
  const { data: cardsData, isLoading, error } = useCardsData({
    setId: setFilter || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter === "all" ? undefined : rarityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    hpMin: hpRange.min ? parseInt(hpRange.min) : undefined,
    hpMax: hpRange.max ? parseInt(hpRange.max) : undefined,
    illustrator: illustratorFilter === "all" ? undefined : illustratorFilter,
    collectionFilter: collectionFilter === "all" ? undefined : collectionFilter,
    wishlistFilter: wishlistFilter === "all" ? undefined : wishlistFilter,
    userId: user?.id
  });

  // Fetch total count for pagination with all filters
  const { data: totalCount = 0 } = useCardsCount({
    setId: setFilter || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter === "all" ? undefined : rarityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    hpMin: hpRange.min ? parseInt(hpRange.min) : undefined,
    hpMax: hpRange.max ? parseInt(hpRange.max) : undefined,
    illustrator: illustratorFilter === "all" ? undefined : illustratorFilter,
    collectionFilter: collectionFilter === "all" ? undefined : collectionFilter,
    wishlistFilter: wishlistFilter === "all" ? undefined : wishlistFilter,
    userId: user?.id
  });

  // Fetch wishlist data for all cards
  const { data: wishlistItems = [] } = useWishlistData({});

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleLanguageFilterChange = (newLanguageFilter: string) => {
    setLanguageFilter(newLanguageFilter);
    setCurrentPage(1);
  };

  const handleRarityFilterChange = (newRarityFilter: string) => {
    setRarityFilter(newRarityFilter);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (newTypeFilter: string) => {
    setTypeFilter(newTypeFilter);
    setCurrentPage(1);
  };

  const handleHpRangeChange = (newHpRange: { min: string; max: string }) => {
    setHpRange(newHpRange);
    setCurrentPage(1);
  };

  const handleIllustratorFilterChange = (newIllustratorFilter: string) => {
    setIllustratorFilter(newIllustratorFilter);
    setCurrentPage(1);
  };

  const handleCollectionFilterChange = (newCollectionFilter: string) => {
    setCollectionFilter(newCollectionFilter);
    setCurrentPage(1);
  };

  const handleWishlistFilterChange = (newWishlistFilter: string) => {
    setWishlistFilter(newWishlistFilter);
    setCurrentPage(1);
  };

  const handleReloadCollection = () => {
    queryClient.invalidateQueries({ queryKey: ['collection', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    toast({
      title: t('messages.collectionReloaded'),
      description: t('messages.collectionReloadedDescription'),
    });
  };



  // Use cards data directly since we're filtering by language at the database level
  const filteredCards = cardsData || [];

  // Test function to check database connectivity
  const testDatabaseConnection = async () => {

    
    try {
      // Test cards table
      const { data: cardsTest, error: cardsError } = await supabase
        .from('cards')
        .select('card_id, name, language')
        .limit(1);
      
      
      
      // Test card_wishlist table
      const { data: wishlistTest, error: wishlistError } = await supabase
        .from('card_wishlist')
        .select('*')
        .limit(1);
      
      
      
      // Test card_collections table
      const { data: collectionsTest, error: collectionsError } = await supabase
        .from('card_collections')
        .select('*')
        .limit(1);
      
      
      
    } catch (error) {
      console.error('Database connection test error:', error);
    }
  };

  // Run the test when component mounts
  React.useEffect(() => {
    testDatabaseConnection();
  }, []);

  const handleAddToCollection = async (cardId: string, cardName: string, cardLanguage?: string) => {

    
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }

    try {
      // First check if the card is already in the collection
      const { data: existingItem, error: checkError } = await supabase
        .from('card_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw checkError;
      }

      if (existingItem) {
        // Card is already in collection
        toast({
          title: t('messages.alreadyInCollection'),
          description: `${cardName} ${t('messages.alreadyInCollectionDescription')}`,
        });
        return;
      }

      // Get card data to insert into collection - use language if available to ensure unique card
      let query = supabase.from('cards').select('*').eq('card_id', cardId);
      if (cardLanguage) {
        query = query.eq('language', cardLanguage);
      }
      const { data: cardData, error: cardError } = await query.single();

      if (cardError) {
        console.error('Error fetching card data for collection:', cardError);
        throw cardError;
      }

      

      // Add to collection
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          card_id: cardId,
          language: cardData.language,
          name: cardData.name,
          set_name: cardData.set_name,
          set_id: cardData.set_id,
          card_number: cardData.card_number,
          rarity: cardData.rarity,
          image_url: cardData.image_url,
          description: cardData.description,
          illustrator: cardData.illustrator,
          hp: cardData.hp,
          types: cardData.types,
          attacks: cardData.attacks,
          weaknesses: cardData.weaknesses,
          retreat: cardData.retreat
        });

      if (error) {
        console.error('Error inserting collection item:', error);
        throw error;
      }

      // Optimistically update the collection cache
      queryClient.setQueryData(COLLECTION_QUERY_KEY(user.id), (oldData: any) => {
        if (!oldData) return oldData;
        
        const newCollectionItem = {
          id: Date.now(), // temporary ID
          card_id: cardId,
          user_id: user.id,
          created_at: new Date().toISOString(),
          language: cardData.language,
          cards: cardData
        };
        
        return [newCollectionItem, ...oldData];
      });

      // Refetch in background to ensure data consistency
      queryClient.invalidateQueries({ queryKey: COLLECTION_QUERY_KEY(user.id) });

      toast({
        title: t('messages.addedToCollection'),
        description: `${cardName} ${t('messages.addedToCollection').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      
      // Show more specific error message
      let errorMessage = t('messages.collectionError');
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('messages.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (cardId: string, cardName: string, cardLanguage?: string) => {

    
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredWishlist'),
        variant: "destructive",
      });
      return;
    }

    try {
      // First check if the card is already in the wishlist
      const { data: existingItems, error: checkError } = await supabase
        .from('card_wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('card_id', cardId);

      if (checkError) {
        console.error('Error checking existing wishlist item:', checkError);
        throw checkError;
      }

      if (existingItems && existingItems.length > 0) {
        // Card is already in wishlist
        toast({
          title: t('messages.alreadyInWishlist'),
          description: `${cardName} ${t('messages.alreadyInWishlistDescription')}`,
        });
        return;
      }

      // Get card data to get the language - use language if available to ensure unique card
      let query = supabase.from('cards').select('language').eq('card_id', cardId);
      if (cardLanguage) {
        query = query.eq('language', cardLanguage);
      }
      const { data: cardData, error: cardError } = await query.single();

      if (cardError) {
        console.error('Error fetching card data:', cardError);
        throw cardError;
      }

      

      // Add to wishlist
      const insertData = {
        user_id: user.id,
        card_id: cardId,
        language: cardData.language || 'en' // Default to 'en' if language is not available
      };
      
      
      
      const { error } = await supabase
        .from('card_wishlist')
        .insert(insertData);

      if (error) {
        console.error('Error inserting wishlist item:', error);
        throw error;
      }

      // Optimistically update the wishlist cache
      queryClient.setQueryData(['wishlist', user.id], (oldData: any) => {
        if (!oldData) return oldData;
        
        const newWishlistItem = {
          id: Date.now(), // temporary ID
          card_id: cardId,
          user_id: user.id,
          created_at: new Date().toISOString(),
          language: cardData.language,
          priority: 1, // default medium priority
          card: {
            name: cardName,
            set_name: '',
            rarity: '',
            image_url: '',
            price: 0
          }
        };
        
        return [newWishlistItem, ...oldData];
      });

      // Refetch in background to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });

      toast({
        title: t('messages.addedToWishlist'),
        description: `${cardName} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });
      
      // Show more specific error message
      let errorMessage = t('messages.wishlistError');
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('messages.error'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };



  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('cards.loadError')}</h2>
          <p className="text-muted-foreground">{t('cards.loadErrorSubtitle')}</p>
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
              {t('cards.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('cards.subtitle')}
          </p>
        </div>

      {/* Advanced Search and Filters */}
             <AdvancedFilters
         searchTerm={searchTerm}
         onSearchChange={handleSearchChange}
         languageFilter={languageFilter}
         onLanguageChange={handleLanguageFilterChange}
         rarityFilter={rarityFilter}
         onRarityChange={handleRarityFilterChange}
         typeFilter={typeFilter}
         onTypeChange={handleTypeFilterChange}
         hpRange={hpRange}
         onHpRangeChange={handleHpRangeChange}
         illustratorFilter={illustratorFilter}
         onIllustratorChange={handleIllustratorFilterChange}
         collectionFilter={collectionFilter}
         onCollectionChange={handleCollectionFilterChange}
         wishlistFilter={wishlistFilter}
         onWishlistChange={handleWishlistFilterChange}
         onReloadCollection={handleReloadCollection}
       />

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            size="sm"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            <List className="h-4 w-4" />
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

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {isLoading ? t('cards.loading') : `${filteredCards.length} ${filteredCards.length !== 1 ? t('cards.cards') : t('cards.card')} ${t('cards.found')}`}
        </p>
      </div>

      {/* Cards Display */}
      {isLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="pixel-card animate-pulse">
                <div className="aspect-[3/4] bg-muted"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 p-3 border rounded-lg">
                  <div className="w-16 h-20 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card) => {
            const isInWishlist = wishlistItems.some(item => item.card_id === card.card_id);
            
            return (
              <CardWithWishlist
                key={`${card.card_id}-${card.language}`}
                card={card}
                isInWishlist={isInWishlist}
                onAddToCollection={handleAddToCollection}
                onAddToWishlist={handleAddToWishlist}
                mapDatabaseRarityToComponent={mapDatabaseRarityToComponent}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => {
            const isInWishlist = wishlistItems.some(item => item.card_id === card.card_id);
            
            return (
              <Card key={`${card.card_id}-${card.language}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-20 flex-shrink-0">
                      <img
                        src={card.image_url || "/placeholder.svg"}
                        alt={card.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                          <p className="text-muted-foreground text-xs">{card.set_name} • {card.card_number}</p>
                          {card.rarity && (
                            <div className="mt-1">
                              {mapDatabaseRarityToComponent(card.rarity)}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCollection(card.card_id, card.name, card.language)}
                            className="h-8 px-2"
                          >
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button
                            variant={isInWishlist ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAddToWishlist(card.card_id, card.name, card.language)}
                            className="h-8 px-2"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{card.language}</Badge>
                        {card.hp && <Badge variant="outline" className="text-xs">HP: {card.hp}</Badge>}
                        {card.types && card.types.length > 0 && (
                          <Badge variant="outline" className="text-xs">{card.types[0]}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
      {!isLoading && filteredCards.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('cards.noCardsFound')}</h3>
          <p className="text-muted-foreground">
            {t('cards.noCardsSubtitle')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Cards;
