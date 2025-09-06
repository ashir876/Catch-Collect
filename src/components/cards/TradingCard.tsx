
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
  // Legacy props
  isOwned?: boolean;
  isWishlisted?: boolean;
  // Display options
  hidePriceAndBuy?: boolean;
  disableHoverEffects?: boolean;
  // Action handlers
  onAddToCart?: (id?: string) => void;
  onAddToCollection?: (card?: CardData | any) => void;
  onAddToWishlist?: (id?: string) => void;
  onToggleWishlist?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  // Wishlist overlay actions and badges
  onRemoveFromWishlist?: () => void;
  priority?: "high" | "medium" | "low";
  getPriorityText?: () => string;
  getPriorityColor?: () => "default" | "secondary" | "destructive";
  // Full card data for modal
  cardData?: CardData;
  // Collection/wishlist item data for editing
  collectionItemId?: string;
  // Additional properties for collection items
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
  // New prop for showing remove button
  showRemoveButton?: boolean;
  onRemove?: (id: string) => void;
  // New prop to control whether to show "Collected" label (hide on collection page)
  hideCollectedLabel?: boolean;
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

// Helper function to normalize rarity values from database to component format
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
  // Legacy props
  isOwned = false,
  isWishlisted = false,
  // Display options
  hidePriceAndBuy = false,
  disableHoverEffects = false,
  // Action handlers
  onAddToCart,
  onAddToCollection,
  onAddToWishlist,
  onToggleWishlist,
  onViewDetails,
  onRemoveFromWishlist,
  priority,
  getPriorityText,
  getPriorityColor,
  // Full card data for modal
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
}: TradingCardProps) => {
  console.log('TradingCard component rendering with props:', { 
    id, 
    name, 
    series, 
    set, 
    collectionItemId, // Add this to see the collectionItemId value
    cardData: cardData ? 'present' : 'missing' // Add this to see if cardData is present
  });
  
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection, setOnCollectionSuccess } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist, setOnWishlistSuccess } = useWishlistActions();
  
  // Normalize props
  const cardImage = image || imageUrl || "/placeholder.svg";
  
  // Local state for immediate UI updates
  const [localOwned, setLocalOwned] = useState(inCollection || isOwned);
  const [localWishlisted, setLocalWishlisted] = useState(inWishlist || isWishlisted);
  
  // Modal state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Define owned and wishlisted variables first
  const owned = localOwned;
  const wishlisted = localWishlisted;
  
  // Debug logging for owned status
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
  
  // Debug modal state changes
  React.useEffect(() => {
    console.log('TradingCard - Collection modal state changed:', {
      id,
      name,
      isCollectionModalOpen,
      owned,
      wishlisted
    });
  }, [isCollectionModalOpen, id, name, owned, wishlisted]);
  
  // Update local state when props change
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

  // Reset modal states when card status changes
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
  
  // Revert optimistic updates if actions fail
  React.useEffect(() => {
    if (!isAddingToCollection && !isRemovingFromCollection) {
      // Action completed, sync with actual state
      setLocalOwned(inCollection || isOwned);
    }
  }, [isAddingToCollection, isRemovingFromCollection, inCollection, isOwned]);
  
  React.useEffect(() => {
    if (!isAddingToWishlist && !isRemovingFromWishlist) {
      // Action completed, sync with actual state
      setLocalWishlisted(inWishlist || isWishlisted);
    }
  }, [isAddingToWishlist, isRemovingFromWishlist, inWishlist, isWishlisted]);
  const [isHovered, setIsHovered] = useState(false);
  
  // Normalize the rarity to ensure it matches our config keys
  const normalizedRarity = normalizeRarity(rarity);
  const rarityInfo = rarityConfig[normalizedRarity];

  // Handle collection toggle - always open modal to add card
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
    // Always open collection modal to add card (even if already in collection)
    setIsCollectionModalOpen(true);
  };

  // Handle collection modal submit
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
      // Get card data first - use the cardData prop if available, otherwise fetch from DB
      let cardDataFromDB;
      
      if (cardData) {
        // Use the cardData prop if available
        cardDataFromDB = cardData;
      } else {
        // Fetch from database
        const { data, error: cardError } = await supabase
          .from('cards')
          .select('*')
          .eq('card_id', id)
          .single();

        if (cardError) {
          throw cardError;
        }
        cardDataFromDB = data;
      }

      // Insert entries one by one to avoid batch insert issues
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
            // Immediately update shared cache so other components reflect ownership
            if (user) {
              queryClient.setQueryData(['collection-check', user.id, id], true);
            }
          }
        } catch (entryError) {
          console.error('Error inserting entry:', entryError);
          errorCount++;
        }
      }
      
      // Mark owned locally for instant UI
      if (successCount > 0) {
        setLocalOwned(true);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
      queryClient.invalidateQueries({ queryKey: ['set-progress'] });
      queryClient.invalidateQueries({ queryKey: ['collection-check', user.id, id] });
      
      // Close modal
      setIsCollectionModalOpen(false);
      
      // Show appropriate toast message
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

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlisted) {
      // Optimistic update - immediately update UI
      setLocalWishlisted(false);
      removeFromWishlist({ cardId: id });
    } else {
      // Open wishlist modal
      setIsWishlistModalOpen(true);
    }
  };

  // Handle wishlist modal submit
  const handleWishlistModalSubmit = (data: {
    priority: string;
    notes: string;
    language: string;
    price: number;
  }) => {
    // Set success callback to close modal
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
      {/* Priority Badge (Wishlist) */}
      {priority && getPriorityText && getPriorityColor && (
        <div className="absolute top-2 right-2 z-20">
          <Badge variant={getPriorityColor()} className="text-xs">
            {getPriorityText()}
          </Badge>
        </div>
      )}


      
      <CardContent className="p-4 relative z-10 flex flex-col flex-1">
        {/* Card Image */}
        <div className="relative mb-3 aspect-[3/4] overflow-visible rounded-lg bg-muted" style={{ position: 'relative' }}>
          <img
            src={cardImage}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 pointer-events-none"
          />
          
          {/* Status Badges */}
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

          {/* Collection Status Icon - Top Right */}
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

          {/* Remove Button - Below Collection Status Icon */}
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

        {/* Card Info */}
        <div className="space-y-2 flex-1">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {series} • {set} {number && `• ${number}`}
            </p>
          </div>


        </div>

        {/* Price Comparison Section - Only show if hidePriceAndBuy is false */}
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

        {/* Bottom Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Add to Cart Button */}
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

          {/* Add to Collection Button */}
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

          {/* Add to Wishlist Button */}
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

          {/* Edit Card Button - Only show if card is in collection or wishlist */}
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

          {/* Remove from Collection Button - Only show if owned and showRemoveButton is true */}
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

  // Wrap with CardDetailModal if cardData is available
  if (cardData) {
    return (
      <>
        <CardDetailModal card={cardData}>
          {cardContent}
        </CardDetailModal>
        
        {/* Add to Collection Modal */}
        <AddToCollectionModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onAdd={handleCollectionModalSubmit}
          cardName={name}
          isLoading={isAddingToCollection}
          cardId={id}
          defaultLanguage={cardData?.language || language}
        />
        
              {/* Add to Wishlist Modal */}
      <AddToWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onAdd={handleWishlistModalSubmit}
        cardName={name}
        isLoading={isAddingToWishlist}
      />

                     {/* Edit Card Modal */}
        <EditCardModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          card={{
            id: collectionItemId || (cardData as any)?.id || id, // Use collection item ID if available
            card_id: id, // The actual card ID
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
            // The query invalidation in EditCardModal will handle refreshing the data
            // Don't call onAddToWishlist here as it might be the remove function
          }}
        />
      </>
    );
  }

  return (
    <>
      {cardContent}
      
      {/* Add to Collection Modal */}
      <AddToCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onAdd={handleCollectionModalSubmit}
        cardName={name}
        isLoading={isAddingToCollection}
        cardId={id}
        defaultLanguage={cardData?.language || language}
      />
      
      {/* Add to Wishlist Modal */}
      <AddToWishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        onAdd={handleWishlistModalSubmit}
        cardName={name}
        isLoading={isAddingToWishlist}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        card={{
          id: collectionItemId || (cardData as any)?.id || id, // Use collection item ID if available
          card_id: id, // The actual card ID
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
          // The query invalidation in EditCardModal will handle refreshing the data
          // Don't call onAddToWishlist here as it might be the remove function
        }}
      />
    </>
  );
};

export default TradingCard;
