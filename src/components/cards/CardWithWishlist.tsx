import React from "react";
import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";
import TradingCard from "./TradingCard";
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";

interface CardWithWishlistProps {
  card: any; // Card data from the database
  hidePriceAndBuy?: boolean;
  showEditButton?: boolean; // New prop to control edit button visibility
  onAddToCollection?: (card: any) => void; // Custom handler for adding to collection
  onViewDetails?: (id: string) => void; // Handler for viewing card details
  onCollectionChange?: () => void; // Callback when collection status changes
  onWishlistChange?: () => void; // Callback when wishlist status changes
}

const CardWithWishlist = ({ card, hidePriceAndBuy = true, showEditButton = false, onAddToCollection, onViewDetails, onCollectionChange, onWishlistChange }: CardWithWishlistProps) => {
  const { data: isInCollection = false } = useIsCardInCollection(card.card_id);
  const { data: isInWishlist = false } = useIsCardInWishlist(card.card_id);
  
  // Force re-render counter to ensure immediate updates
  const [renderKey, setRenderKey] = React.useState(0);
  
  // Update render key when collection status changes to force re-render
  React.useEffect(() => {
    console.log('CardWithWishlist - Collection status changed, forcing re-render:', {
      cardId: card.card_id,
      isInCollection,
      timestamp: new Date().toISOString()
    });
    setRenderKey(prev => prev + 1);
  }, [isInCollection, card.card_id]);
  
  React.useEffect(() => {
    console.log('CardWithWishlist - Wishlist status changed, forcing re-render:', {
      cardId: card.card_id,
      isInWishlist,
      timestamp: new Date().toISOString()
    });
    setRenderKey(prev => prev + 1);
  }, [isInWishlist, card.card_id]);
  
  // Debug logging
  console.log('CardWithWishlist - Card:', card.card_id, 'isInCollection:', isInCollection, 'renderKey:', renderKey, 'timestamp:', new Date().toISOString());
  
  // Debug the props being passed to TradingCard
  React.useEffect(() => {
    console.log('CardWithWishlist - Props being passed to TradingCard:', {
      cardId: card.card_id,
      inCollection: isInCollection,
      inWishlist: isInWishlist,
      renderKey,
      timestamp: new Date().toISOString()
    });
  }, [isInCollection, isInWishlist, card.card_id, renderKey]);
  
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  const handleAddToCollection = () => {
    console.log('CardWithWishlist - handleAddToCollection called:', {
      cardId: card.card_id,
      hasOnAddToCollection: !!onAddToCollection,
      currentCollectionStatus: isInCollection,
      timestamp: new Date().toISOString()
    });
    
    // Force immediate re-render for instant UI feedback
    setRenderKey(prev => prev + 1);
    console.log('CardWithWishlist - Forcing re-render for card:', card.card_id);
    
    if (onAddToCollection) {
      // Use custom handler if provided (for modal)
      console.log('CardWithWishlist - Using custom handler (modal)');
      onAddToCollection(card);
    } else {
      // Fallback to direct collection action
      console.log('CardWithWishlist - Using direct collection action');
      addToCollection({ 
        cardId: card.card_id, 
        cardName: card.name, 
        cardLanguage: card.language 
      });
    }
    // Call callback to refresh set progress
    if (onCollectionChange) {
      onCollectionChange();
    }
  };

  const handleAddToWishlist = () => {
    // Force immediate re-render for instant UI feedback
    setRenderKey(prev => prev + 1);
    
    addToWishlist({ 
      cardId: card.card_id, 
      cardName: card.name, 
      cardLanguage: card.language 
    });
    // Call callback to refresh set progress
    if (onWishlistChange) {
      onWishlistChange();
    }
  };

  return (
    <TradingCard
      key={`${card.card_id}-${renderKey}`}
      id={card.card_id}
      name={card.name || 'Unknown Card'}
      series="Pokemon TCG"
      set={card.set_name || 'Unknown Set'}
      number={card.card_number || ''}
      rarity={mapDatabaseRarityToComponent(card.rarity || 'Common')}
      type={card.types?.[0] || 'Normal'}
      image={card.image_url || '/placeholder.svg'}
      inCollection={isInCollection}
      inWishlist={isInWishlist}
      description={card.description || ''}
      hidePriceAndBuy={hidePriceAndBuy}
      showEditButton={showEditButton}
      cardData={card}
      onAddToCollection={handleAddToCollection}
      onAddToWishlist={handleAddToWishlist}
      onViewDetails={onViewDetails}
    />
  );
};

export default CardWithWishlist; 