
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
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
  
  // Update local state when props change
  React.useEffect(() => {
    setLocalOwned(inCollection || isOwned);
  }, [inCollection, isOwned]);
  
  React.useEffect(() => {
    setLocalWishlisted(inWishlist || isWishlisted);
  }, [inWishlist, isWishlisted]);

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

  // Handle collection toggle
  const handleCollectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (owned) {
      // Optimistic update - immediately update UI
      setLocalOwned(false);
      removeFromCollection({ cardId: id });
    } else {
      // Open collection modal
      setIsCollectionModalOpen(true);
    }
  };

  // Handle collection modal submit
  const handleCollectionModalSubmit = (data: {
    condition: string;
    price: number;
    date: string;
    notes: string;
    quantity: number;
    language: string;
  }) => {
    // Always use the default collection action for modal submissions
    // The onAddToCollection prop is for direct button clicks, not modal submissions
    setOnCollectionSuccess(() => () => {
      setIsCollectionModalOpen(false);
      setLocalOwned(true);
    });
    
    addToCollection({ 
      cardId: id, 
      cardName: name, 
      cardLanguage: data.language === 'all' ? cardData?.language : data.language,
      condition: data.condition,
      price: data.price,
      date: data.date,
      notes: data.notes,
      quantity: data.quantity
    });
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
        "group relative overflow-hidden transition-all duration-300 flex flex-col",
        owned && "ring-2 ring-accent ring-opacity-50"
      )}
    >
      {/* Priority Badge (Wishlist) */}
      {priority && getPriorityText && getPriorityColor && (
        <div className="absolute top-2 left-2 z-20">
          <Badge variant={getPriorityColor()} className="text-xs">
            {getPriorityText()}
          </Badge>
        </div>
      )}


      
      <CardContent className="p-4 relative z-10 flex flex-col flex-1">
        {/* Card Image */}
        <div className="relative mb-3 aspect-[3/4] overflow-visible rounded-lg bg-muted">
          <img
            src={cardImage}
            alt={name}
            className="w-full h-full object-contain transition-transform duration-300 cursor-pointer hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails(id);
              }
            }}
          />
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-1",
                `bg-${rarityInfo.color}/20 text-${rarityInfo.color} border-${rarityInfo.color}/30`
              )}
            >
              {rarityInfo.label}
            </Badge>
            {owned && (
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
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Your Price</span>
                  <span>{myPrice} {marketCurrency || 'CHF'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Market Price{marketSource ? ` (${marketSource})` : ''}</span>
                  <span>{marketPrice} {marketCurrency || 'USD'}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded my-1">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${Math.min((myPrice / marketPrice) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {myPrice > marketPrice
                    ? `+${(myPrice - marketPrice).toFixed(2)} above market`
                    : `-${(marketPrice - myPrice).toFixed(2)} below market`}
                </div>
                {marketRecordedAt && (
                  <div className="text-[10px] text-muted-foreground mt-1">Market price as of {new Date(marketRecordedAt).toLocaleDateString()}</div>
                )}
              </div>
            ) : (
              <div className="mt-2 space-y-1">
                {typeof myPrice === 'number' && myPrice > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Your Price</span>
                    <span>{myPrice} {marketCurrency || 'CHF'}</span>
                  </div>
                )}
                {typeof marketPrice === 'number' && marketPrice > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Market Price{marketSource ? ` (${marketSource})` : ''}</span>
                    <span>{marketPrice} {marketCurrency || 'USD'}</span>
                  </div>
                )}
                {(!myPrice || myPrice === 0) && (!marketPrice || marketPrice === 0) && (
                  <div className="text-xs text-muted-foreground">
                    {!myPrice || myPrice === 0 ? "💡 Add your price when adding to collection" : ""}
                    {(!myPrice || myPrice === 0) && (!marketPrice || marketPrice === 0) ? " • " : ""}
                    {!marketPrice || marketPrice === 0 ? "Market price not available" : ""}
                  </div>
                )}
                {(!myPrice || myPrice === 0) && owned && (
                  <div className="text-xs text-blue-600 mt-1">
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
              variant={owned ? "destructive" : "outline"}
              className="w-full"
              onClick={handleCollectionToggle}
              disabled={isAddingToCollection || isRemovingFromCollection}
            >
              <Star className="w-4 h-4 mr-2" />
              {owned ? t('cards.removeFromCollection') : t('cards.addToCollection')}
            </Button>
          )}

          {/* Add to Wishlist Button */}
          <Button
            size="sm"
            variant={wishlisted ? "destructive" : "secondary"}
            className="w-full"
            onClick={owned ? () => {
              toast({
                title: t('messages.error'),
                description: t('messages.alreadyInCollection'),
                variant: 'destructive'
              });
            } : handleWishlistToggle}
            disabled={isAddingToWishlist || isRemovingFromWishlist || isAddingToCollection || isRemovingFromCollection}
          >
            <Heart className={cn("w-4 h-4 mr-2", wishlisted && "fill-current")} />
            {wishlisted ? t('cards.removeFromWishlist') : t('cards.addToWishlist')}
          </Button>

          {/* Edit Card Button - Only show if card is in collection or wishlist */}
          {(owned || wishlisted) && (
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
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('common.edit')}
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
