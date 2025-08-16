import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface AddToWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    priority: string;
    notes: string;
    language: string;
    price: number;
  }) => void;
  cardName: string;
  isLoading?: boolean;
}

const AddToWishlistModal = ({
  isOpen,
  onClose,
  onAdd,
  cardName,
  isLoading = false
}: AddToWishlistModalProps) => {
  const { t } = useTranslation();
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [price, setPrice] = useState("0.00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      priority,
      notes,
      language: selectedLanguage,
      price: parseFloat(price) || 0
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setPriority("medium");
    setNotes("");
    setSelectedLanguage("all");
    setPrice("0.00");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-bold">
            {t('wishlist.addCardToWishlist')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('wishlist.provideCardDetails')}
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

                     {/* Priority */}
           <div className="space-y-2">
             <Label htmlFor="priority">{t('wishlist.priority')}</Label>
             <Select value={priority} onValueChange={setPriority}>
               <SelectTrigger>
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="low">{t('wishlist.priorityLow')}</SelectItem>
                 <SelectItem value="medium">{t('wishlist.priorityMedium')}</SelectItem>
                 <SelectItem value="high">{t('wishlist.priorityHigh')}</SelectItem>
               </SelectContent>
             </Select>
           </div>

           {/* Price */}
           <div className="space-y-2">
             <Label htmlFor="price">{t('wishlist.price')} (CHF)</Label>
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

           {/* Notes */}
           <div className="space-y-2">
             <Label htmlFor="notes">{t('wishlist.notes')}</Label>
             <Textarea
               id="notes"
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               placeholder={t('wishlist.notesPlaceholder')}
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

export default AddToWishlistModal;
