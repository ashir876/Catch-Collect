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
           <div className="w-full h-full flex items-center justify-center">
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