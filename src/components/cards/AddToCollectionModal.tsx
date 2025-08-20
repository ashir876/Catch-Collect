import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    notes: string;
    quantity: number;
    language: string;
    acquiredDate: string;
  }) => void;
  cardName: string;
  isLoading?: boolean;
  isBulkMode?: boolean;
}

const AddToCollectionModal = ({
  isOpen,
  onClose,
  onAdd,
  cardName,
  isLoading = false,
  isBulkMode = false
}: AddToCollectionModalProps) => {
  const { t } = useTranslation();
  const [condition, setCondition] = useState("Mint");
  const [price, setPrice] = useState("0.00");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      condition,
      price: parseFloat(price) || 0,
      date,
      notes,
      quantity: parseInt(quantity) || 1,
      language: selectedLanguage,
      acquiredDate: date
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setCondition("Mint");
    setPrice("0.00");
    setDate(new Date().toISOString().split('T')[0]);
    setNotes("");
    setQuantity("1");
    setSelectedLanguage("all");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-bold">
            {isBulkMode ? `Add ${cardName} to Collection` : t('collection.addCardToCollection')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isBulkMode ? 'Provide details for all selected cards' : t('collection.provideCardDetails')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Language Filter */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('cards.language')}</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.allLanguages')}</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="nl">Nederlands</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {isBulkMode ? 'Quantity per card' : t('collection.quantity')}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
            />
            {isBulkMode && (
              <p className="text-xs text-muted-foreground">
                Each selected card will be added with this quantity
              </p>
            )}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('collection.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('collection.notesPlaceholder')}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3">
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
