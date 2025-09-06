import { useState, useEffect } from "react";
import { Search, ShoppingCart, Filter, Grid3X3, List } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartActions } from "@/hooks/useCartActions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useProductsData, useProductsCount } from "@/hooks/useProductsData";
import { useProductsFilterOptions } from "@/hooks/useProductsFilterOptions";
import { useCartCount } from "@/hooks/useCartCount";
import { useQueryClient } from "@tanstack/react-query";
import AdvancedFilters from "@/components/filters/AdvancedFilters";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import ShopProductListItem from "@/components/cards/ShopProductListItem";

const Shop = () => {
  const { t } = useTranslation();
  const { data: cartCount = 0 } = useCartCount();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-8 uppercase tracking-wider">
          <span className="bg-yellow-400 text-black px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 border-2 sm:border-3 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
            {t('shop.title')}
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground font-bold px-2">
          {t('shop.subtitle')}
        </p>
        {cartCount > 0 && (
          <div className="mt-3 sm:mt-4">
            <Link to="/cart">
              <Badge variant="secondary" className="text-xs sm:text-sm hover:bg-secondary/80 cursor-pointer transition-colors">
                <ShoppingCart className="mr-1 h-3 w-3" />
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
              </Badge>
            </Link>
          </div>
        )}
      </div>

      {/* Shop Cards Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{t('shop.shopFromCards')}</h2>
        </div>
        <ShopFromCards />
      </div>
    </div>
  );
};

// Component for shopping individual cards
const ShopFromCards = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [hpRange, setHpRange] = useState({ min: "", max: "" });
  const [illustratorFilter, setIllustratorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [evolveFromFilter, setEvolveFromFilter] = useState("all");
  const [retreatCostFilter, setRetreatCostFilter] = useState("all");
  const [regulationMarkFilter, setRegulationMarkFilter] = useState("all");
  const [formatLegalityFilter, setFormatLegalityFilter] = useState("all");
  const [weaknessTypeFilter, setWeaknessTypeFilter] = useState("all");
  const [setsFilter, setSetsFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [wishlistFilter, setWishlistFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 items per page
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isLoading } = useCartActions();

  // Reset page when filters change
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
    // This function can be used to reload collection data if needed
    console.log('Reloading collection data...');
  };

  // Helper function to get consistent mock price based on rarity and card ID
  const getMockPrice = (rarity: string, cardId: string) => {
    // Use card ID to generate consistent price for each card
    const hash = cardId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const random = Math.abs(hash) / 2147483647; // Normalize to 0-1
    
    switch (rarity) {
      case 'common':
        return random * 5 + 1; // 1-6 CHF
      case 'rare':
        return random * 20 + 5; // 5-25 CHF
      case 'epic':
        return random * 50 + 25; // 25-75 CHF
      case 'legendary':
        return random * 200 + 100; // 100-300 CHF
      default:
        return random * 10 + 2; // 2-12 CHF
    }
  };

  // Helper function to get consistent stock based on card ID
  const getMockStock = (cardId: string) => {
    // Use card ID to generate consistent stock for each card
    const hash = cardId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const random = Math.abs(hash) / 2147483647; // Normalize to 0-1
    return Math.floor(random * 20) + 1; // 1-20 stock
  };



  // Initialize and update language filter from URL parameters
  useEffect(() => {
    const urlLanguage = searchParams.get("language");
    if (urlLanguage) {
      setLanguageFilter(urlLanguage);
    }
  }, [searchParams]);

  // Get filter options data
  const { data: filterOptions } = useProductsFilterOptions(languageFilter);

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Use products data from Supabase with all filters applied
  const { data: productsData = [], isLoading: productsLoading } = useProductsData({
    language: languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter !== 'all' ? rarityFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    illustrator: illustratorFilter !== 'all' ? illustratorFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    evolveFrom: evolveFromFilter !== 'all' ? evolveFromFilter : undefined,
    setsFilter: setsFilter !== 'all' ? setsFilter : undefined,
    sortBy
  });

  // Get total count for pagination
  const { data: totalCount = 0 } = useProductsCount({
    language: languageFilter,
    searchTerm: searchTerm || undefined,
    rarity: rarityFilter !== 'all' ? rarityFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    illustrator: illustratorFilter !== 'all' ? illustratorFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    evolveFrom: evolveFromFilter !== 'all' ? evolveFromFilter : undefined,
    setsFilter: setsFilter !== 'all' ? setsFilter : undefined
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Display products
  const displayProducts = productsData;

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    // Validate product data
    if (!product || !product.article_number || !product.name) {
      console.error('Invalid product data:', product);
      toast({
        title: "Error",
        description: "Invalid product data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productPrice = product.price || 0;
      
      const cartItem = {
        article_number: product.article_number,
        price: productPrice,
        quantity: 1
      };
      
      console.log('Adding product to cart:', { product, cartItem, productPrice });
      
      // Test the addToCart function
      try {
        await addToCart(cartItem);
        console.log('Successfully added to cart');
        
        toast({
          title: t('messages.addedToCart'),
          description: `${product.name} has been added to your cart`,
        });
      } catch (addError) {
        console.error('Error in addToCart:', addError);
        throw addError;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'No message');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      toast({
        title: "Error",
        description: `Failed to add item to cart: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
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
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
      />

      {/* View Mode Toggle */}
      <div className="flex justify-end items-center mb-6">
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

      {/* Products Display */}
      {productsLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted"></div>
                <CardContent className="p-3 sm:p-4">
                  <div className="h-4 sm:h-6 bg-muted rounded mb-1 sm:mb-2"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-3">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-10 h-14 sm:w-12 sm:h-16 bg-muted rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-1 sm:mb-2"></div>
                      <div className="h-3 bg-muted rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Products Display */
        viewMode === "grid" ? (
          <div key="grid-view" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {displayProducts.map((product, index) => {
              const productPrice = product.price || 0;
              const stock = product.stock || 0; // Use actual stock from database
              return (
                <div key={`${product.article_number || product.id}-${index}`} className="relative group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105 w-full flex flex-col h-full">
                    <div className="relative aspect-[3/4] overflow-visible">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      
                      {/* Overlay with Add to Cart button */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          disabled={isLoading}
                          className="w-full text-xs sm:text-sm"
                        >
                          <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {t('shop.addToCart')}
                        </Button>
                      </div>

                      {/* Stock indicator */}
                      <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                        <Badge variant={stock > 5 ? "default" : "destructive"} className="text-xs px-1 sm:px-2 py-0">
                          {stock > 5 ? t('shop.inStock') : `${stock} ${t('shop.left')}`}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">{product.set_name || product.category} • {product.card_number || product.article_number}</p>
                      </div>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="text-right">
                          <div className="text-base sm:text-xl font-bold text-primary">CHF {productPrice.toFixed(2)}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs px-1 sm:px-2 py-0">{product.rarity || 'N/A'}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ) : (
          <div key="list-view" className="space-y-2">
            {displayProducts.map((product, index) => (
              <ShopProductListItem
                key={`${product.article_number || product.id}-${index}`}
                product={product}
                onAddToCart={handleAddToCart}
                isLoading={isLoading}
              />
            ))}
          </div>
        )
      )}

      {/* Bottom Pagination Controls */}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State */}
      {!productsLoading && displayProducts.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('shop.noProductsFound')}</h3>
          <p className="text-muted-foreground">
            {t('shop.noProductsSubtitle')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;
