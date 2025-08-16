import { useState, useEffect } from "react";
import { Search, ShoppingCart, Filter, Grid3X3, List, Package, Star, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCartActions } from "@/hooks/useCartActions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useProductsData } from "@/hooks/useProductsData";
import { useSetsData } from "@/hooks/useSetsData";
import { useSeriesData } from "@/hooks/useSeriesData";
import { useCartCount } from "@/hooks/useCartCount";
import SetsLanguageFilter from "@/components/SetsLanguageFilter";
import SeriesLanguageFilter from "@/components/SeriesLanguageFilter";

const Shop = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("cards");
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

      {/* Tabs for different shop categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
          <TabsTrigger value="cards" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('shop.shopFromCards')}</span>
            <span className="sm:hidden">Cards</span>
          </TabsTrigger>
          <TabsTrigger value="sets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('shop.shopFromSets')}</span>
            <span className="sm:hidden">Sets</span>
          </TabsTrigger>
          <TabsTrigger value="series" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('shop.shopFromSeries')}</span>
            <span className="sm:hidden">Series</span>
          </TabsTrigger>
        </TabsList>

        {/* Shop from Cards Tab */}
        <TabsContent key="cards-tab" value="cards">
          <ShopFromCards />
        </TabsContent>

        {/* Shop from Sets Tab */}
        <TabsContent key="sets-tab" value="sets">
          <ShopFromSets />
        </TabsContent>

        {/* Shop from Series Tab */}
        <TabsContent key="series-tab" value="series">
          <ShopFromSeries />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for shopping individual cards
