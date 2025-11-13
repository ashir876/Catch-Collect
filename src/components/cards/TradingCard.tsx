
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Edit3, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CardDetailModal from "./CardDetailModal";
import AddToCollectionModal from "./AddToCollectionModal";
import AddToWishlistModal from "./AddToWishlistModal";
import { EditCardModal } from "./EditCardModal";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";
import CardPriceDisplay from "./CardPriceDisplay";

interface CardData {
  card_id: string;
  name: string;
  set_name: string;
  set_id?: string;
  card_number?: string;
  rarity?: string;
  types?: string[];
  hp?: number;
  image_url?: string;
  description?: string;
  illustrator?: string;
  attacks?: any;
  weaknesses?: any;
  retreat?: number;
  set_symbol_url?: string;
  language?: string;
}

interface TradingCardProps {
  id: string;
  name: string;
  series: string;
  set: string;
  number?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  type?: string;
  image?: string;
  imageUrl?: string;
  inStock?: boolean;
  inCollection?: boolean;
  inWishlist?: boolean;
  description?: string;
  
  isOwned?: boolean;
  isWishlisted?: boolean;
  
  hidePriceAndBuy?: boolean;
  disableHoverEffects?: boolean;
  
  onAddToCart?: (id?: string) => void;
  onAddToCollection?: (card?: CardData | any) => void;
  onAddToWishlist?: (id?: string) => void;
  onToggleWishlist?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  
  onRemoveFromWishlist?: () => void;
  priority?: "high" | "medium" | "low";
  getPriorityText?: () => string;
  getPriorityColor?: () => "default" | "secondary" | "destructive";
  
  cardData?: CardData;
  
  collectionItemId?: string;
  
  notes?: string;
  condition?: string;
  language?: string;
  myPrice?: number;
  marketPrice?: number;
  marketSource?: string;
  marketCurrency?: string;
  marketRecordedAt?: string;
  acquiredDate?: string;
  showEditButton?: boolean;
  
  showRemoveButton?: boolean;
  onRemove?: (id: string) => void;
  
  hideCollectedLabel?: boolean;
  
  priceData?: any;
}

const rarityConfig = {
  common: {
    color: "common",
    gradient: "from-muted to-muted/80",
    glow: "",
    label: "Common"
  },
  rare: {
    color: "rare",
    gradient: "from-rare/20 to-rare/5",
    glow: "shadow-rare",
    label: "Rare"
  },
  epic: {
    color: "epic",
    gradient: "from-epic/20 to-epic/5",
    glow: "shadow-glow",
    label: "Epic"
  },
  legendary: {
    color: "legendary",
    gradient: "from-legendary/20 to-legendary/5",
    glow: "shadow-glow",
    label: "Legendary"
  }
};

const normalizeRarity = (rarity: string): "common" | "rare" | "epic" | "legendary" => {
  const normalizedRarity = rarity.toLowerCase();
  
  switch (normalizedRarity) {
    case "common":
    case "gewöhnlich":
      return "common";
    case "rare":
    case "selten":
      return "rare";
    case "ultra rare":
    case "epic":
    case "ungewöhnlich":
      return "epic";
    case "legendary":
    case "secret rare":
      return "legendary";
    default:
      console.warn(`Unknown rarity: ${rarity}, defaulting to common`);
      return "common";
  }
};

