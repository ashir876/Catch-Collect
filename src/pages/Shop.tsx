import { useState } from "react";
import { Search, ShoppingCart, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartActions } from "@/hooks/useCartActions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';

// Mock shop data with placeholder images
const shopCards = [
  {
    id: "1",
    name: "Pikachu VMAX Rainbow",
    series: "Sword & Shield",
    set: "Vivid Voltage",
    number: "188/185",
    rarity: "legendary" as const,
    type: "Electric",
    price: 159.99,
    originalPrice: 189.99,
    image: "https://images.pokemontcg.io/swsh4/188_hires.png",
    inCollection: false,
    inWishlist: true,
    description: "Ultra rare rainbow variant of Pikachu VMAX",
    stock: 3,
    condition: "Near Mint"
  },
  {
    id: "2",
    name: "Charizard VSTAR",
    series: "Sword & Shield", 
    set: "Brilliant Stars",
    number: "018/172",
    rarity: "epic" as const,
    type: "Fire",
    price: 89.99,
    image: "https://images.pokemontcg.io/swsh9/18_hires.png",
    inCollection: false,
    inWishlist: false,
    description: "Powerful Charizard VSTAR card",
    stock: 7,
    condition: "Mint"
  },
  {
    id: "3",
    name: "Arceus V",
    series: "Sword & Shield",
    set: "Brilliant Stars", 
    number: "122/172",
    rarity: "rare" as const,
    type: "Normal",
    price: 24.99,
    image: "https://images.pokemontcg.io/swsh9/122_hires.png",
    inCollection: true,
    inWishlist: false,
    description: "The Alpha Pokémon in V form",
    stock: 12,
    condition: "Near Mint"
  },
  {
    id: "4",
    name: "Professor's Research",
    series: "Sword & Shield",
    set: "Champion's Path",
    number: "062/073", 
    rarity: "common" as const,
    type: "Trainer",
    price: 2.99,
    image: "https://images.pokemontcg.io/swsh35/62_hires.png",
    inCollection: false,
    inWishlist: false,
    description: "Essential trainer card for any deck",
    stock: 25,
    condition: "Near Mint"
  }
];

const Shop = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart, isLoading } = useCartActions();

  let filteredCards = shopCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
    
    let matchesPrice = true;
    switch (priceFilter) {
      case "under25":
        matchesPrice = card.price < 25;
        break;
      case "25to50":
        matchesPrice = card.price >= 25 && card.price <= 50;
        break;
      case "50to100":
        matchesPrice = card.price >= 50 && card.price <= 100;
        break;
      case "over100":
        matchesPrice = card.price > 100;
        break;
    }
    
    return matchesSearch && matchesRarity && matchesPrice;
  });

  // Sort cards
  filteredCards = filteredCards.sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "rarity":
        const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      default:
        return 0;
    }
  });

  const handleAddToCart = async (card: typeof shopCards[0]) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        article_number: card.id,
        price: card.price,
        quantity: 1
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
          <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
            <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {t('shop.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('shop.subtitle')}
          </p>
        </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
            <Input
              placeholder={t('shop.searchPlaceholder')}
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

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Price Filters */}
          <div className="flex gap-2">
            <Button
              variant={priceFilter === "all" ? "default" : "outline"}
              onClick={() => setPriceFilter("all")}
              size="sm"
            >
              {t('shop.allPrices')}
            </Button>
            <Button
              variant={priceFilter === "under25" ? "default" : "outline"}
              onClick={() => setPriceFilter("under25")}
              size="sm"
            >
              {t('shop.under25')}
            </Button>
            <Button
              variant={priceFilter === "25to50" ? "default" : "outline"}
              onClick={() => setPriceFilter("25to50")}
              size="sm"
            >
              {t('shop.price25to50')}
            </Button>
            <Button
              variant={priceFilter === "50to100" ? "default" : "outline"}
              onClick={() => setPriceFilter("50to100")}
              size="sm"
            >
              {t('shop.price50to100')}
            </Button>
            <Button
              variant={priceFilter === "over100" ? "default" : "outline"}
              onClick={() => setPriceFilter("over100")}
              size="sm"
            >
              {t('shop.over100')}
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "price-low" ? "default" : "outline"}
              onClick={() => setSortBy("price-low")}
              size="sm"
            >
              {t('shop.priceLow')}
            </Button>
            <Button
              variant={sortBy === "price-high" ? "default" : "outline"}
              onClick={() => setSortBy("price-high")}
              size="sm"
            >
              {t('shop.priceHigh')}
            </Button>
            <Button
              variant={sortBy === "rarity" ? "default" : "outline"}
              onClick={() => setSortBy("rarity")}
              size="sm"
            >
              {t('cards.rarity')}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {filteredCards.length} {filteredCards.length !== 1 ? t('cards.cards') : t('cards.card')} {t('cards.found')}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('shop.stock')}:</span>
          <Badge variant="secondary">{t('shop.inStock')}</Badge>
        </div>
      </div>

      {/* Cards Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card) => (
            <div key={card.id} className="relative group">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-105 h-96 w-full">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  
                  {/* Overlay with buttons - positioned over the image */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleAddToCart(card)}
                        disabled={isLoading}
                        className="w-full"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('shop.addToCart')}
                      </Button>
                    </div>
                  </div>

                  {/* Stock indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={card.stock > 5 ? "default" : "destructive"} className="text-xs">
                      {card.stock > 5 ? t('shop.inStock') : `${card.stock} ${t('shop.left')}`}
                    </Badge>
                  </div>
                  
                  {/* Discount indicator */}
                  {card.originalPrice && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round(((card.originalPrice - card.price) / card.originalPrice) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 h-48 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{card.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2">{card.set} • {card.number}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">CHF {card.price.toFixed(2)}</div>
                      {card.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          CHF {card.originalPrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">{card.condition}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-32 flex-shrink-0">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{card.name}</h3>
                        <p className="text-muted-foreground">{card.set} • {card.number}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">CHF {card.price.toFixed(2)}</div>
                        {card.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">
                            CHF {card.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{card.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{card.condition}</Badge>
                        <Badge variant={card.stock > 5 ? "default" : "destructive"}>
                          {card.stock > 5 ? t('shop.inStock') : `${card.stock} ${t('shop.left')}`}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleAddToCart(card)}
                        disabled={isLoading}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {t('shop.addToCart')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('shop.noCardsFound')}</h3>
          <p className="text-muted-foreground">
            {t('shop.noCardsSubtitle')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Shop;
