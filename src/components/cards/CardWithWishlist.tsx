import React from "react";
import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";
import TradingCard from "./TradingCard";
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";

interface CardWithWishlistProps {
  card: any; 
  hidePriceAndBuy?: boolean;
  showEditButton?: boolean; 
  onAddToCollection?: (card: any) => void; 
  onViewDetails?: (id: string) => void; 
  onCollectionChange?: () => void; 
  onWishlistChange?: () => void; 
}

const CardWithWishlist = ({ card, hidePriceAndBuy = true, showEditButton = false, onAddToCollection, onViewDetails, onCollectionChange, onWishlistChange }: CardWithWishlistProps) => {
  const { data: isInCollection = false } = useIsCardInCollection(card.card_id);
  const { data: isInWishlist = false } = useIsCardInWishlist(card.card_id);

  const [renderKey, setRenderKey] = React.useState(0);

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


  console.log('CardWithWishlist - Card:', card.card_id, 'isInCollection:', isInCollection, 'renderKey:', renderKey, 'timestamp:', new Date().toISOString());

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

    setRenderKey(prev => prev + 1);
    console.log('CardWithWishlist - Forcing re-render for card:', card.card_id);
    
    if (onAddToCollection) {
      
      console.log('CardWithWishlist - Using custom handler (modal)');
      onAddToCollection(card);
    } else {
      
      console.log('CardWithWishlist - Using direct collection action');
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
    
    setRenderKey(prev => prev + 1);
    
    addToWishlist({ 
      cardId: card.card_id, 
      cardName: card.name, 
      cardLanguage: card.language 
    });
    
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