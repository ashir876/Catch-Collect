import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";

interface CardListItemProps {
  card: any;
  onAddToCollection?: (card: any) => void;
  onViewDetails?: (id: string) => void;
  onCollectionChange?: () => void;
  onWishlistChange?: () => void;
}

const CardListItem = ({ 
  card, 
  onAddToCollection, 
  onViewDetails, 
  onCollectionChange, 
  onWishlistChange 
}: CardListItemProps) => {
  const { t } = useTranslation();
  const { data: isInCollection = false } = useIsCardInCollection(card.card_id);
  const { data: isInWishlist = false } = useIsCardInWishlist(card.card_id);
  
  // Force re-render counter to ensure immediate updates
  const [renderKey, setRenderKey] = React.useState(0);
  
  // Update render key when collection status changes to force re-render
  React.useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [isInCollection]);
  
  React.useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [isInWishlist]);
  
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  const handleAddToCollection = () => {
    // Force immediate re-render for instant UI feedback
    setRenderKey(prev => prev + 1);
    
    if (onAddToCollection) {
      onAddToCollection(card);
    } else {
      addToCollection({ 
        cardId: card.card_id, 
        cardName: card.name, 
        cardLanguage: card.language 
      });
    }
    if (onCollectionChange) {
      onCollectionChange();
    }
  };

  const handleAddToWishlist = () => {
    // Force immediate re-render for instant UI feedback
    setRenderKey(prev => prev + 1);
    
    if (isInWishlist) {
      removeFromWishlist({ cardId: card.card_id });
    } else {
      addToWishlist({ 
        cardId: card.card_id, 
        cardName: card.name, 
        cardLanguage: card.language 
      });
    }
    if (onWishlistChange) {
      onWishlistChange();
    }
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(card.card_id);
    }
  };

  const rarity = mapDatabaseRarityToComponent(card.rarity || 'Common');
  const cardImage = card.image_url || '/placeholder.svg';

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md",
        isInCollection && "ring-2 ring-accent ring-opacity-50"
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Card Image - Compact */}
          <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={cardImage}
              alt={card.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Rarity Badge */}
            <div className="absolute top-1 left-1">
              <Badge 
                variant="secondary" 
                className="text-[10px] px-1 py-0.5 bg-muted text-foreground border-border"
              >
                {rarity === 'common' ? 'Common' : 
                 rarity === 'rare' ? 'Rare' : 
                 rarity === 'epic' ? 'Epic' : 'Legendary'}
              </Badge>
            </div>

            {/* Collection Status */}
            {isInCollection && (
              <div className="absolute top-1 right-1">
                <CheckCircle className="h-3 w-3 text-emerald-600 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {card.name || 'Unknown Card'}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {card.set_name || 'Unknown Set'} {card.card_number && `• ${card.card_number}`}
              </p>
              {card.types && card.types.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {card.types[0]} {card.hp && `• ${card.hp} HP`}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCollection();
                }}
                disabled={isAddingToCollection || isRemovingFromCollection}
              >
                <Heart className="w-3 h-3 mr-1" />
                {t('cards.addToCollection')}
              </Button>

              <Button
                size="sm"
                variant={isInWishlist ? "destructive" : "secondary"}
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToWishlist();
                }}
                disabled={isAddingToWishlist || isRemovingFromWishlist || isInCollection}
              >
                <Star className={cn("w-3 h-3 mr-1", isInWishlist && "fill-current")} />
                {isInWishlist ? t('cards.removeFromWishlist') : t('cards.addToWishlist')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardListItem;