const TradingCard = ({
  id,
  name,
  series,
  set,
  number,
  rarity,
  type,
  image,
  imageUrl,
  inStock = true,
  inCollection = false,
  inWishlist = false,
  description,
  
  isOwned = false,
  isWishlisted = false,
  
  hidePriceAndBuy = false,
  disableHoverEffects = false,
  
  onAddToCart,
  onAddToCollection,
  onAddToWishlist,
  onToggleWishlist,
  onViewDetails,
  onRemoveFromWishlist,
  priority,
  getPriorityText,
  getPriorityColor,
  
  cardData,
  collectionItemId,
  notes,
  condition,
  language,
  myPrice,
  marketPrice,
  marketSource,
  marketCurrency,
  marketRecordedAt,
  acquiredDate,
  showEditButton = true,
  showRemoveButton = false,
  onRemove,
  hideCollectedLabel = false,
  priceData,
}: TradingCardProps) => {
  console.log('TradingCard component rendering with props:', { 
    id, 
    name, 
    series, 
    set, 
    collectionItemId, 
    cardData: cardData ? 'present' : 'missing' 
  });
  
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection, setOnCollectionSuccess } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist, setOnWishlistSuccess } = useWishlistActions();

  const cardPriceData = Array.isArray(priceData) ? priceData[0] : priceData;

  React.useEffect(() => {
    if (id && cardPriceData) {
      console.log(`💵 TradingCard ${id} received priceData:`);
      console.log('  📦 priceData object keys:', Object.keys(cardPriceData));
      console.log('  💵 cardmarket_avg_sell_price:', cardPriceData.cardmarket_avg_sell_price, '(type:', typeof cardPriceData.cardmarket_avg_sell_price + ')');
      console.log('  ✅ Has price:', !!cardPriceData.cardmarket_avg_sell_price);
      console.log('  📄 Full priceData:', JSON.stringify(cardPriceData, null, 2));

      if (!('cardmarket_avg_sell_price' in cardPriceData)) {
        console.error(`❌ CRITICAL: TradingCard ${id} - cardmarket_avg_sell_price field NOT FOUND!`);
        console.error('❌ Available fields:', Object.keys(cardPriceData));
      }
    } else if (id && !cardPriceData) {
      console.log(`💵 TradingCard ${id} has NO priceData`);
    }
  }, [id, cardPriceData]);

  const cardImage = image || imageUrl || "/placeholder.svg";

  const [localOwned, setLocalOwned] = useState(inCollection || isOwned);
  const [localWishlisted, setLocalWishlisted] = useState(inWishlist || isWishlisted);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const owned = localOwned;
  const wishlisted = localWishlisted;

  React.useEffect(() => {
    console.log('TradingCard - owned status changed:', {
      id,
      name,
      owned,
      localOwned,
      inCollection,
      isOwned,
      hideCollectedLabel,
      shouldShowCollected: owned && !hideCollectedLabel,
      timestamp: new Date().toISOString()
    });
  }, [owned, localOwned, inCollection, isOwned, hideCollectedLabel, id, name]);

  React.useEffect(() => {
    console.log('TradingCard - Collection modal state changed:', {
      id,
      name,
      isCollectionModalOpen,
      owned,
      wishlisted
    });
  }, [isCollectionModalOpen, id, name, owned, wishlisted]);

  React.useEffect(() => {
    console.log('TradingCard - inCollection prop changed:', {
      id,
      name,
      inCollection,
      isOwned,
      newLocalOwned: inCollection || isOwned,
      timestamp: new Date().toISOString()
    });
    setLocalOwned(inCollection || isOwned);
  }, [inCollection, isOwned, id, name]);
  
  React.useEffect(() => {
    console.log('TradingCard - inWishlist prop changed:', {
      id,
      name,
      inWishlist,
      isWishlisted,
      newLocalWishlisted: inWishlist || isWishlisted,
      timestamp: new Date().toISOString()
    });
    setLocalWishlisted(inWishlist || isWishlisted);
  }, [inWishlist, isWishlisted, id, name]);

  React.useEffect(() => {
    if (owned) {
      setIsCollectionModalOpen(false);
    }
  }, [owned]);

  React.useEffect(() => {
    if (wishlisted) {
      setIsWishlistModalOpen(false);
    }
  }, [wishlisted]);

  React.useEffect(() => {
    if (!isAddingToCollection && !isRemovingFromCollection) {
      
      setLocalOwned(inCollection || isOwned);
    }
  }, [isAddingToCollection, isRemovingFromCollection, inCollection, isOwned]);
  
  React.useEffect(() => {
    if (!isAddingToWishlist && !isRemovingFromWishlist) {
      
      setLocalWishlisted(inWishlist || isWishlisted);
    }
  }, [isAddingToWishlist, isRemovingFromWishlist, inWishlist, isWishlisted]);
  const [isHovered, setIsHovered] = useState(false);

  const normalizedRarity = normalizeRarity(rarity);
  const rarityInfo = rarityConfig[normalizedRarity];

  const handleCollectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('TradingCard - Collection button clicked:', {
      id,
      name,
      owned,
      wishlisted,
      isCollectionModalOpen,
      isAddingToCollection,
      isRemovingFromCollection
    });
    
    setIsCollectionModalOpen(true);
  };

  const handleCollectionModalSubmit = async (entries: Array<{
    condition: string;
    price: number;
    date: string;
    notes: string;
    language: string;
    acquiredDate: string;
  }>) => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }

    try {
      
      let cardDataFromDB;
      
      if (cardData) {
        
        cardDataFromDB = cardData;
      } else {

        const cardLanguage = language || cardData?.language || 'en';
        const { data, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('card_id', id)
          .eq('language', cardLanguage)
          .single();

        if (cardError) {
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('cards')
            .select('*')
            .eq('card_id', id)
            .order('language', { ascending: true })
            .limit(1)
            .single();
          
          if (fallbackError) {
            throw cardError; 
          }
          cardDataFromDB = fallbackData;
        } else {
          cardDataFromDB = data;
        }
      }

      let successCount = 0;
      let errorCount = 0;

      for (const entry of entries) {
        try {
          const insertData = {
            user_id: user.id,
            card_id: id,
            language: entry.language === 'all' ? (cardDataFromDB.language || 'en') : entry.language,
            name: cardDataFromDB.name,
            set_name: cardDataFromDB.set_name,
            set_id: cardDataFromDB.set_id,
            card_number: cardDataFromDB.card_number,
            rarity: cardDataFromDB.rarity,
            image_url: cardDataFromDB.image_url,
            description: cardDataFromDB.description,
            illustrator: cardDataFromDB.illustrator,
            hp: cardDataFromDB.hp,
            types: cardDataFromDB.types,
            attacks: cardDataFromDB.attacks,
            weaknesses: cardDataFromDB.weaknesses,
            retreat: cardDataFromDB.retreat,
            condition: entry.condition,
            price: entry.price,
            notes: entry.notes || `Acquired on: ${entry.date}`,
            created_at: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString()
          };

          console.log('TradingCard - Attempting to insert:', {
            cardId: id,
            cardName: cardDataFromDB.name,
            insertData: insertData,
            user: user.id
          });

          const { error } = await supabase
            .from('card_collections')
            .insert(insertData);
          
          if (error) {
            console.error('Error inserting entry:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
            errorCount++;
          } else {
            console.log('Successfully inserted entry for card:', id);
            successCount++;
            
            if (user) {
              queryClient.setQueryData(['collection-check', user.id, id], true);
            }
          }
        } catch (entryError) {
          console.error('Error inserting entry:', entryError);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setLocalOwned(true);
      }

      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      queryClient.invalidateQueries({ queryKey: ['set-progress'] });
      queryClient.invalidateQueries({ queryKey: ['collection-check', user.id, id] });

      setIsCollectionModalOpen(false);

      if (successCount > 0 && errorCount === 0) {
        toast({
          title: t('messages.addedToCollection'),
          description: `${name} ${t('messages.addedToCollection').toLowerCase()} (${successCount} ${successCount === 1 ? 'copy' : 'copies'}).`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: t('messages.partialSuccess'),
          description: `Added ${successCount} copies, ${errorCount} failed.`,
          variant: "default",
        });
      } else {
        toast({
          title: t('messages.error'),
          description: `Failed to add any copies. Please try again.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      console.error('Error details:', {
        cardId: id,
        cardData: cardData,
        entries: entries,
        user: user?.id
      });
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
      
      setLocalWishlisted(false);
      removeFromWishlist({ cardId: id });
    } else {
      
      setIsWishlistModalOpen(true);
    }
  };

  const handleWishlistModalSubmit = (data: {
    priority: string;
    notes: string;
    language: string;
    price: number;
  }) => {
    
    setOnWishlistSuccess(() => () => {
      setIsWishlistModalOpen(false);
      setLocalWishlisted(true);
    });
    
    addToWishlist({ 
      cardId: id, 
      cardName: name, 
      cardLanguage: data.language === 'all' ? cardData?.language : data.language,
      priority: data.priority,
      notes: data.notes,
      price: data.price
    });
  };

  const cardContent = (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 flex flex-col cursor-pointer",
        owned && "ring-2 ring-accent ring-opacity-50"
      )}
    >
      {}
      {priority && getPriorityText && getPriorityColor && (
        <div className="absolute top-2 right-2 z-20">
          <Badge variant={getPriorityColor()} className="text-xs">
            {getPriorityText()}
          </Badge>
        </div>
      )}

      <CardContent className="p-4 relative z-10 flex flex-col flex-1">
        {}
        <div className="relative mb-3 aspect-[3/4] overflow-visible rounded-lg bg-muted" style={{ position: 'relative' }}>
          <img
            src={cardImage}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 pointer-events-none"
          />
          
          {}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-1 bg-muted text-foreground border-border"
            >
              {rarityInfo.label}
            </Badge>
            {owned && !hideCollectedLabel && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-accent/20 text-accent border-accent/30">
                Besitzt
              </Badge>
            )}
            {!inStock && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                Ausverkauft
              </Badge>
            )}
          </div>

          {}
          {owned && !hideCollectedLabel && (
            <div 
              className="bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-lg z-30 border-2 border-white flex items-center gap-1"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                zIndex: 30,
                backgroundColor: '#059669',
                color: 'white',
                borderRadius: '8px',
                padding: '4px 8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '2px solid white'
              }}
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-semibold">Collected</span>
            </div>
          )}

          {}
          {owned && showRemoveButton && onRemove && !hideCollectedLabel && (
            <div className="absolute top-16 right-2 z-30">
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

        </div>

        {}
        <div className="space-y-2 flex-1">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {series} • {set} {number && `• ${number}`}
            </p>
          </div>

          {}
          {cardData?.price && cardData.price > 0 ? (
            <div className="mt-2 text-right">
              <div className="text-lg font-bold text-primary">
                €{cardData.price.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                📈 Cardmarket Avg
              </div>
            </div>
          ) : null}
        </div>

        {}
        {!hidePriceAndBuy && (
          <>
            {typeof myPrice === 'number' && myPrice > 0 && typeof marketPrice === 'number' && marketPrice > 0 ? (
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">Your Price</span>
                  <span className="font-semibold">{myPrice} {marketCurrency || 'CHF'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium">Market Price{marketSource ? ` (${marketSource})` : ''}</span>
                  <span className="font-semibold">{marketPrice} {marketCurrency || 'USD'}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded my-1">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${Math.min((myPrice / marketPrice) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {myPrice > marketPrice
                    ? `+${(myPrice - marketPrice).toFixed(2)} above market`
                    : `-${(marketPrice - myPrice).toFixed(2)} below market`}
                </div>
                {marketRecordedAt && (
                  <div className="text-[10px] text-muted-foreground mt-1 text-center">Market price as of {new Date(marketRecordedAt).toLocaleDateString()}</div>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {typeof myPrice === 'number' && myPrice > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">Your Price</span>
                    <span className="font-semibold">{myPrice} {marketCurrency || 'CHF'}</span>
                  </div>
                )}
                {typeof marketPrice === 'number' && marketPrice > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">Market Price{marketSource ? ` (${marketSource})` : ''}</span>
                    <span className="font-semibold">{marketPrice} {marketCurrency || 'USD'}</span>
                  </div>
                )}
                {(!myPrice || myPrice === 0) && (!marketPrice || marketPrice === 0) && (
                  <div className="text-xs text-muted-foreground text-center">
                    {!myPrice || myPrice === 0 ? "💡 Add your price when adding to collection" : ""}
                    {(!myPrice || myPrice === 0) && (!marketPrice || marketPrice === 0) ? " • " : ""}
                    {!marketPrice || marketPrice === 0 ? "Market price not available" : ""}
                  </div>
                )}
                {(!myPrice || myPrice === 0) && owned && (
                  <div className="text-xs text-blue-600 mt-1 text-center">
                    💡 Click "Remove from Collection" and add again to set your price
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {}
        <div className="mt-4 space-y-2">
          {}
          {!hidePriceAndBuy && inStock && !owned && !wishlisted && onAddToCart && (
            <Button
              size="sm"
              className="w-full bg-gradient-primary hover:shadow-card transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(id);
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Kaufen
            </Button>
          )}

          {}
          {(hidePriceAndBuy || (!hidePriceAndBuy && !onAddToCart)) && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleCollectionToggle}
              disabled={isAddingToCollection || isRemovingFromCollection}
            >
              <Heart className="w-4 h-4 mr-2" />
              {t('cards.addToCollection')}
            </Button>
          )}

          {}
          <Button
            size="sm"
            variant={wishlisted ? "destructive" : "secondary"}
            className="w-full"
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist || isRemovingFromWishlist || isAddingToCollection || isRemovingFromCollection || owned}
          >
            <Heart className={cn("w-4 h-4 mr-2", wishlisted && "fill-current")} />
            {wishlisted ? t('cards.removeFromWishlist') : t('cards.addToWishlist')}
          </Button>

          {}
          {(owned || wishlisted) && showEditButton && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                console.log('TradingCard - Edit button clicked for card:', {
                  id,
                  collectionItemId,
                  cardData: cardData ? 'present' : 'missing',
                  cardDataId: (cardData as any)?.id,
                  owned,
                  wishlisted,
                  finalId: collectionItemId || (cardData as any)?.id || id
                });
                setIsEditModalOpen(true);
              }}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          )}

          {}
          {owned && showRemoveButton && onRemove && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-red-600 border-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              {t('cards.removeFromCollection')}
            </Button>
          )}
        </div>
      </CardContent>

    </Card>
  );

  if (cardData) {
    return (
      <>
        <CardDetailModal card={cardData}>
          {cardContent}
        </CardDetailModal>
        
        {}
        <AddToCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onAdd={handleCollectionModalSubmit}
          cardName={name}
          isLoading={isAddingToCollection}
          cardId={id}
          defaultLanguage={cardData?.language || language}
        />
        
              {}
      <AddToWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onAdd={handleWishlistModalSubmit}
        cardName={name}
        isLoading={isAddingToWishlist}
      />

                     {}
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          card={{
            id: collectionItemId || (cardData as any)?.id || id, 
            card_id: id, 
            name: name,
            set: set,
            image: cardImage,
            condition: condition || (cardData as any)?.condition,
            myPrice: myPrice,
            notes: notes || (cardData as any)?.notes,
            priority: priority,
            language: language || (cardData as any)?.language,
            acquiredDate: acquiredDate || (cardData as any)?.acquiredDate
          }}
          type={owned ? 'collection' : 'wishlist'}
          onSuccess={() => {

          }}
        />
      </>
    );
  }

  return (
    <>
      {cardContent}
      
      {}
      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onAdd={handleCollectionModalSubmit}
        cardName={name}
        isLoading={isAddingToCollection}
        cardId={id}
        defaultLanguage={cardData?.language || language}
      />
      
      {}
      <AddToWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onAdd={handleWishlistModalSubmit}
        cardName={name}
        isLoading={isAddingToWishlist}
      />

      {}
      <EditCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        card={{
          id: collectionItemId || (cardData as any)?.id || id, 
          card_id: id, 
          name: name,
          set: set,
          image: cardImage,
          condition: condition || (cardData as any)?.condition,
          myPrice: myPrice,
          notes: notes || (cardData as any)?.notes,
          priority: priority,
          language: language || (cardData as any)?.language,
          acquiredDate: acquiredDate || (cardData as any)?.acquiredDate
        }}
        type={owned ? 'collection' : 'wishlist'}
        onSuccess={() => {

        }}
      />
    </>
  );
};

export default TradingCard;
