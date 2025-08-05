import { useState } from "react";
import { 
  Heart, 
  ShoppingCart, 
  Star,
  Zap,
  Shield,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
}

interface CardDetailModalProps {
  card: CardData;
  children: React.ReactNode;
}

const CardDetailModal = ({ card, children }: CardDetailModalProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
        });

      if (error) {
        console.error('Error adding to collection:', error);
        throw error;
      }

      toast({
        title: t('messages.success'),
        description: t('cardDetail.addedToCollection'),
      });

      // Invalidate and refetch collection data
      queryClient.invalidateQueries({ queryKey: ['collection'] });
    } catch (error) {
      console.error('Error adding to collection:', error);
      toast({
        title: t('messages.error'),
        description: t('cardDetail.errorAddingToCollection'),
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
        .from('wishlist')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }

      toast({
        title: t('messages.success'),
        description: t('cardDetail.addedToWishlist'),
      });

      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: t('messages.error'),
        description: t('cardDetail.errorAddingToWishlist'),
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
        .from('cart')
        .insert({
          user_id: user.id,
          card_id: card.card_id,
          quantity: 1,
        });

      if (error) {
        console.error('Error adding to cart:', error);
        throw error;
      }

      toast({
        title: t('messages.success'),
        description: t('cardDetail.addedToCart'),
      });

      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: t('messages.error'),
        description: t('cardDetail.errorAddingToCart'),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="cursor-pointer"
        >
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{card?.name}</DialogTitle>
        </DialogHeader>
        
        {card ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card Image */}
            <div className="space-y-4">
              <div className="aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                <img
                  src={card.image_url || '/placeholder.svg'}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleAddToCollection}
                  variant="outline"
                  className="flex-1"
                >
                  <Star className="w-4 h-4 mr-2" />
                  {t('cardDetail.addToCollection')}
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t('cardDetail.addToWishlist')}
                </Button>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('cardDetail.addToCart')}
                </Button>
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cardDetail.cardInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                                     <div className="grid grid-cols-2 gap-4">
                     <div>
                       <span className="font-medium">{t('cardDetail.set')}: </span>
                       <span>{card.set_name}</span>
                     </div>
                     {card.card_number && (
                       <div>
                         <span className="font-medium">{t('cardDetail.number')}: </span>
                         <span>{card.card_number}</span>
                       </div>
                     )}
                     {card.rarity && (
                       <div>
                         <span className="font-medium">{t('cardDetail.rarity')}: </span>
                         <Badge variant="secondary">{card.rarity}</Badge>
                       </div>
                     )}
                     {card.hp && (
                       <div>
                         <span className="font-medium">HP: </span>
                         <span>{card.hp}</span>
                       </div>
                     )}
                   </div>
                  
                  {card.types && card.types.length > 0 && (
                    <div>
                      <span className="font-medium">{t('cardDetail.types')}: </span>
                      <div className="flex gap-2 mt-1">
                        {card.types.map((type, index) => (
                          <Badge key={index} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {card.description && (
                    <div>
                      <span className="font-medium">{t('cardDetail.description')}: </span>
                      <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    </div>
                  )}
                  
                                     {card.illustrator && (
                     <div>
                       <span className="font-medium">{t('cardDetail.illustrator')}: </span>
                       <span>{card.illustrator}</span>
                     </div>
                   )}
                   
                   {/* Additional Details */}
                   {card.set_id && (
                     <div>
                       <span className="font-medium">Set ID: </span>
                       <span>{card.set_id}</span>
                     </div>
                   )}
                   
                   {card.set_symbol_url && (
                     <div>
                       <span className="font-medium">Set Symbol: </span>
                       <img 
                         src={card.set_symbol_url} 
                         alt="Set Symbol" 
                         className="inline-block w-6 h-6 ml-2"
                       />
                     </div>
                   )}
                 </CardContent>
               </Card>

              {/* Attacks */}
              {card.attacks && card.attacks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('cardDetail.attacks')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {card.attacks.map((attack: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{attack.name}</h4>
                            {attack.damage && (
                              <Badge variant="destructive">{attack.damage}</Badge>
                            )}
                          </div>
                          {attack.cost && (
                            <div className="mb-2">
                              <span className="font-medium">{t('cardDetail.cost')}: </span>
                              <span>{attack.cost}</span>
                            </div>
                          )}
                          {attack.text && (
                            <p className="text-sm text-muted-foreground">{attack.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weaknesses */}
              {card.weaknesses && card.weaknesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('cardDetail.weaknesses')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {card.weaknesses.map((weakness: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline">{weakness.type}</Badge>
                          <span>×{weakness.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Retreat Cost */}
              {card.retreat && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('cardDetail.retreatCost')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>{card.retreat}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">{t('cardDetail.cardNotFound')}</h2>
            <p className="text-muted-foreground">{t('cardDetail.cardNotFoundSubtitle')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal; 