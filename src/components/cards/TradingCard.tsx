
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import CardDetailModal from "./CardDetailModal";
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
  myPrice?: number;
  marketPrice?: number;
  marketSource?: string;
  marketCurrency?: string;
  marketRecordedAt?: string;
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
      return "common";
    case "rare":
      return "rare";
    case "ultra rare":
    case "epic":
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
  myPrice,
  marketPrice,
  marketSource,
  marketCurrency,
  marketRecordedAt,
}: TradingCardProps) => {
  const { t } = useTranslation();
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();
  
  // Normalize props
  const cardImage = image || imageUrl || "/placeholder.svg";
  
  // Local state for immediate UI updates
  const [localOwned, setLocalOwned] = useState(inCollection || isOwned);
  const [localWishlisted, setLocalWishlisted] = useState(inWishlist || isWishlisted);
  
  // Update local state when props change
  React.useEffect(() => {
    setLocalOwned(inCollection || isOwned);
  }, [inCollection, isOwned]);
  
  React.useEffect(() => {
    setLocalWishlisted(inWishlist || isWishlisted);
  }, [inWishlist, isWishlisted]);
  
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
  
  const owned = localOwned;
  const wishlisted = localWishlisted;
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
      // Optimistic update - immediately update UI
      setLocalOwned(true);
      // Use the custom handler if provided (for modal), otherwise use default action
      if (onAddToCollection) {
        onAddToCollection(cardData || { card_id: id, name, language: cardData?.language });
      } else {
        addToCollection({ cardId: id, cardName: name, cardLanguage: cardData?.language });
      }
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
      // Optimistic update - immediately update UI
      setLocalWishlisted(true);
      addToWishlist({ cardId: id, cardName: name, cardLanguage: cardData?.language });
    }
  };

  const cardContent = (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col",
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
            className="w-full h-full object-contain transition-transform duration-300"
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
            {typeof myPrice === 'number' && typeof marketPrice === 'number' && (
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
            )}
            {/* If either price is missing, show a fallback */}
            {((typeof myPrice !== 'number' || typeof marketPrice !== 'number') && (
              <div className="mt-2 text-xs text-muted-foreground">Price data unavailable</div>
            ))}
          </>
        )}

        {/* Bottom Action Buttons */}
        <div className="mt-4 space-y-2">
          {/* Add to Cart Button */}
          {!hidePriceAndBuy && inStock && !owned && onAddToCart && (
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
              className={cn(
                "w-full",
                wishlisted && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleCollectionToggle}
              disabled={isAddingToCollection || isRemovingFromCollection || wishlisted}
            >
              <Star className="w-4 h-4 mr-2" />
              {wishlisted ? t('cards.alreadyInWishlist') : (owned ? t('cards.removeFromCollection') : t('cards.addToCollection'))}
            </Button>
          )}

          {/* Add to Wishlist Button */}
          <Button
            size="sm"
            variant={wishlisted ? "destructive" : "secondary"}
            className={cn(
              "w-full",
              owned && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist || isRemovingFromWishlist || owned}
          >
            <Heart className={cn("w-4 h-4 mr-2", wishlisted && "fill-current")} />
            {owned ? t('cards.alreadyInCollection') : (wishlisted ? t('cards.removeFromWishlist') : t('cards.addToWishlist'))}
          </Button>
        </div>
      </CardContent>


    </Card>
  );

  // Wrap with CardDetailModal if cardData is available
  if (cardData) {
    return (
      <CardDetailModal card={cardData}>
        {cardContent}
      </CardDetailModal>
    );
  }

  return cardContent;
};

export default TradingCard;
