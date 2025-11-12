
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Grid3X3, Star, TrendingUp, Users, Trophy, Package, ShoppingCart, X } from "lucide-react";
import { useSeriesData, useSeriesCount } from "@/hooks/useSeriesData";
import { useProductsData } from "@/hooks/useProductsData";
import { useSetsData, useSetsCount } from "@/hooks/useSetsData";
import { useUsersCount } from "@/hooks/useProfilesCount";
import { useCardsCount } from "@/hooks/useCardsData";
import { useTranslation } from 'react-i18next';
import SearchBar from "@/components/SearchBar";
import UserStats from "@/components/user/UserStats";

import { useAuth } from "@/contexts/AuthContext";
import CardWithWishlist from "@/components/cards/CardWithWishlist";
import { useCartActions } from "@/hooks/useCartActions";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart, isLoading: isAddingToCart } = useCartActions();
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  
  const { data: seriesData, isLoading: seriesLoading } = useSeriesData({ language: 'en' });
  const { data: productsData, isLoading: productsLoading } = useProductsData({ language: i18n.language, limit: 10 });
  const { data: setsData, isLoading: setsLoading } = useSetsData({ language: 'en' });

  const { data: totalCardsCount = 0 } = useCardsCount({}); 
  const { data: totalSeriesCount = 0 } = useSeriesCount({});
  const { data: totalSetsCount = 0 } = useSetsCount({});
  const { data: totalCollectorsCount = 0 } = useUsersCount();

  const getMockPrice = (rarity: string, cardId: string) => {
    const basePrice = {
      'common': 2.50,
      'uncommon': 5.00,
      'rare': 12.00,
      'rare holo': 25.00,
      'ultra rare': 50.00,
      'secret rare': 100.00
    };
    const base = basePrice[rarity.toLowerCase() as keyof typeof basePrice] || 5.00;
    
    const hash = cardId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const variation = (hash % 100) / 100; 
    return base * (0.8 + variation * 0.4); 
  };

  const getMockStock = (cardId: string) => {
    const hash = cardId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 20) + 1; 
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsCardDialogOpen(true);
  };

  const handleAddToCart = async (product: any) => {
    if (!user) {
      toast({
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredCart"),
        variant: "destructive"
      });
      return;
    }

    const productPrice = product.price || 0;
    
    try {
      await addToCart({
        article_number: product.article_number || product.card_id,
        price: productPrice,
        quantity: 1
      });
      
      toast({
        title: t("messages.addedToCart"),
        description: `${product.name} ${t("messages.hasBeenAddedToCart")}`,
      });
    } catch (error) {
      toast({
        title: t("messages.error"),
        description: t("messages.cartError"),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        <div className="animate-float-1 absolute top-20 left-10 w-12 h-12 bg-primary/20 border-2 border-black transform rotate-12"></div>
        <div className="animate-float-2 absolute top-40 right-20 w-8 h-8 bg-accent/20 border-2 border-black transform -rotate-45"></div>
        <div className="animate-float-3 absolute bottom-60 left-1/4 w-10 h-10 bg-secondary/20 border-2 border-black transform rotate-45"></div>
        <div className="animate-float-1 absolute bottom-40 right-1/3 w-6 h-6 bg-primary/30 border-2 border-black transform -rotate-12"></div>
        <div className="animate-float-2 absolute top-1/3 left-1/2 w-14 h-14 bg-accent/10 border-2 border-black transform rotate-45"></div>
        <div className="animate-float-3 absolute top-60 right-10 w-9 h-9 bg-secondary/25 border-2 border-black transform -rotate-45"></div>
        <div className="animate-float-1 absolute bottom-20 left-1/2 w-7 h-7 bg-primary/15 border-2 border-black transform rotate-12"></div>
        <div className="animate-float-2 absolute top-32 left-1/3 w-11 h-11 bg-accent/25 border-2 border-black transform -rotate-12"></div>
      </div>

      {}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative z-10">
        <div className="container mx-auto text-center px-4">
          {}
          <div className="mb-8">
            <img 
              src="/Catch-Collect-uploads/a2f24a7d-97d1-4e80-a75b-8cadfd0435ea.png" 
              alt="Catch Collect Logo" 
              className="h-20 md:h-32 w-auto mx-auto pixelated drop-shadow-2xl"
            />
          </div>
          
          {}
          <h1 className="pixel-text-yellow-animated mb-4">
            {t('home.mainTitle')}
          </h1>
          
          {}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-bold max-w-2xl mx-auto">
            {t('home.mainSubtitle')}
          </p>
          
          {}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/shop">
              <Button className="pixel-button text-lg px-12 py-6 bg-white hover:bg-gray-100 hover:scale-105 transition-all duration-200 text-black font-bold border-2 border-black">
                {t('home.shopNow')}
              </Button>
            </Link>
            <Link to="/collection">
              <Button className="pixel-button text-lg px-12 py-6 bg-blue-800 hover:bg-blue-900 hover:scale-105 transition-all duration-200 text-white font-bold">
                {t('home.myCollection')}
              </Button>
            </Link>
          </div>

          {}
          <div className="w-full px-4 mb-16">
            <SearchBar />
          </div>
        </div>
      </section>

      {}
      <section className="py-12 px-4 bg-muted/20 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-wider">
            <span className="bg-accent text-accent-foreground px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-none">
              {t('home.quickStats')}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="pixel-card text-center p-6">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">{totalCardsCount || 0}</div>
              <p className="text-sm text-muted-foreground">{t('home.totalCards')}</p>
            </div>
            <div className="pixel-card text-center p-6">
              <Grid3X3 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">{totalSeriesCount || 0}</div>
              <p className="text-sm text-muted-foreground">{t('home.series')}</p>
            </div>
            <div className="pixel-card text-center p-6">
              <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">{totalSetsCount || 0}</div>
              <p className="text-sm text-muted-foreground">{t('home.sets')}</p>
            </div>
            <div className="pixel-card text-center p-6">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <div className="text-3xl font-bold mb-2">{totalCollectorsCount || 0}</div>
              <p className="text-sm text-muted-foreground">{t('home.collectors')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {}
      {}

      {}
      <section className="py-12 sm:py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 sm:mb-12 uppercase tracking-wider">
            <span className="bg-accent text-accent-foreground px-4 sm:px-6 py-2 sm:py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-none">
              {t('home.shopProducts')}
            </span>
          </h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(10)].map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {productsData?.slice(0, 10).map((product, index) => {
                const productPrice = product.price || 0;
                const stock = product.stock || 0;
                
                return (
                  <div key={`${product.article_number || product.id}-${index}`} className="relative">
                    <Card className="overflow-hidden w-full flex flex-col h-full cursor-pointer" onClick={() => handleCardClick(product)}>
                      <div className="relative aspect-[3/4] overflow-visible">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        
                        {}
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
                        <div className="flex justify-between items-center mt-auto mb-2">
                          <div className="text-right">
                            <div className="text-base sm:text-xl font-bold text-primary">CHF {productPrice.toFixed(2)}</div>
                          </div>
                          <Badge variant="secondary" className="text-xs px-1 sm:px-2 py-0">{product.rarity || 'N/A'}</Badge>
                        </div>
                        
                        {}
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={isAddingToCart}
                          className="w-full text-xs sm:text-sm"
                        >
                          <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {t('shop.addToCart')}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12">
            <Link to="/shop">
              <Button className="pixel-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-all duration-200">
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                {t('home.shopNow')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {}
      {user && (
        <section className="py-12 sm:py-16 px-4 bg-background relative z-10">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 sm:mb-12 uppercase tracking-wider">
              <span className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-none">
                <Trophy className="inline mr-2 h-6 w-6 sm:h-8 sm:w-8" />
                {t('home.yourProgress')}
              </span>
            </h2>
            <UserStats />
          </div>
        </section>
      )}

      {}
      <section className="py-12 sm:py-16 px-4 bg-muted/20 relative z-10">
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 sm:mb-12 uppercase tracking-wider px-4">
            <span className="bg-accent text-accent-foreground px-4 sm:px-6 py-2 sm:py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-none">
              {t('home.community')}
            </span>
          </h2>
          {}
        </div>
      </section>

      {}
      <section className="py-16 sm:py-24 px-4 bg-primary text-primary-foreground relative z-10">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase mb-6 sm:mb-8 tracking-wider drop-shadow-lg px-4">
            {t('home.readyForAdventure')}
          </h2>
          <p className="text-lg sm:text-xl font-bold mb-8 sm:mb-12 px-4">
            {t('home.adventureSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link to="/collection">
              <Button className="pixel-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-background text-foreground hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                {t('home.myCollection')}
              </Button>
            </Link>
            <Link to="/wishlist">
              <Button variant="secondary" className="pixel-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                {t('home.myWishlist')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCard?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCard && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="flex justify-center">
                <img
                  src={selectedCard.image_url || "/placeholder.svg"}
                  alt={selectedCard.name}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              
              {}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedCard.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedCard.set_name} • {selectedCard.card_number}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedCard.rarity}</Badge>
                  <Badge variant={getMockStock(selectedCard.card_id) > 5 ? "default" : "destructive"}>
                    {getMockStock(selectedCard.card_id) > 5 ? t('shop.inStock') : `${getMockStock(selectedCard.card_id)} ${t('shop.left')}`}
                  </Badge>
                </div>
                
                <div className="text-3xl font-bold text-primary">
                  CHF {getMockPrice(selectedCard.rarity || 'common', selectedCard.card_id).toFixed(2)}
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleAddToCart(selectedCard)}
                    disabled={isAddingToCart}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {t('shop.addToCart')}
                  </Button>
                </div>
                
                {selectedCard.description && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('cardDetail.description')}</h4>
                    <p className="text-sm text-muted-foreground">{selectedCard.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
