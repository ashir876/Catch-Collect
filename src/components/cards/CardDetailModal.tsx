import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCardClick = () => {
    setOpen(true);
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
             <DialogTrigger asChild>
         <div 
           onClick={handleCardClick}
           className="cursor-pointer"
         >
           {children}
         </div>
       </DialogTrigger>
                    <DialogContent 
         className="max-w-2xl max-h-[95vh] p-0 overflow-hidden bg-transparent"
       >
         <div className="relative">
           {/* Close Button - Positioned absolutely */}
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setOpen(false)}
             className="absolute top-2 right-2 z-50 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
           >
             <X className="h-4 w-4" />
           </Button>
           
           {/* Big Card Image - Takes up most of the modal */}
          <div className="w-full h-full flex items-center justify-center relative">
            {(() => {
              try {
                const queries = (queryClient as any)?.getQueryCache?.()?.getAll?.() || [];
                for (const q of queries) {
                  const key = (q as any).queryKey as any[];
                  if (Array.isArray(key) && key[0] === 'collection-check' && key[2] === card.card_id) {
                    const data = (q as any).state?.data as boolean | undefined;
                    if (data) {
                      return (
                        <div className="absolute top-4 left-4 z-50 bg-emerald-600 text-white rounded-lg px-2 py-1 shadow-lg border-2 border-white flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-semibold">Collected</span>
                        </div>
                      );
                    }
                  }
                }
              } catch {}
              return null;
            })()}
            <img
              src={card.image_url || '/placeholder.svg'}
              alt={card.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
         </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal; 