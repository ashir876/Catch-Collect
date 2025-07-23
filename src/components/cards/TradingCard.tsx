
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TradingCardProps {
  id: string;
  name: string;
  series: string;
  set: string;
  number?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  type?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  inStock?: boolean;
  inCollection?: boolean;
  inWishlist?: boolean;
  description?: string;
  // Legacy props
  isOwned?: boolean;
  isWishlisted?: boolean;
  // Action handlers
  onAddToCart?: (id?: string) => void;
  onAddToCollection?: (id?: string) => void;
  onAddToWishlist?: (id?: string) => void;
  onToggleWishlist?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const rarityConfig = {
  common: {
    color: "common",
    gradient: "from-muted to-muted/80",
    glow: "",
    label: "Common"
  },
  rare: {
    color: "rare",
    gradient: "from-rare/20 to-rare/5",
    glow: "shadow-rare",
    label: "Rare"
  },
  epic: {
    color: "epic",
    gradient: "from-epic/20 to-epic/5",
    glow: "shadow-glow",
    label: "Epic"
  },
  legendary: {
    color: "legendary",
    gradient: "from-legendary/20 to-legendary/5",
    glow: "shadow-glow",
    label: "Legendary"
  }
};

// Helper function to normalize rarity values from database to component format
const normalizeRarity = (rarity: string): "common" | "rare" | "epic" | "legendary" => {
  const normalizedRarity = rarity.toLowerCase();
  
  switch (normalizedRarity) {
    case "common":
      return "common";
    case "rare":
      return "rare";
    case "ultra rare":
    case "epic":
      return "epic";
    case "legendary":
    case "secret rare":
      return "legendary";
    default:
      console.warn(`Unknown rarity: ${rarity}, defaulting to common`);
      return "common";
  }
};

const TradingCard = ({
  id,
  name,
  series,
  set,
  number,
  rarity,
  type,
  price,
  image,
  imageUrl,
  inStock = true,
  inCollection = false,
  inWishlist = false,
  description,
  // Legacy props
  isOwned = false,
  isWishlisted = false,
  // Action handlers
  onAddToCart,
  onAddToCollection,
  onAddToWishlist,
  onToggleWishlist,
  onViewDetails
}: TradingCardProps) => {
  // Normalize props
  const cardImage = image || imageUrl || "/placeholder.svg";
  const owned = inCollection || isOwned;
  const wishlisted = inWishlist || isWishlisted;
  const [isHovered, setIsHovered] = useState(false);
  
  // Normalize the rarity to ensure it matches our config keys
  const normalizedRarity = normalizeRarity(rarity);
  const rarityInfo = rarityConfig[normalizedRarity];

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:scale-105 hover:shadow-card",
        rarityInfo.glow && isHovered && rarityInfo.glow,
        owned && "ring-2 ring-accent ring-opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(id)}
    >
      {/* Rarity Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        rarityInfo.gradient
      )} />
      
      <CardContent className="p-4 relative z-10">
        {/* Card Image */}
        <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-lg bg-muted">
          <img
            src={cardImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-1",
                `bg-${rarityInfo.color}/20 text-${rarityInfo.color} border-${rarityInfo.color}/30`
              )}
            >
              {rarityInfo.label}
            </Badge>
            {owned && (
              <Badge variant="outline" className="text-xs px-2 py-1 bg-accent/20 text-accent border-accent/30">
                Besitzt
              </Badge>
            )}
            {!inStock && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                Ausverkauft
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist?.(id);
                  onAddToWishlist?.(id);
                }}
              >
                <Heart 
                  className={cn(
                    "w-4 h-4",
                    wishlisted && "fill-destructive text-destructive"
                  )} 
                />
              </Button>
              <Link to={`/card/${id}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {series} • {set} {number && `• ${number}`}
            </p>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">{price.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">CHF</span>
            </div>
            
            {inStock && !owned && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(id);
                }}
                className="bg-gradient-primary hover:shadow-card transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Kaufen
              </Button>
            )}
            {!inStock && owned && onAddToCollection && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCollection(id);
                }}
              >
                Sammlung
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Foil Effect for Legendary Cards */}
      {normalizedRarity === "legendary" && (
        <div className="absolute inset-0 bg-gradient-foil opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      )}
    </Card>
  );
};

export default TradingCard;
