
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Heart, ShoppingCart, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TradingCard from "@/components/cards/TradingCard";
import { useToast } from "@/hooks/use-toast";
import { useCardsData } from "@/hooks/useCardsData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';

// Helper function to map database rarity to component rarity
const mapDatabaseRarityToComponent = (dbRarity: string): "common" | "rare" | "epic" | "legendary" => {
  const normalizedRarity = dbRarity.toLowerCase();
  
  switch (normalizedRarity) {
    case "common":
      return "common";
    case "rare":
      return "rare";
    case "ultra rare":
      return "epic";
    case "legendary":
    case "secret rare":
      return "legendary";
    default:
      console.warn(`Unknown database rarity: ${dbRarity}, defaulting to common`);
      return "common";
  }
};

const Cards = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const setFilter = searchParams.get("set");
  const [searchTerm, setSearchTerm] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: cardsData, isLoading, error } = useCardsData('de', setFilter || undefined, 100);

  const filteredCards = cardsData?.filter(card => {
    const matchesSearch = 
      card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.set_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === "all" || card.rarity === rarityFilter;
    
    return matchesSearch && matchesRarity;
  }) || [];

  const handleAddToCollection = async (cardId: string, cardName: string) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          card_id: cardId,
          language: 'de'
        });

      if (error) throw error;

      toast({
        title: t('messages.addedToCollection'),
        description: `${cardName} ${t('messages.addedToCollection').toLowerCase()}.`,
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

  const handleAddToWishlist = async (cardId: string, cardName: string) => {
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
          card_id: cardId,
          language: 'de'
        });

      if (error) throw error;

      toast({
        title: t('messages.addedToWishlist'),
        description: `${cardName} ${t('messages.addedToWishlist').toLowerCase()}.`,
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

  const handleAddToCart = async (cardId: string, cardName: string) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('carts')
        .insert({
          user_id: user.id,
          article_number: cardId,
          quantity: 1
        });

      if (error) throw error;

      toast({
        title: t('messages.addedToCart'),
        description: `${cardName} ${t('messages.addedToCart').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.cartError'),
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Rarity Filter */}
          <div className="flex gap-2">
            <Button
              variant={rarityFilter === "all" ? "default" : "outline"}
              onClick={() => setRarityFilter("all")}
              size="sm"
            >
              {t('cards.allRarities')}
            </Button>
            <Button
              variant={rarityFilter === "Common" ? "default" : "outline"}
              onClick={() => setRarityFilter("Common")}
              size="sm"
            >
              {t('cards.common')}
            </Button>
            <Button
              variant={rarityFilter === "Rare" ? "default" : "outline"}
              onClick={() => setRarityFilter("Rare")}
              size="sm"
            >
              {t('cards.rare')}
            </Button>
            <Button
              variant={rarityFilter === "Ultra Rare" ? "default" : "outline"}
              onClick={() => setRarityFilter("Ultra Rare")}
              size="sm"
            >
              {t('cards.ultraRare')}
            </Button>
          </div>
        </div>
      </div>

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
          {filteredCards.map((card) => (
            <TradingCard
              key={card.card_id}
              id={card.card_id}
              name={card.name || 'Unknown Card'}
              series="Pokemon TCG"
              set={card.set_name || 'Unknown Set'}
              number={card.card_number || ''}
              rarity={mapDatabaseRarityToComponent(card.rarity || 'Common')}
              type={card.types?.[0] || 'Normal'}
              price={0}
              image={card.image_url || '/placeholder.svg'}
              inCollection={false}
              inWishlist={false}
              description={card.description || ''}
              onAddToCollection={() => handleAddToCollection(card.card_id, card.name || 'Unknown Card')}
              onAddToWishlist={() => handleAddToWishlist(card.card_id, card.name || 'Unknown Card')}
              onAddToCart={() => handleAddToCart(card.card_id, card.name || 'Unknown Card')}
            />
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
    </div>
  );
};

export default Cards;
