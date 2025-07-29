import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Grid3X3, 
  List, 
  Star, 
  Heart, 
  ShoppingCart,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AdvancedFilters from "@/components/filters/AdvancedFilters";

interface CardData {
  card_id: string;
  name: string;
  set_name: string;
  set_id: string;
  card_number: string;
  rarity: string;
  types: string[];
  hp: number;
  image_url: string;
  description: string;
  illustrator: string;
  attacks: any;
  weaknesses: any;
  retreat: number;
  set_symbol_url: string;
}

interface FilterState {
  rarity: string[];
  types: string[];
  series: string[];
  sets: string[];
  minHp: number | null;
  maxHp: number | null;
  hasAttacks: boolean | null;
  hasWeaknesses: boolean | null;
  priceRange: [number, number] | null;
}

type SortOption = 'name' | 'rarity' | 'set' | 'hp' | 'newest' | 'oldest';
type ViewMode = 'grid' | 'list';

interface CardGridProps {
  initialCards?: CardData[];
  showFilters?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
  className?: string;
}

const CardGrid = ({ 
  initialCards, 
  showFilters = true, 
  showSort = true, 
  showViewToggle = true,
  className = "" 
}: CardGridProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cards, setCards] = useState<CardData[]>(initialCards || []);
  const [filteredCards, setFilteredCards] = useState<CardData[]>(initialCards || []);
  const [loading, setLoading] = useState(!initialCards);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterState>({
    rarity: [],
    types: [],
    series: [],
    sets: [],
    minHp: null,
    maxHp: null,
    hasAttacks: null,
    hasWeaknesses: null,
    priceRange: null
  });

  useEffect(() => {
    if (!initialCards) {
      fetchCards();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [cards, filters, sortBy, sortOrder]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('name');

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...cards];

    // Apply filters
    if (filters.rarity.length > 0) {
      filtered = filtered.filter(card => filters.rarity.includes(card.rarity));
    }

    if (filters.types.length > 0) {
      filtered = filtered.filter(card => 
        card.types && card.types.some(type => filters.types.includes(type))
      );
    }

    if (filters.sets.length > 0) {
      filtered = filtered.filter(card => filters.sets.includes(card.set_id));
    }

    if (filters.minHp !== null) {
      filtered = filtered.filter(card => card.hp && card.hp >= filters.minHp!);
    }

    if (filters.maxHp !== null) {
      filtered = filtered.filter(card => card.hp && card.hp <= filters.maxHp!);
    }

    if (filters.hasAttacks !== null) {
      filtered = filtered.filter(card => 
        filters.hasAttacks ? card.attacks && card.attacks.length > 0 : !card.attacks || card.attacks.length === 0
      );
    }

    if (filters.hasWeaknesses !== null) {
      filtered = filtered.filter(card => 
        filters.hasWeaknesses ? card.weaknesses && card.weaknesses.length > 0 : !card.weaknesses || card.weaknesses.length === 0
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rarity':
          aValue = a.rarity;
          bValue = b.rarity;
          break;
        case 'set':
          aValue = a.set_name;
          bValue = b.set_name;
          break;
        case 'hp':
          aValue = a.hp || 0;
          bValue = b.hp || 0;
          break;
        case 'newest':
        case 'oldest':
          aValue = new Date(a.card_id).getTime();
          bValue = new Date(b.card_id).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCards(filtered);
  };

  const handleAddToCollection = async (cardId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          card_id: cardId,
          language: 'en'
        });

      if (error) throw error;

      // Update local state to show the card is in collection
      setCards(prev => prev.map(card => 
        card.card_id === cardId 
          ? { ...card, inCollection: true }
          : card
      ));
    } catch (error) {
      console.error('Error adding to collection:', error);
    }
  };

  const handleAddToWishlist = async (cardId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('card_wishlist')
        .insert({
          user_id: user.id,
          card_id: cardId,
          language: 'en'
        });

      if (error) throw error;

      // Update local state to show the card is in wishlist
      setCards(prev => prev.map(card => 
        card.card_id === cardId 
          ? { ...card, inWishlist: true }
          : card
      ));
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleAddToCart = async (cardId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('carts')
        .insert({
          user_id: user.id,
          article_number: cardId,
          quantity: 1
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="pixel-card animate-pulse">
            <div className="aspect-[3/4] bg-muted"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      {(showFilters || showSort || showViewToggle) && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border-2 border-black">
          <div className="flex items-center gap-4">
            {showViewToggle && (
              <div className="flex border-2 border-black rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="pixel-button-small rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="pixel-button-small rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}

            {showSort && (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pixel-input text-sm"
                >
                  <option value="name">{t('cards.sortByName')}</option>
                  <option value="rarity">{t('cards.sortByRarity')}</option>
                  <option value="set">{t('cards.sortBySet')}</option>
                  <option value="hp">{t('cards.sortByHp')}</option>
                  <option value="newest">{t('cards.sortByNewest')}</option>
                  <option value="oldest">{t('cards.sortByOldest')}</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortOrder}
                  className="pixel-button-small"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredCards.length} {t('cards.cards')} {t('cards.found')}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <AdvancedFilters onFiltersChange={setFilters} />
      )}

      {/* Cards Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.card_id} className="pixel-card group hover:scale-105 transition-all duration-300">
              <Link to={`/card/${card.card_id}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={card.image_url || '/placeholder.svg'} 
                    alt={card.name} 
                    className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </Link>
              <CardContent className="p-4 bg-background border-t-4 border-black">
                <h3 className="font-black text-sm uppercase tracking-wide mb-1 truncate">
                  {card.name}
                </h3>
                <p className="text-muted-foreground font-bold text-xs mb-2">
                  {card.set_name}
                </p>
                <div className="flex items-center justify-between mb-3">
                  {card.rarity && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {card.rarity}
                    </Badge>
                  )}
                  {card.hp && (
                    <span className="text-xs font-bold">HP: {card.hp}</span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCollection(card.card_id)}
                    className="pixel-button-small flex-1"
                    disabled={card.inCollection}
                  >
                    <Heart className={`h-3 w-3 ${card.inCollection ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddToWishlist(card.card_id)}
                    className="pixel-button-small flex-1"
                    disabled={card.inWishlist}
                  >
                    <Star className={`h-3 w-3 ${card.inWishlist ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToCart(card.card_id)}
                    className="pixel-button-small flex-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCards.map((card) => (
            <Card key={card.card_id} className="pixel-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={card.image_url || '/placeholder.svg'} 
                      alt={card.name} 
                      className="w-full h-full object-cover pixelated"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase tracking-wide mb-1">
                      {card.name}
                    </h3>
                    <p className="text-muted-foreground font-bold text-sm mb-2">
                      {card.set_name} • #{card.card_number}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      {card.rarity && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {card.rarity}
                        </Badge>
                      )}
                      {card.hp && (
                        <Badge variant="outline" className="text-xs">
                          HP: {card.hp}
                        </Badge>
                      )}
                      {card.types && card.types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCollection(card.card_id)}
                      className="pixel-button-small"
                      disabled={card.inCollection}
                    >
                      <Heart className={`h-4 w-4 ${card.inCollection ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAddToWishlist(card.card_id)}
                      className="pixel-button-small"
                      disabled={card.inWishlist}
                    >
                      <Star className={`h-4 w-4 ${card.inWishlist ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(card.card_id)}
                      className="pixel-button-small"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCards.length === 0 && (
        <Card className="pixel-card">
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('cards.noCardsFound')}</h3>
            <p className="text-muted-foreground">{t('cards.noCardsSubtitle')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CardGrid; 