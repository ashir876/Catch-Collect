import TradingCard from "./TradingCard";

interface CardWithWishlistProps {
  card: {
    card_id: string;
    name: string;
    set_name: string;
    card_number?: string;
    rarity?: string;
    types?: string[];
    image_url?: string;
    description?: string;
    language?: string;
  };
  isInWishlist: boolean;
  onAddToCollection: (cardId: string, cardName: string, cardLanguage?: string) => void;
  onAddToWishlist: (cardId: string, cardName: string, cardLanguage?: string) => void;
  mapDatabaseRarityToComponent: (rarity: string) => "common" | "rare" | "epic" | "legendary";
}

const CardWithWishlist = ({ 
  card, 
  isInWishlist,
  onAddToCollection, 
  onAddToWishlist, 
  mapDatabaseRarityToComponent 
}: CardWithWishlistProps) => {
  return (
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
      inWishlist={isInWishlist}
      description={card.description || ''}
      hidePriceAndBuy={true}
      cardData={card}
      onAddToCollection={() => onAddToCollection(card.card_id, card.name || 'Unknown Card', card.language)}
      onAddToWishlist={() => onAddToWishlist(card.card_id, card.name || 'Unknown Card', card.language)}
    />
  );
};

export default CardWithWishlist; 