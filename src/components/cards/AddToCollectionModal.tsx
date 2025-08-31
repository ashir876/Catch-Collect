import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface CollectionEntry {
  condition: string;
  price: number;
  date: string;
  notes: string;
  language: string;
  acquiredDate: string;
}

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CollectionEntry[]) => void;
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
  const [entry, setEntry] = useState<CollectionEntry>({
    condition: "Mint",
    price: 0,
    date: new Date().toISOString().split('T')[0],
    notes: "",
    language: "en",
    acquiredDate: new Date().toISOString().split('T')[0]
  });

  const updateEntry = (field: keyof CollectionEntry, value: any) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd([entry]);
  };

  const handleClose = () => {
    // Reset form when closing
    setEntry({
      condition: "Mint",
      price: 0,
      date: new Date().toISOString().split('T')[0],
      notes: "",
      language: "en",
      acquiredDate: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-bold">
            {isBulkMode ? `Add ${cardName} to Collection` : t('collection.addCardToCollection')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isBulkMode ? 'Provide details for all selected cards' : t('collection.provideCardDetails')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Language Filter */}
                <div className="space-y-2">
                  <Label htmlFor="language">{t('cards.language')}</Label>
                  <Select 
                    value={entry.language} 
                    onValueChange={(value) => updateEntry('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Select 
                    value={entry.condition} 
                    onValueChange={(value) => updateEntry('condition', value)}
                  >
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
                      value={entry.price}
                      onChange={(e) => updateEntry('price', parseFloat(e.target.value) || 0)}
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
                    value={entry.date}
                    onChange={(e) => updateEntry('date', e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('collection.notes')}</Label>
                <Textarea
                  id="notes"
                  value={entry.notes}
                  onChange={(e) => updateEntry('notes', e.target.value)}
                  placeholder={t('collection.notesPlaceholder')}
                  rows={2}
                />
              </div>
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
