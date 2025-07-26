
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, ShoppingCart, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import React from "react"; // Added missing import

// Helper function to map database rarity to component rarity
const mapDatabaseRarityToComponent = (dbRarity: string): "common" | "rare" | "epic" | "legendary" => {
  const normalizedRarity = dbRarity.toLowerCase();
  
  switch (normalizedRarity) {
    // English terms
    case "common":
    case "uncommon":
      return "common";
    case "rare":
      return "rare";
    case "ultra rare":
    case "hyper rare":
      return "epic";
    case "legendary":
    case "secret rare":
      return "legendary";
    
    // German terms
    case "häufig":
      return "common";
    case "selten":
      return "rare";
    case "ungewöhnlich":
      return "rare";
    case "ultra selten":
      return "epic";
    case "versteckt selten":
      return "legendary";
    case "holografisch selten":
      return "legendary";
    case "holografisch selten v":
      return "legendary";
    case "doppelselten":
      return "legendary";
    case "shiny rare":
      return "legendary";
    case "keine":
      return "common";
    
    // French terms
    case "commune":
    case "peu commune":
    case "incomum":
      return "common";
    
    // Portuguese terms
    case "comum":
      return "common";
    
    default:
      console.warn(`Unknown database rarity: ${dbRarity}, defaulting to common`);
      return "common";
  }
};

const Cards = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const setFilter = searchParams.get("set");
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20); // Show 20 items per page
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch cards data with pagination (all languages)
  const { data: cardsData, isLoading, error } = useCardsData({
    setId: setFilter || undefined,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined
  });

  // Fetch total count for pagination (all languages)
  const { data: totalCount = 0 } = useCardsCount({
    setId: setFilter || undefined,
    searchTerm: searchTerm || undefined
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

  const handleRarityFilterChange = (newRarityFilter: string) => {
    setRarityFilter(newRarityFilter);
    setCurrentPage(1);
  };

  // Filter cards by rarity (client-side filtering since rarity is not in the database query)
  const filteredCards = cardsData?.filter(card => {
    const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
    return matchesRarity;
  }) || [];

  // Test function to check database connectivity
  const testDatabaseConnection = async () => {
    console.log('Testing database connection...');
    
    try {
      // Test cards table
      const { data: cardsTest, error: cardsError } = await supabase
        .from('cards')
        .select('card_id, name, language')
        .limit(1);
      
      console.log('Cards table test:', { data: cardsTest, error: cardsError });
      
      // Test card_wishlist table
      const { data: wishlistTest, error: wishlistError } = await supabase
        .from('card_wishlist')
        .select('*')
        .limit(1);
      
      console.log('Card wishlist table test:', { data: wishlistTest, error: wishlistError });
      
      // Test card_collections table
      const { data: collectionsTest, error: collectionsError } = await supabase
        .from('card_collections')
        .select('*')
        .limit(1);
      
      console.log('Card collections table test:', { data: collectionsTest, error: collectionsError });
      
    } catch (error) {
      console.error('Database connection test error:', error);
    }
  };

  // Run the test when component mounts
  React.useEffect(() => {
    testDatabaseConnection();
  }, []);

  const handleAddToCollection = async (cardId: string, cardName: string, cardLanguage?: string) => {
    console.log('handleAddToCollection called with:', { cardId, cardName, cardLanguage, user: user?.id });
    
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

      console.log('Card data for collection:', cardData);

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
    console.log('handleAddToWishlist called with:', { cardId, cardName, cardLanguage, user: user?.id });
    
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

      console.log('Card data for wishlist:', cardData);

      // Add to wishlist
      const insertData = {
        user_id: user.id,
        card_id: cardId,
        language: cardData.language || 'en' // Default to 'en' if language is not available
      };
      
      console.log('Inserting wishlist item:', insertData);
      
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

      toast({
        title: t('messages.addedToWishlist'),
        description: `${cardName} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('cards.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('cards.subtitle')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('cards.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Rarity Filter */}
          <div className="flex gap-2">
            <Button
              variant={rarityFilter === "all" ? "default" : "outline"}
              onClick={() => handleRarityFilterChange("all")}
              size="sm"
            >
              {t('cards.allRarities')}
            </Button>
            <Button
              variant={rarityFilter === "Common" ? "default" : "outline"}
              onClick={() => handleRarityFilterChange("Common")}
              size="sm"
            >
              {t('cards.common')}
            </Button>
            <Button
              variant={rarityFilter === "Rare" ? "default" : "outline"}
              onClick={() => handleRarityFilterChange("Rare")}
              size="sm"
            >
              {t('cards.rare')}
            </Button>
            <Button
              variant={rarityFilter === "Ultra Rare" ? "default" : "outline"}
              onClick={() => handleRarityFilterChange("Ultra Rare")}
              size="sm"
            >
              {t('cards.ultraRare')}
            </Button>
          </div>
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

      {/* Cards Grid */}
      {isLoading ? (
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
