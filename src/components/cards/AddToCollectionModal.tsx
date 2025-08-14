import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    condition: string;
    price: number;
    date: string;
  }) => void;
  cardName: string;
  isLoading?: boolean;
}

const AddToCollectionModal = ({
  isOpen,
  onClose,
  onAdd,
  cardName,
  isLoading = false
}: AddToCollectionModalProps) => {
  const { t } = useTranslation();
  const [condition, setCondition] = useState("Mint");
  const [price, setPrice] = useState("0.00");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      condition,
      price: parseFloat(price) || 0,
      date
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setCondition("Mint");
    setPrice("0.00");
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t('collection.addCardToCollection')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('collection.provideCardDetails')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">{t('collection.condition')}</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mint">{t('collection.conditionMint')}</SelectItem>
                <SelectItem value="Near Mint">{t('collection.conditionNearMint')}</SelectItem>
                <SelectItem value="Excellent">{t('collection.conditionExcellent')}</SelectItem>
                <SelectItem value="Good">{t('collection.conditionGood')}</SelectItem>
                <SelectItem value="Light Played">{t('collection.conditionLightPlayed')}</SelectItem>
                <SelectItem value="Played">{t('collection.conditionPlayed')}</SelectItem>
                <SelectItem value="Poor">{t('collection.conditionPoor')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">{t('collection.price')} (CHF)</Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pr-12"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                CHF
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">{t('collection.date')}</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.adding') : t('common.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionModal;
