import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Trash2, Edit } from "lucide-react";

interface CardInstanceProps {
  card: {
    id: string;
    cardId: string;
    name: string;
    image: string;
    condition: string;
    price: number;
    quantity: number;
    notes: string;
    acquiredDate: string;
    language: string;
    set: string;
    rarity: string;
    number: string;
  };
  onRemove: (instanceId: string, cardName: string) => void;
  onEdit?: (instanceId: string) => void;
  showDetails?: boolean;
}

const CardInstance: React.FC<CardInstanceProps> = ({
  card,
  onRemove,
  onEdit,
  showDetails = false
}) => {
  const { t } = useTranslation();

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'mint':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'near mint':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excellent':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'light played':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'played':
        return 'bg-red-200 text-red-900 border-red-300';
      case 'poor':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'epic':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'common':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Card Image */}
          <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border-2 border-black flex-shrink-0">
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Card Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                <p className="text-muted-foreground text-xs mb-1">#{card.number}</p>
                
                {/* Badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={`text-xs ${getRarityColor(card.rarity)}`}>
                    {card.rarity}
                  </Badge>
                  <Badge className={`text-xs ${getConditionColor(card.condition)}`}>
                    {card.condition}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {card.set}
                  </Badge>
                  {card.quantity > 1 && (
                    <Badge variant="outline" className="text-xs bg-blue-100">
                      Qty: {card.quantity}
                    </Badge>
                  )}
                  {card.language !== 'en' && (
                    <Badge variant="outline" className="text-xs">
                      {card.language.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {/* Additional Details */}
                {showDetails && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      {t('collection.acquired')}: {new Date(card.acquiredDate).toLocaleDateString()}
                    </p>
                    {card.price > 0 && (
                      <p>
                        {t('collection.price')}: CHF {card.price.toFixed(2)}
                      </p>
                    )}
                    {card.notes && (
                      <p className="truncate">
                        {t('collection.notes')}: {card.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(card.id)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(card.id, card.name)}
                  className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardInstance;