const ShopFromCards = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isLoading } = useCartActions();

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

  // Use products data from Supabase
  const { data: productsData = [], isLoading: productsLoading } = useProductsData('en', 100);

  // Filter products based on price and rarity
  let filteredProducts = productsData.filter(product => {
    // Use actual product price from database
    const productPrice = product.price || 0;
    
    let matchesPrice = true;
    switch (priceFilter) {
      case "under25":
        matchesPrice = productPrice < 25;
        break;
      case "25to50":
        matchesPrice = productPrice >= 25 && productPrice <= 50;
        break;
      case "50to100":
        matchesPrice = productPrice >= 50 && productPrice <= 100;
        break;
      case "over100":
        matchesPrice = productPrice > 100;
        break;
      default:
        matchesPrice = true; // Show all products when no price filter is selected
    }

    // Filter by rarity if specified
    let matchesRarity = true;
    if (rarityFilter !== "all" && product.rarity) {
      matchesRarity = product.rarity.toLowerCase() === rarityFilter.toLowerCase();
    }
    
    return matchesPrice && matchesRarity;
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    
    switch (sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "name":
        return (a.name || '').localeCompare(b.name || '');
      case "rarity":
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        const rarityA = rarityOrder[(a.rarity || 'common').toLowerCase() as keyof typeof rarityOrder] || 0;
        const rarityB = rarityOrder[(b.rarity || 'common').toLowerCase() as keyof typeof rarityOrder] || 0;
        return rarityB - rarityA;
      default:
        return 0;
    }
  });

  // Apply pagination to filtered and sorted products
  const displayProducts = filteredProducts;

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
      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        {/* Search Bar and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5 z-10" />
            <Input
              placeholder={t('shop.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            />
          </div>
          
          <div className="flex gap-2 justify-center sm:justify-start">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="ml-1 sm:hidden">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <List className="h-4 w-4" />
              <span className="ml-1 sm:hidden">List</span>
            </Button>
          </div>
        </div>

        {/* Filter Buttons - Responsive Layout */}
        <div className="space-y-3">
          {/* Price Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="text-sm font-semibold text-gray-700 sm:hidden">Price Range:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={priceFilter === "all" ? "default" : "outline"}
                onClick={() => setPriceFilter("all")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.allPrices')}
              </Button>
              <Button
                variant={priceFilter === "under25" ? "default" : "outline"}
                onClick={() => setPriceFilter("under25")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.under25')}
              </Button>
              <Button
                variant={priceFilter === "25to50" ? "default" : "outline"}
                onClick={() => setPriceFilter("25to50")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.25to50')}
              </Button>
              <Button
                variant={priceFilter === "50to100" ? "default" : "outline"}
                onClick={() => setPriceFilter("50to100")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.50to100')}
              </Button>
              <Button
                variant={priceFilter === "over100" ? "default" : "outline"}
                onClick={() => setPriceFilter("over100")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.over100')}
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row gap-2">
            <span className="text-sm font-semibold text-gray-700 sm:hidden">Sort By:</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sortBy === "newest" ? "default" : "outline"}
                onClick={() => setSortBy("newest")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.newest')}
              </Button>
              <Button
                variant={sortBy === "price-low" ? "default" : "outline"}
                onClick={() => setSortBy("price-low")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.priceLow')}
              </Button>
              <Button
                variant={sortBy === "price-high" ? "default" : "outline"}
                onClick={() => setSortBy("price-high")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.priceHigh')}
              </Button>
              <Button
                variant={sortBy === "name" ? "default" : "outline"}
                onClick={() => setSortBy("name")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.name')}
              </Button>
              <Button
                variant={sortBy === "rarity" ? "default" : "outline"}
                onClick={() => setSortBy("rarity")}
                size="sm"
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                {t('shop.rarity')}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
            {displayProducts.map((product, index) => {
              const productPrice = product.price || 0;
              const stock = product.stock || 0; // Use actual stock from database
              return (
                <Card key={`${product.article_number || product.id}-${index}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Smaller product image */}
                      <div className="w-10 h-14 sm:w-12 sm:h-16 flex-shrink-0">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-contain rounded bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      
                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{product.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{product.set_name || product.category} • {product.card_number || product.article_number}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-sm sm:text-base font-bold text-primary">CHF {productPrice.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Badges and Add to Cart button */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">{product.rarity || 'N/A'}</Badge>
                          <Badge variant={stock > 5 ? "default" : "destructive"} className="text-xs px-1 py-0">
                            {stock > 5 ? t('shop.inStock') : `${stock} ${t('shop.left')}`}
                          </Badge>
                        </div>
                        <Button 
                          onClick={() => handleAddToCart(product)}
                          disabled={isLoading}
                          size="sm"
                          className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                        >
                          <ShoppingCart className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Empty State */}
      {!productsLoading && filteredProducts.length === 0 && (
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

// Component for shopping complete sets
const ShopFromSets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isLoading } = useCartActions();

  // Reset pagination when component mounts or when tab becomes active
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, languageFilter]);

  // Use real TCG API data - fetch more data for client-side pagination
  const { data: setsData = [], isLoading: setsLoading } = useSetsData({
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined,
    limit: 100, // Fetch more data for client-side pagination
    offset: 0
  });

  // Apply pagination to sets data - ensure strict 12 set limit
  const totalPages = Math.ceil(setsData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, setsData.length);
  const paginatedSets = setsData.slice(startIndex, endIndex);
  
  // Force exactly 12 sets maximum
  const displaySets = paginatedSets.slice(0, 12);
  
  // Ensure we never exceed 12 sets per page
  if (paginatedSets.length > itemsPerPage) {
    console.warn('Sets pagination exceeded limit:', paginatedSets.length, '>', itemsPerPage);
  }

  const handleAddSetToCart = async (set: any) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock price for complete set - in real app this would come from the database
      const setPrice = (set.total || 50) * 2.99; // Estimated price per card
      await addToCart({
        article_number: `set-${set.set_id}`,
        price: setPrice,
        quantity: 1
      });
      toast({
        title: t('messages.addedToCart'),
        description: `${set.name} complete set has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding set to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add set to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Search and View Toggle */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
            <Input
              placeholder={t('sets.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            />
          </div>
          
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
        
        {/* Language Filter */}
        <SetsLanguageFilter
          selectedLanguage={languageFilter}
          onLanguageChange={(newLanguage) => {
            console.log('Language filter changed from', languageFilter, 'to', newLanguage);
            setLanguageFilter(newLanguage);
          }}
          className="mb-4"
        />
      </div>

      {/* Total Count Display for Sets */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-green-700">
              Showing {displaySets.length} of {setsData.length} sets
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-700">Complete Sets:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Available</Badge>
          </div>
        </div>
      </div>

      {/* Sets Display */}
      {setsLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-4 border-black animate-pulse h-96">
                <div className="h-48 bg-muted"></div>
                <CardHeader className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displaySets.map((set, index) => {
              const setPrice = (set.total || 50) * 2.99;
              return (
                <Card 
                  key={`${set.set_id}-${index}`} 
                  className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl group h-96 flex flex-col cursor-pointer"
                  onClick={() => {
                    console.log('Current languageFilter before navigation:', languageFilter);
                    const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                    console.log('Grid view - Navigating to set with language:', languageFilter, 'URL:', `/set/${set.set_id}${languageParam}`);
                    navigate(`/set/${set.set_id}${languageParam}`);
                  }}
                >
                  <div className="h-48 bg-white flex items-center justify-center p-4 overflow-hidden flex-shrink-0 relative">
                    {set.logo_url ? (
                      <img
                        src={set.logo_url}
                        alt={set.name || 'Set Logo'}
                        className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-black font-black text-xl text-center">
                        {set.name}
                      </div>
                    )}
                    
                    {/* Overlay with buy button */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSetToCart(set);
                        }}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('shop.buyCompleteSet')}
                      </Button>
                    </div>
                  </div>
                  
                  <CardHeader className="bg-background flex-1 flex flex-col justify-between p-4">
                    <div>
                      <CardTitle className="font-black text-lg uppercase tracking-wide line-clamp-2">
                        {set.name || t('sets.unknownSet')}
                      </CardTitle>
                      <CardDescription className="font-bold text-muted-foreground">
                        {t('sets.cardCount')}: {set.total || 0}
                      </CardDescription>
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-green-600">
                        CHF {setPrice.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('shop.completeSet')}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {displaySets.map((set, index) => {
              const setPrice = (set.total || 50) * 2.99;
              return (
                <Card 
                  key={`${set.set_id}-${index}`} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    console.log('Current languageFilter before navigation (list):', languageFilter);
                    const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                    console.log('List view - Navigating to set with language:', languageFilter, 'URL:', `/set/${set.set_id}${languageParam}`);
                    navigate(`/set/${set.set_id}${languageParam}`);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="w-24 h-32 flex-shrink-0">
                        {set.logo_url ? (
                          <img
                            src={set.logo_url}
                            alt={set.name || 'Set Logo'}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-white border-2 border-black rounded-lg flex items-center justify-center">
                            <div className="text-black font-black text-sm text-center">
                              {set.name}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{set.name || t('sets.unknownSet')}</h3>
                            <p className="text-muted-foreground">{t('sets.cardCount')}: {set.total || 0}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">CHF {setPrice.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {t('shop.completeSet')}
                          </div>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSetToCart(set);
                            }}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t('shop.buyCompleteSet')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Empty State */}
      {!setsLoading && paginatedSets.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('sets.noSetsFound')}</h3>
          <p className="text-muted-foreground">
            {t('sets.noSetsFoundSubtitle')}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!setsLoading && paginatedSets.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {t('common.previous')}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

// Component for shopping complete series
const ShopFromSeries = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isLoading } = useCartActions();

  // Reset pagination when component mounts or when tab becomes active
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, languageFilter]);

  // Use real TCG API data - fetch more data for client-side pagination
  const { data: seriesData = [], isLoading: seriesLoading } = useSeriesData({
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined,
    limit: 100, // Fetch more data for client-side pagination
    offset: 0
  });

  // Apply pagination to series data - ensure strict 12 series limit
  const totalPages = Math.ceil(seriesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, seriesData.length);
  const paginatedSeries = seriesData.slice(startIndex, endIndex);
  
  // Force exactly 12 series maximum
  const displaySeries = paginatedSeries.slice(0, 12);
  
  // Ensure we never exceed 12 series per page
  if (paginatedSeries.length > itemsPerPage) {
    console.warn('Series pagination exceeded limit:', paginatedSeries.length, '>', itemsPerPage);
  }

  const handleAddSeriesToCart = async (series: any) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock price for complete series
      const seriesPrice = 299.99; // Fixed price for series
      await addToCart({
        article_number: `series-${series.series_id}`,
        price: seriesPrice,
        quantity: 1
      });
      toast({
        title: t('messages.addedToCart'),
        description: `${series.series_name} complete series has been added to your cart`,
      });
    } catch (error) {
      console.error('Error adding series to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add series to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Search and View Toggle */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
            <Input
              placeholder={t('series.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            />
          </div>
          
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
        
        {/* Language Filter */}
        <SeriesLanguageFilter
          selectedLanguage={languageFilter}
          onLanguageChange={setLanguageFilter}
          className="mb-4"
        />
      </div>

      {/* Total Count Display for Series */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-purple-700">
              Showing {displaySeries.length} of {seriesData.length} series
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-700">Complete Series:</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">Available</Badge>
          </div>
        </div>
      </div>

      {/* Series Display */}
      {seriesLoading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-4 border-black animate-pulse h-96">
                <div className="h-48 bg-muted"></div>
                <CardHeader className="p-4">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 bg-muted rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displaySeries.map((series, index) => (
              <Card 
                key={`${series.series_id}-${index}`} 
                className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl group h-96 flex flex-col cursor-pointer"
                onClick={() => {
                  const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                  navigate(`/series${languageParam}`);
                }}
              >
                <div className="h-48 bg-white flex items-center justify-center p-4 overflow-hidden flex-shrink-0 relative">
                  {series.logo_url ? (
                    <img 
                      src={series.logo_url} 
                      alt={series.series_name || 'Series'} 
                      className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-black font-black text-xl text-center">
                      <Star className="h-16 w-16 mx-auto mb-2" />
                      {series.series_name}
                    </div>
                  )}
                  
                  {/* Overlay with buy button */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSeriesToCart(series);
                      }}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('shop.buyCompleteSeries')}
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="bg-background flex-1 flex flex-col justify-between p-4">
                  <div>
                    <CardTitle className="font-black text-lg uppercase tracking-wide line-clamp-2">
                      {series.series_name}
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground">
                      ID: {series.series_id}
                    </CardDescription>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-purple-600">
                      CHF 299.99
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('shop.completeSeries')}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displaySeries.map((series, index) => (
              <Card 
                key={`${series.series_id}-${index}`} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                  navigate(`/series${languageParam}`);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 flex-shrink-0">
                      {series.logo_url ? (
                        <img 
                          src={series.logo_url} 
                          alt={series.series_name || 'Series'} 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-white border-2 border-black rounded-lg flex items-center justify-center">
                          <Star className="h-8 w-8 text-black mb-1" />
                          <div className="text-black font-black text-sm text-center">
                            {series.series_name}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{series.series_name}</h3>
                          <p className="text-muted-foreground">ID: {series.series_id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">CHF 299.99</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {t('shop.completeSeries')}
                        </div>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSeriesToCart(series);
                          }}
                          disabled={isLoading}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {t('shop.buyCompleteSeries')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Empty State */}
      {!seriesLoading && paginatedSeries.length === 0 && (
        <div className="text-center py-12">
          <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('series.noSeriesFound')}</h3>
          <p className="text-muted-foreground">
            {t('series.noSeriesSubtitle')}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!seriesLoading && paginatedSeries.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            {t('common.previous')}
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= totalPages}
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Shop;
