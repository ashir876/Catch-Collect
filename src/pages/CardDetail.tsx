
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  ShoppingCart, 
  ArrowLeft, 
  Star,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { useQueryClient } from "@tanstack/react-query";

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
  attacks: any; // Changed from any[] to any to match Json type
  weaknesses: any; // Changed from any[] to any to match Json type
  retreat: number;
  set_symbol_url: string;
  language: string;
}

const CardDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchCard = async () => {
      if (!id) return;
      
    
      
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('card_id', id)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        

        setCard(data);
      } catch (error) {
        console.error('Error fetching card:', error);
        toast({
          title: t('messages.error'),
          description: t('cardDetail.cardNotFoundSubtitle'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, toast, t]);

  const handleAddToCollection = async () => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCollection'),
        variant: "destructive",
      });
      return;
    }

    if (!card) return;

    try {
      const { error } = await supabase
        .from('card_collections')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
          language: card.language || 'en',
          name: card.name,
          set_name: card.set_name,
          set_id: card.set_id,
          card_number: card.card_number,
          rarity: card.rarity,
          image_url: card.image_url,
          description: card.description,
          illustrator: card.illustrator,
          hp: card.hp,
          types: card.types,
          attacks: card.attacks,
          weaknesses: card.weaknesses,
          retreat: card.retreat,
          condition: 'Near Mint',
          price: 0,
          notes: '',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Invalidate collection queries to update navigation badge
      queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
      queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });

      toast({
        title: t('messages.addedToCollection'),
        description: `${card.name} ${t('messages.addedToCollection').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.collectionError'),
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredWishlist'),
        variant: "destructive",
      });
      return;
    }

    if (!card) return;

    try {
      const { error } = await supabase
        .from('card_wishlist')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
          language: 'de'
        });

      if (error) throw error;

      // Invalidate wishlist queries to update navigation badge
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });

      toast({
        title: t('messages.addedToWishlist'),
        description: `${card.name} ${t('messages.addedToWishlist').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.wishlistError'),
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredCart'),
        variant: "destructive",
      });
      return;
    }

    if (!card) return;

    try {
      const { error } = await supabase
        .from('carts')
        .insert({
          user_id: user.id,
          article_number: card.card_id,
          quantity: 1
        });

      if (error) throw error;

      // Invalidate cart queries to update navigation badge
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });

      toast({
        title: t('messages.addedToCart'),
        description: `${card.name} ${t('messages.addedToCart').toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: t('messages.error'),
        description: t('messages.cartError'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('cardDetail.cardNotFound')}</h2>
          <p className="text-muted-foreground mb-6">{t('cardDetail.cardNotFoundSubtitle')}</p>
          <Link to="/cards">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('cardDetail.backToCards')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Link 
        to="/cards" 
        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('cardDetail.backToCards')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Image */}
        <div className="flex justify-center">
          <div className="pixel-card max-w-sm w-full">
            <img 
              src={card.image_url || '/placeholder.svg'} 
              alt={card.name}
              className="w-full h-auto pixelated"
            />
          </div>
        </div>

        {/* Card Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="pixel-text-header mb-2">{card.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge className="pixel-badge">{card.set_name}</Badge>
              {card.rarity && (
                <Badge variant="secondary" className="pixel-badge">
                  <Star className="mr-1 h-3 w-3" />
                  {card.rarity}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleAddToCollection}
              className="pixel-button flex-1 min-w-0"
            >
              <Heart className="mr-2 h-4 w-4" />
              {t('cardDetail.addToCollection')}
            </Button>
            <Button 
              onClick={handleAddToWishlist}
              variant="secondary"
              className="pixel-button-secondary flex-1 min-w-0"
            >
              <Star className="mr-2 h-4 w-4" />
              {t('cardDetail.addToWishlist')}
            </Button>
            <Button 
              onClick={handleAddToCart}
              variant="outline"
              className="pixel-button flex-1 min-w-0"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('cardDetail.addToCart')}
            </Button>
          </div>

          {/* Card Information */}
          <Card className="pixel-card">
            <CardHeader>
              <CardTitle>{t('cardDetail.cardInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {card.card_number && (
                <div className="flex justify-between">
                  <span className="font-semibold">Nummer:</span>
                  <span>{card.card_number}</span>
                </div>
              )}
              {card.types && card.types.length > 0 && (
                <div className="flex justify-between">
                  <span className="font-semibold">Typ:</span>
                  <div className="flex gap-1">
                    {card.types.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {card.hp && (
                <div className="flex justify-between">
                  <span className="font-semibold">HP:</span>
                  <span className="font-mono">{card.hp}</span>
                </div>
              )}
              {card.illustrator && (
                <div className="flex justify-between">
                  <span className="font-semibold">Illustrator:</span>
                  <span>{card.illustrator}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attacks */}
          {card.attacks && Array.isArray(card.attacks) && card.attacks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('cardDetail.attacks')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {card.attacks.map((attack: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{attack.name}</h4>
                      {attack.damage && (
                        <Badge variant="destructive">
                          <Zap className="mr-1 h-3 w-3" />
                          {attack.damage}
                        </Badge>
                      )}
                    </div>
                    {attack.cost && attack.cost.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{t('cardDetail.cost')}: </span>
                        {attack.cost.map((cost: string, costIndex: number) => (
                          <Badge key={costIndex} variant="outline" className="mr-1 text-xs">
                            {cost}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {attack.effect && (
                      <p className="text-sm">{attack.effect}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {card.weaknesses && Array.isArray(card.weaknesses) && card.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('cardDetail.weaknesses')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {card.weaknesses.map((weakness: any, index: number) => (
                    <Badge key={index} variant="destructive">
                      <Shield className="mr-1 h-3 w-3" />
                      {weakness.type} {weakness.value && `(${weakness.value})`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDetail;
