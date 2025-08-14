import { useIsCardInCollection } from "@/hooks/useCollectionData";
import { useIsCardInWishlist } from "@/hooks/useWishlistData";
import { useCollectionActions, useWishlistActions } from "@/hooks/useCollectionActions";
import TradingCard from "./TradingCard";
import { mapDatabaseRarityToComponent } from "@/lib/rarityUtils";

interface CardWithWishlistProps {
  card: any; // Card data from the database
  hidePriceAndBuy?: boolean;
  onAddToCollection?: (card: any) => void; // Custom handler for adding to collection
}

const CardWithWishlist = ({ card, hidePriceAndBuy = true, onAddToCollection }: CardWithWishlistProps) => {
  const { data: isInCollection = false } = useIsCardInCollection(card.card_id);
  const { data: isInWishlist = false } = useIsCardInWishlist(card.card_id);
  
  const { addToCollection, removeFromCollection, isAddingToCollection, isRemovingFromCollection } = useCollectionActions();
  const { addToWishlist, removeFromWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlistActions();

  const handleAddToCollection = () => {
    if (onAddToCollection) {
      // Use custom handler if provided (for modal)
      onAddToCollection(card);
    } else {
      // Fallback to direct collection action
      addToCollection({ 
        cardId: card.card_id, 
        cardName: card.name, 
        cardLanguage: card.language 
      });
    }
  };

  const handleAddToWishlist = () => {
    addToWishlist({ 
      cardId: card.card_id, 
      cardName: card.name, 
      cardLanguage: card.language 
    });
  };

  return (
    <TradingCard
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
      cardData={card}
      onAddToCollection={handleAddToCollection}
      onAddToWishlist={handleAddToWishlist}
    />
  );
};

export default CardWithWishlist; 