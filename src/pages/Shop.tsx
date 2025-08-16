import { useState, useEffect } from "react";
import { Search, ShoppingCart, Filter, Grid3X3, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartActions } from "@/hooks/useCartActions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useProductsData } from "@/hooks/useProductsData";
import { useCartCount } from "@/hooks/useCartCount";

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

export default Shop;
