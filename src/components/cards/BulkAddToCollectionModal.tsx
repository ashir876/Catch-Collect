import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CardDetails {
  condition: string;
  price: number;
  date: string;
  notes: string;
}

interface BulkAddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cardDetails: { [cardId: string]: CardDetails }) => void;
  selectedCards: Array<{ card_id: string; language: string; name: string; image_url?: string; set_name?: string; card_number?: string }>;
  isLoading?: boolean;
}

const BulkAddToCollectionModal = ({
  isOpen,
  onClose,
  onAdd,
  selectedCards,
  isLoading = false
}: BulkAddToCollectionModalProps) => {
  const { t } = useTranslation();
  const [cardDetails, setCardDetails] = useState<{ [cardId: string]: CardDetails }>({});

  // Initialize card details when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const initialDetails: { [cardId: string]: CardDetails } = {};
      selectedCards.forEach(card => {
        const cardId = `${card.card_id}-${card.language}`;
        initialDetails[cardId] = {
          condition: 'Near Mint',
          price: 0,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        };
      });
      setCardDetails(initialDetails);
    }
  }, [isOpen, selectedCards]);

  const handleCardDetailChange = (cardId: string, field: keyof CardDetails, value: string | number) => {
    setCardDetails(prev => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(cardDetails);
  };

  const handleClose = () => {
    setCardDetails({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-bold">
            Add {selectedCards.length} Cards to Collection
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set individual details for each selected card
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {selectedCards.map((card) => {
              const cardId = `${card.card_id}-${card.language}`;
              const details = cardDetails[cardId] || {
                condition: 'Near Mint',
                price: 0,
                date: new Date().toISOString().split('T')[0],
                notes: ''
              };

              return (
                <Card key={cardId} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex gap-4">
                      {/* Card Image */}
                      <div className="w-20 h-28 flex-shrink-0">
                        <img
                          src={card.image_url || "/placeholder.svg"}
                          alt={card.name}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>

                      {/* Card Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                        <p className="text-muted-foreground text-xs">
                          {card.set_name} • {card.card_number}
                        </p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {card.language}
                        </Badge>
                      </div>

                      {/* Details Form */}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        {/* Condition */}
                        <div className="space-y-1">
                          <Label htmlFor={`condition-${cardId}`} className="text-xs">Condition</Label>
                          <Select
                            value={details.condition}
                            onValueChange={(value) => handleCardDetailChange(cardId, 'condition', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Near Mint">Near Mint</SelectItem>
                              <SelectItem value="Lightly Played">Lightly Played</SelectItem>
                              <SelectItem value="Played">Played</SelectItem>
                              <SelectItem value="Poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Price */}
                        <div className="space-y-1">
                          <Label htmlFor={`price-${cardId}`} className="text-xs">Price</Label>
                          <Input
                            id={`price-${cardId}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={details.price}
                            onChange={(e) => handleCardDetailChange(cardId, 'price', parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                            placeholder="0.00"
                          />
                        </div>



                        {/* Date */}
                        <div className="space-y-1">
                          <Label htmlFor={`date-${cardId}`} className="text-xs">Date Acquired</Label>
                          <Input
                            id={`date-${cardId}`}
                            type="date"
                            value={details.date}
                            onChange={(e) => handleCardDetailChange(cardId, 'date', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1 col-span-2">
                          <Label htmlFor={`notes-${cardId}`} className="text-xs">Notes</Label>
                          <Textarea
                            id={`notes-${cardId}`}
                            value={details.notes}
                            onChange={(e) => handleCardDetailChange(cardId, 'notes', e.target.value)}
                            className="h-16 text-xs resize-none"
                            placeholder="Optional notes about this card..."
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : `Add ${selectedCards.length} Cards to Collection`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddToCollectionModal;
