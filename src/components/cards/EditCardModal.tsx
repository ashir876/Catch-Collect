import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: any;
  type: 'collection' | 'wishlist';
  onSuccess?: () => void;
}

export function EditCardModal({ isOpen, onClose, card, type, onSuccess }: EditCardModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    condition: '',
    price: '',
    notes: '',
    priority: '',
    language: ''
  });
  const [loading, setLoading] = useState(false);

  // Initialize form data when card changes
  useEffect(() => {
    if (card) {
      console.log('EditCardModal - Card data received:', card);
      setFormData({
        condition: card.condition || '',
        price: card.myPrice?.toString() || '',
        notes: card.notes || '',
        priority: card.priority || 'medium',
        language: card.language || 'all'
      });
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    setLoading(true);
    try {
      console.log('EditCardModal - Starting update for card:', card);
      const updateData: any = {};

      if (type === 'collection') {
        // Update collection card
        if (formData.condition) updateData.condition = formData.condition;
        if (formData.price) updateData.price = parseFloat(formData.price);
        if (formData.notes !== undefined) updateData.notes = formData.notes;
        if (formData.language && formData.language !== 'all') updateData.language = formData.language;

        console.log('EditCardModal - Updating collection card with data:', { 
          cardId: card.id, 
          card_id: card.card_id,
          user_id: user?.id,
          updateData,
          formData 
        });

        const { error } = await supabase
          .from('card_collections')
          .update(updateData)
          .eq('card_id', card.card_id)
          .eq('user_id', user?.id);

        if (error) {
          console.error('EditCardModal - Supabase error:', error);
          throw error;
        }
        
        console.log('EditCardModal - Database update successful');

        // Invalidate collection queries
        if (user?.id) {
          console.log('EditCardModal - Invalidating queries for user:', user.id);
          // Force refetch by invalidating and refetching
          await queryClient.invalidateQueries({ queryKey: ['collection', user.id] });
          await queryClient.invalidateQueries({ queryKey: ['collection-count', user.id] });
          
          // Force a refetch to ensure the data is updated
          await queryClient.refetchQueries({ queryKey: ['collection', user.id] });
          
          console.log('EditCardModal - Query invalidation and refetch completed');
        } else {
          console.warn('EditCardModal - No user found for query invalidation');
        }

        toast({
          title: t('messages.updated'),
          description: t('messages.collectionCardUpdated'),
        });

      } else if (type === 'wishlist') {
        // Update wishlist card
        if (formData.price) updateData.price = parseFloat(formData.price);
        if (formData.notes !== undefined) updateData.notes = formData.notes;
        if (formData.priority) {
          const priorityMap = { low: 0, medium: 1, high: 2 };
          updateData.priority = priorityMap[formData.priority as keyof typeof priorityMap];
        }

        console.log('EditCardModal - Updating wishlist card with data:', { cardId: card.id, updateData });

        const { error } = await supabase
          .from('card_wishlist')
          .update(updateData)
          .eq('card_id', card.card_id)
          .eq('user_id', user?.id);

        if (error) {
          console.error('EditCardModal - Supabase wishlist error:', error);
          throw error;
        }

        // Invalidate wishlist queries
        if (user?.id) {
          console.log('EditCardModal - Invalidating wishlist queries for user:', user.id);
          await queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
          await queryClient.invalidateQueries({ queryKey: ['wishlist-count', user.id] });
        } else {
          console.warn('EditCardModal - No user found for wishlist query invalidation');
        }

        toast({
          title: t('messages.updated'),
          description: t('messages.wishlistCardUpdated'),
        });
      }

      onSuccess?.();
      onClose();

    } catch (error) {
      console.error('EditCardModal - Error updating card:', error);
      toast({
        title: t('messages.error'),
        description: error instanceof Error ? error.message : t('messages.updateError'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === 'collection' ? t('collection.editCard') : t('wishlist.editCard')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Info Display */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-12 h-16 bg-white rounded border overflow-hidden flex-shrink-0">
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{card.name}</h4>
              <p className="text-xs text-muted-foreground">{card.set}</p>
            </div>
          </div>

          {/* Collection-specific fields */}
          {type === 'collection' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="condition">{t('collection.condition')}</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('collection.selectCondition')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Near Mint">{t('collection.nearMint')}</SelectItem>
                    <SelectItem value="Lightly Played">{t('collection.lightlyPlayed')}</SelectItem>
                    <SelectItem value="Played">{t('collection.played')}</SelectItem>
                    <SelectItem value="Poor">{t('collection.poor')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t('collection.language')}</Label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('collection.selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('collection.allLanguages')}</SelectItem>
                    <SelectItem value="en">{t('collection.english')}</SelectItem>
                    <SelectItem value="de">{t('collection.german')}</SelectItem>
                    <SelectItem value="nl">{t('collection.dutch')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Wishlist-specific fields */}
          {type === 'wishlist' && (
            <div className="space-y-2">
              <Label htmlFor="priority">{t('wishlist.priority')}</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('wishlist.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('wishlist.lowPriority')}</SelectItem>
                  <SelectItem value="medium">{t('wishlist.mediumPriority')}</SelectItem>
                  <SelectItem value="high">{t('wishlist.highPriority')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Common fields */}
          <div className="space-y-2">
            <Label htmlFor="price">
              {type === 'collection' ? t('collection.price') : t('wishlist.desiredPrice')}
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder={type === 'collection' ? t('collection.enterPrice') : t('wishlist.enterDesiredPrice')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('common.notes')}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t('common.addNotes')}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t('common.updating') : t('common.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
