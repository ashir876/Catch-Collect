import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { useCollectionData } from "@/hooks/useCollectionData";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import CardWithWishlist from "@/components/cards/CardWithWishlist";
import AddToCollectionModal from "@/components/cards/AddToCollectionModal";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import { useQueryClient } from "@tanstack/react-query";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";

interface SetData {
  set_id: string;
  name: string;
  logo_url?: string;
  symbol_url?: string;
  release_date?: string;
  total?: number;
  language?: string;
  series_name?: string;
}

const SetDetail = () => {
  const { t } = useTranslation();
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [setData, setSetData] = useState<SetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states - same as Cards page
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hpRange, setHpRange] = useState({ min: "", max: "" });
  const [illustratorFilter, setIllustratorFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [wishlistFilter, setWishlistFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [evolveFromFilter, setEvolveFromFilter] = useState("all");
  const [retreatCostFilter, setRetreatCostFilter] = useState("all");
  const [regulationMarkFilter, setRegulationMarkFilter] = useState("all");
  const [formatLegalityFilter, setFormatLegalityFilter] = useState("all");
  const [weaknessTypeFilter, setWeaknessTypeFilter] = useState("all");
  const [setsFilter, setSetsFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Modal state
  const [isAddToCollectionModalOpen, setIsAddToCollectionModalOpen] = useState(false);
  const [selectedCardForCollection, setSelectedCardForCollection] = useState<any>(null);

  // Collection and wishlist actions
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  // Fetch collection data to show owned status
  const { data: collectionItems = [] } = useCollectionData();

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch cards for this set with filters
  const [cardsData, setCardsData] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCards = async () => {
      if (!setId) {
        console.log('No setId provided');
        return;
      }

      console.log('Fetching cards for setId:', setId);

      setCardsLoading(true);
      setCardsError(null);

      try {
        let query = supabase
          .from('cards')
          .select('*')
          .eq('set_id', setId)
          .order('name');

        // Apply filters
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        if (languageFilter !== "all") {
          query = query.eq('language', languageFilter);
        }

        if (rarityFilter !== "all") {
          query = query.eq('rarity', rarityFilter);
        }

        if (typeFilter !== "all") {
          query = query.eq('type', typeFilter);
        }

        if (hpRange.min) {
          query = query.gte('hp', parseInt(hpRange.min));
        }

        if (hpRange.max) {
          query = query.lte('hp', parseInt(hpRange.max));
        }

        if (illustratorFilter !== "all") {
          query = query.eq('illustrator', illustratorFilter);
        }

        if (categoryFilter !== "all") {
          query = query.eq('category', categoryFilter);
        }

        if (stageFilter !== "all") {
          query = query.eq('stage', stageFilter);
        }

        if (evolveFromFilter !== "all") {
          query = query.eq('evolve_from', evolveFromFilter);
        }

        if (retreatCostFilter !== "all") {
          query = query.eq('retreat_cost', retreatCostFilter);
        }

        if (regulationMarkFilter !== "all") {
          query = query.eq('regulation_mark', regulationMarkFilter);
        }

        if (formatLegalityFilter !== "all") {
          query = query.eq('format_legality', formatLegalityFilter);
        }

        if (weaknessTypeFilter !== "all") {
          query = query.eq('weakness_type', weaknessTypeFilter);
        }

        // Apply pagination
        query = query.range(offset, offset + itemsPerPage - 1);

        const { data, error } = await query;

        if (error) throw error;

        console.log('Cards found for set:', data?.length || 0);
        setCardsData(data || []);

        // Get total count for pagination
        const { count } = await supabase
          .from('cards')
          .select('*', { count: 'exact', head: true })
          .eq('set_id', setId);

        setTotalCount(count || 0);

      } catch (error) {
        console.error('Error fetching cards:', error);
        console.error('Error details:', {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint
        });
        setCardsError(error as Error);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchCards();
  }, [setId, searchTerm, languageFilter, rarityFilter, typeFilter, hpRange, illustratorFilter, categoryFilter, stageFilter, evolveFromFilter, retreatCostFilter, regulationMarkFilter, formatLegalityFilter, weaknessTypeFilter, currentPage, offset, itemsPerPage]);

  // Fetch set information
  useEffect(() => {
    const fetchSetData = async () => {
      if (!setId) return;

      console.log('Fetching set data for setId:', setId);

      try {
        const { data, error } = await supabase
          .from('sets')
          .select(`
            set_id,
            name,
            logo_url,
            symbol_url,
            release_date,
            language,
            series_id
          `)
          .eq('set_id', setId)
          .order('language', { ascending: true })
          .limit(1);

        if (error) throw error;

        // Get the first (and should be only) set data
        const setData = data?.[0];
        if (!setData) {
          throw new Error('Set not found');
        }

        // If we have a series_id, fetch the series name separately
        let seriesName = null;
        if (setData.series_id) {
          try {
            const { data: seriesData, error: seriesError } = await supabase
              .from('series')
              .select('series_name')
              .eq('series_id', setData.series_id)
              .single();
            
            if (seriesError) {
              console.warn('Could not fetch series name:', seriesError);
            } else {
              seriesName = seriesData?.series_name;
            }
          } catch (seriesError) {
            console.warn('Error fetching series name:', seriesError);
          }
        }

        setSetData({
          ...setData,
          series_name: seriesName,
          total: totalCount
        });
      } catch (error) {
        console.error('Error fetching set data:', error);
        toast({
          title: t('error.title'),
          description: t('error.fetchSetData'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetData();
  }, [setId, toast, t, totalCount]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Filter change handlers - same as Cards page
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
    queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    toast({
      title: t('messages.collectionReloaded'),
      description: t('messages.collectionReloadedDescription'),
    });
  };

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
  const handleAddToCollectionWithDetails = async (data: {
    condition: string;
    price: number;
    date: string;
  }) => {
    if (!user || !selectedCardForCollection) return;

    try {
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          card_id: selectedCardForCollection.card_id,
          language: selectedCardForCollection.language || 'en',
          condition: data.condition,
          price: data.price,
          notes: `Acquired on: ${data.date}`,
        });
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      setIsAddToCollectionModalOpen(false);
      setSelectedCardForCollection(null);
      
      toast({
        title: t('messages.addedToCollection'),
        description: `${selectedCardForCollection.name} ${t('messages.addedToCollection').toLowerCase()}.`,
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="pixel-card animate-pulse">
                <div className="aspect-[3/4] bg-muted"></div>
                <div className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!setData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('setDetail.setNotFound')}</h1>
          <Button onClick={() => navigate('/sets')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backToSets')}
          </Button>
        </div>
      </div>
    );
  }

  if (cardsError) {
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
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate('/sets')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.backToSets')}
      </Button>

      {/* Header - same style as Cards page */}
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
          <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
            {setData.name}
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
          {setData.series_name && `${setData.series_name} • `}
          {setData.release_date && `${t('setDetail.released')}: ${new Date(setData.release_date).toLocaleDateString()} • `}
          {totalCount} {t('setDetail.cards')}
        </p>
      </div>

      {/* Advanced Search and Filters - same as Cards page */}
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

      {/* View Mode Toggle - same as Cards page */}
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

      {/* Pagination Info - same as Cards page */}
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

      {/* Cards Display - same as Cards page */}
      {cardsLoading ? (
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
          {cardsData.map((card) => (
            <CardWithWishlist
              key={`${card.card_id}-${card.language}`}
              card={card}
              hidePriceAndBuy={true}
              onAddToCollection={handleAddToCollection}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {cardsData.map((card) => (
            <div key={`${card.card_id}-${card.language}`} className="flex gap-3 p-3 border rounded-lg">
              <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border-2 border-black">
                <img
                  src={card.image_url || '/placeholder.svg'}
                  alt={card.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{card.name}</h3>
                <p className="text-muted-foreground text-xs">#{card.card_number}</p>
                {card.rarity && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">{card.rarity}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - same as Cards page */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State - same as Cards page */}
      {!cardsLoading && cardsData.length === 0 && (
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
    </div>
  );
};

export default SetDetail;
