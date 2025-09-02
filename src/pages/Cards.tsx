
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, ShoppingCart, Star, Filter, Grid3X3, List, CheckCircle } from "lucide-react";
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
import CardWithWishlist from "@/components/cards/CardWithWishlist";
import LanguageFilter from "@/components/LanguageFilter";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import CardDetailModal from "@/components/cards/CardDetailModal";
import AddToCollectionModal from "@/components/cards/AddToCollectionModal";
import BulkAddToCollectionModal from "@/components/cards/BulkAddToCollectionModal";
import React from "react"; // Added missing import
import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";

const Cards = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const setFilter = searchParams.get("set");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hpRange, setHpRange] = useState({ min: "", max: "" });
  const [illustratorFilter, setIllustratorFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [wishlistFilter, setWishlistFilter] = useState("all");
  // New filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [evolveFromFilter, setEvolveFromFilter] = useState("all");
  const [retreatCostFilter, setRetreatCostFilter] = useState("all");
  const [regulationMarkFilter, setRegulationMarkFilter] = useState("all");
  const [formatLegalityFilter, setFormatLegalityFilter] = useState("all");
  const [weaknessTypeFilter, setWeaknessTypeFilter] = useState("all");
  const [setsFilter, setSetsFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 items per page for more compact view
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Selection state for bulk actions
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  
  // Modal state
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
  const [selectedCardForCollection, setSelectedCardForCollection] = useState<any>(null);
  const [isBulkAddToCollectionModalOpen, setIsBulkAddToCollectionModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch cards data with all filters
  const { data: cardsData, isLoading, error } = useCardsData({
    setId: (setFilter || (setsFilter !== "all" ? setsFilter : undefined)) || undefined,
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
    userId: user?.id,
    // New filters
    category: categoryFilter === "all" ? undefined : categoryFilter,
    stage: stageFilter === "all" ? undefined : stageFilter,
    evolveFrom: evolveFromFilter === "all" ? undefined : evolveFromFilter,
    retreatCost: retreatCostFilter === "all" ? undefined : retreatCostFilter,
    regulationMark: regulationMarkFilter === "all" ? undefined : regulationMarkFilter,
    formatLegality: formatLegalityFilter === "all" ? undefined : formatLegalityFilter,
    weaknessType: weaknessTypeFilter === "all" ? undefined : weaknessTypeFilter
  });

  // Fetch total count for pagination with all filters
  const { data: totalCount = 0 } = useCardsCount({
    setId: (setFilter || (setsFilter !== "all" ? setsFilter : undefined)) || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter === "all" ? undefined : rarityFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    hpMin: hpRange.min ? parseInt(hpRange.min) : undefined,
    hpMax: hpRange.max ? parseInt(hpRange.max) : undefined,
    illustrator: illustratorFilter === "all" ? undefined : illustratorFilter,
    collectionFilter: collectionFilter === "all" ? undefined : collectionFilter,
    wishlistFilter: wishlistFilter === "all" ? undefined : wishlistFilter,
    userId: user?.id,
    // New filters
    category: categoryFilter === "all" ? undefined : categoryFilter,
    stage: stageFilter === "all" ? undefined : stageFilter,
    evolveFrom: evolveFromFilter === "all" ? undefined : evolveFromFilter,
    retreatCost: retreatCostFilter === "all" ? undefined : retreatCostFilter,
    regulationMark: regulationMarkFilter === "all" ? undefined : regulationMarkFilter,
    formatLegality: formatLegalityFilter === "all" ? undefined : formatLegalityFilter,
    weaknessType: weaknessTypeFilter === "all" ? undefined : weaknessTypeFilter
  });



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

  // Initialize and update language filter from URL parameters
  React.useEffect(() => {
    const urlLanguage = searchParams.get("language");
    if (urlLanguage) {
      setLanguageFilter(urlLanguage);
    }
  }, [searchParams]);

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

  // New filter change handlers
  const handleCategoryFilterChange = (newCategoryFilter: string) => {
    setCategoryFilter(newCategoryFilter);
    setCurrentPage(1);
  };

  const handleStageFilterChange = (newStageFilter: string) => {
    setStageFilter(newStageFilter);
    setCurrentPage(1);
  };

  const handleEvolveFromFilterChange = (newEvolveFromFilter: string) => {
    setEvolveFromFilter(newEvolveFromFilter);
    setCurrentPage(1);
  };

  const handleRetreatCostFilterChange = (newRetreatCostFilter: string) => {
    setRetreatCostFilter(newRetreatCostFilter);
    setCurrentPage(1);
  };

  const handleRegulationMarkFilterChange = (newRegulationMarkFilter: string) => {
    setRegulationMarkFilter(newRegulationMarkFilter);
    setCurrentPage(1);
  };

  const handleFormatLegalityFilterChange = (newFormatLegalityFilter: string) => {
    setFormatLegalityFilter(newFormatLegalityFilter);
    setCurrentPage(1);
  };

  const handleWeaknessTypeFilterChange = (newWeaknessTypeFilter: string) => {
    setWeaknessTypeFilter(newWeaknessTypeFilter);
    setCurrentPage(1);
  };

  const handleSetsFilterChange = (newSetsFilter: string) => {
    setSetsFilter(newSetsFilter);
    setCurrentPage(1);
  };

  const handleReloadCollection = () => {
    queryClient.invalidateQueries({ queryKey: ['collection', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['collection-count', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    toast({
      title: t('messages.collectionReloaded'),
      description: t('messages.collectionReloadedDescription'),
    });
  };

  // Bulk selection handlers
  const handleCardSelection = (cardId: string, isSelected: boolean) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(card => `${card.card_id}-${card.language}`)));
    }
  };

  const handleBulkAddToCollection = () => {
    if (selectedCards.size === 0) {
      toast({
        title: t('messages.noCardsSelected'),
        description: t('messages.pleaseSelectCards'),
        variant: "destructive",
      });
      return;
    }
    setIsBulkAddToCollectionModalOpen(true);
  };

  const handleBulkAddToCollectionWithDetails = async (cardDetails: { [cardId: string]: {
    condition: string;
    price: number;
    date: string;
    notes: string;
  }}) => {
    if (!user || selectedCards.size === 0) return;

    try {
      const selectedCardData = filteredCards.filter(card => 
        selectedCards.has(`${card.card_id}-${card.language}`)
      );

      // Insert records with individual details for each card (one copy per card)
      const insertData = [];
      for (const card of selectedCardData) {
        const cardId = `${card.card_id}-${card.language}`;
        const details = cardDetails[cardId];
        
        if (details) {
          insertData.push({
            user_id: user.id,
            card_id: card.card_id,
            language: card.language || 'en',
            // Store full card details for proper display
            name: card.name,
            set_name: card.set_name,
            set_id: card.set_id,
            card_number: card.card_number,
            rarity: card.rarity,
            image_url: card.image_url,
            description: card.description,
            illustrator: card.illustrator,
            hp: card.hp,
            types: card.types,
            attacks: card.attacks,
            weaknesses: card.weaknesses,
            retreat: card.retreat,
            series_name: card.series_name,
            condition: details.condition,
            price: details.price,
            notes: details.notes || `Acquired on: ${details.date}`,
          });
        }
      }

      const { error } = await supabase
        .from('card_collections')
        .insert(insertData);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      setIsBulkAddToCollectionModalOpen(false);
      setSelectedCards(new Set());
      setIsBulkSelectionMode(false);
      
      const totalCards = selectedCardData.length;
      const totalCopies = insertData.length;
      
      toast({
        title: t('messages.addedToCollection'),
        description: `${totalCards} cards added to collection (${totalCopies} total copies).`,
      });
    } catch (error) {
      console.error('Error adding cards to collection:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  const toggleBulkSelectionMode = () => {
    setIsBulkSelectionMode(!isBulkSelectionMode);
    if (isBulkSelectionMode) {
      setSelectedCards(new Set());
    }
  };



  // Use cards data directly since we're filtering by language at the database level
  const filteredCards = cardsData || [];

  // Handler for opening add to collection modal
  const handleAddToCollection = (card) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }
    setSelectedCardForCollection(card);
    setIsAddToCollectionModalOpen(true);
  };

  // Handler for adding to collection with modal data
  const handleAddToCollectionWithDetails = async (entries: Array<{
    id: string;
    condition: string;
    price: number;
    date: string;
    notes: string;
    language: string;
    acquiredDate: string;
  }>) => {
    if (!user || !selectedCardForCollection) return;

    try {
      // Create insert data for all entries (each entry represents one card copy)
      const insertData = entries.map(entry => ({
        user_id: user.id,
        card_id: selectedCardForCollection.card_id,
        language: entry.language || selectedCardForCollection.language || 'en',
        // Store full card details for proper display
        name: selectedCardForCollection.name,
        set_name: selectedCardForCollection.set_name,
        set_id: selectedCardForCollection.set_id,
        card_number: selectedCardForCollection.card_number,
        rarity: selectedCardForCollection.rarity,
        image_url: selectedCardForCollection.image_url,
        description: selectedCardForCollection.description,
        illustrator: selectedCardForCollection.illustrator,
        hp: selectedCardForCollection.hp,
        types: selectedCardForCollection.types,
        attacks: selectedCardForCollection.attacks,
        weaknesses: selectedCardForCollection.weaknesses,
        retreat: selectedCardForCollection.retreat,
        series_name: selectedCardForCollection.series_name,
        condition: entry.condition,
        price: entry.price,
        notes: entry.notes || `Acquired on: ${entry.date}`,
      }));

      const { error } = await supabase
        .from('card_collections')
        .insert(insertData);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      setIsAddToCollectionModalOpen(false);
      setSelectedCardForCollection(null);
      
      const totalCopies = entries.length;
      toast({
        title: t('messages.addedToCollection'),
        description: `${selectedCardForCollection.name} ${t('messages.addedToCollection').toLowerCase()} (${totalCopies} ${totalCopies === 1 ? 'copy' : 'copies'}).`,
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  // Handler for adding to wishlist from list view
  const handleAddToWishlist = async (card) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredWishlist'),
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('card_wishlist')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
          language: card.language || 'en',
        });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });
      toast({
        title: t('messages.addedToWishlist'),
        description: `${card.name} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.wishlistError'),
        variant: "destructive",
      });
    }
  };

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
         // New filter props
         categoryFilter={categoryFilter}
         onCategoryChange={handleCategoryFilterChange}
         stageFilter={stageFilter}
         onStageChange={handleStageFilterChange}
         evolveFromFilter={evolveFromFilter}
         onEvolveFromChange={handleEvolveFromFilterChange}
         retreatCostFilter={retreatCostFilter}
         onRetreatCostChange={handleRetreatCostFilterChange}
         regulationMarkFilter={regulationMarkFilter}
         onRegulationMarkChange={handleRegulationMarkFilterChange}
         formatLegalityFilter={formatLegalityFilter}
         onFormatLegalityChange={handleFormatLegalityFilterChange}
         weaknessTypeFilter={weaknessTypeFilter}
         onWeaknessTypeChange={handleWeaknessTypeFilterChange}
         setsFilter={setsFilter}
         onSetsChange={handleSetsFilterChange}
       />

      {/* View Mode Toggle and Bulk Actions */}
      <div className="flex justify-between items-center mb-6">
        {/* Bulk Selection Controls */}
        {isBulkSelectionMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCards.size} of {filteredCards.length} selected
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkAddToCollection}
              disabled={selectedCards.size === 0}
            >
              Add {selectedCards.size} to Collection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBulkSelectionMode}
            >
              Cancel
            </Button>
          </div>
        )}
        
        {/* View Mode Toggle */}
        <div className="flex gap-2 ml-auto">
          <Button
            variant={isBulkSelectionMode ? "outline" : "default"}
            size="sm"
            onClick={toggleBulkSelectionMode}
          >
            {isBulkSelectionMode ? 'Exit Selection' : 'Select Multiple'}
          </Button>
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

      {/* Pagination Info and Controls */}
      {totalCount > 0 && (
        <div className="mb-4 space-y-4">
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}



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
           {filteredCards.map((card) => (
             <div key={`${card.card_id}-${card.language}`} className="relative">
               {/* Selection Checkbox */}
               {isBulkSelectionMode && (
                 <div className="absolute top-2 left-2 z-50">
                   <input
                     type="checkbox"
                     checked={selectedCards.has(`${card.card_id}-${card.language}`)}
                     onChange={(e) => {
                       e.stopPropagation();
                       handleCardSelection(`${card.card_id}-${card.language}`, e.target.checked);
                     }}
                     onClick={(e) => e.stopPropagation()}
                     className="w-4 h-4 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-2 cursor-pointer"
                   />
                 </div>
               )}
               <CardWithWishlist
                 card={card}
                 hidePriceAndBuy={true}
                 onAddToCollection={handleAddToCollection}
               />
             </div>
           ))}
         </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => (
            <div key={`${card.card_id}-${card.language}`} className="relative">
              {/* Selection Checkbox */}
              {isBulkSelectionMode && (
                <div className="absolute top-2 left-2 z-50">
                  <input
                    type="checkbox"
                    checked={selectedCards.has(`${card.card_id}-${card.language}`)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCardSelection(`${card.card_id}-${card.language}`, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-primary bg-background border-2 border-primary rounded focus:ring-primary focus:ring-2 cursor-pointer"
                  />
                </div>
              )}
              <CardWithWishlist
                card={card}
                hidePriceAndBuy={true}
                onAddToCollection={handleAddToCollection}
              />
            </div>
          ))}
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

      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={isAddToCollectionModalOpen}
        onClose={() => {
          setIsAddToCollectionModalOpen(false);
          setSelectedCardForCollection(null);
        }}
        onAdd={handleAddToCollectionWithDetails}
        cardName={selectedCardForCollection?.name || ''}
        isLoading={isAddingToCollection}
      />

      {/* Bulk Add to Collection Modal */}
      <BulkAddToCollectionModal
        isOpen={isBulkAddToCollectionModalOpen}
        onClose={() => {
          setIsBulkAddToCollectionModalOpen(false);
        }}
        onAdd={handleBulkAddToCollectionWithDetails}
        selectedCards={filteredCards.filter(card => 
          selectedCards.has(`${card.card_id}-${card.language}`)
        )}
        isLoading={isAddingToCollection}
      />
    </div>
  );
};

// CardListItem component for list view
const CardListItem = ({
  card,
  addToCollection,
  removeFromCollection,
  isAddingToCollection,
  isRemovingFromCollection,
  addToWishlist,
  removeFromWishlist,
  isAddingToWishlist,
  isRemovingFromWishlist,
}) => {
  const { data: isInCollection = false } = useIsCardInCollection(card.card_id);
  const { data: isInWishlist = false } = useIsCardInWishlist(card.card_id);

  const handleCollectionClick = (e) => {
    e.stopPropagation();
    if (isInCollection) {
      removeFromCollection({ cardId: card.card_id });
    } else {
      addToCollection(card);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist({ cardId: card.card_id });
    } else {
      addToWishlist({ cardId: card.card_id, cardName: card.name, cardLanguage: card.language });
    }
  };

  return (
    <CardDetailModal key={`${card.card_id}-${card.language}`} card={card}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="flex gap-3 items-center relative">
            {/* Collection Status Icon - Top Right */}
            {isInCollection && (
              <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-lg border-2 border-white flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">Collected</span>
              </div>
            )}
            <div className="w-20 h-28 flex-shrink-0">
              <img
                src={card.image_url || "/placeholder.svg"}
                alt={card.name}
                className="w-full h-full object-contain rounded-lg pointer-events-none"
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
                      <Badge variant="secondary" className="text-xs" key={`${card.card_id}-${card.rarity}`}>{card.rarity}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant={isInCollection ? "destructive" : "outline"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleCollectionClick}
                    disabled={isAddingToCollection || isRemovingFromCollection}
                  >
                    <Star className={`h-3 w-3 ${isInCollection ? 'fill-white stroke-red-500' : ''}`} strokeWidth={2} />
                  </Button>
                  <Button
                    variant={isInWishlist ? "destructive" : "outline"}
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleWishlistClick}
                    disabled={isAddingToWishlist || isRemovingFromWishlist}
                  >
                    <Heart className={`h-3 w-3 ${isInWishlist ? 'fill-white stroke-pink-500' : ''}`} strokeWidth={2} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs" key={`${card.card_id}-${card.language}`}>{card.language}</Badge>
                {card.hp && <Badge variant="outline" className="text-xs" key={`${card.card_id}-hp`}>HP: {card.hp}</Badge>}
                {card.types && card.types.length > 0 && (
                  <Badge variant="outline" className="text-xs" key={`${card.card_id}-${card.types[0]}`}>{card.types[0]}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </CardDetailModal>
  );
};

export default Cards;
