import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ShopProductListItemProps {
  product: any;
  onAddToCart?: (product: any) => void;
  isLoading?: boolean;
}

const ShopProductListItem = ({ 
  product, 
  onAddToCart, 
  isLoading = false 
}: ShopProductListItemProps) => {
  const { t } = useTranslation();
  
  const productPrice = product.price || 0;
  const stock = product.stock || 0;
  const productImage = product.image_url || '/placeholder.svg';

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md"
      )}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {}
          <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            
            {}
            <div className="absolute top-1 left-1">
              <Badge 
                variant={stock > 5 ? "default" : "destructive"} 
                className="text-[10px] px-1 py-0.5"
              >
                {stock > 5 ? t('shop.inStock') : `${stock} ${t('shop.left')}`}
              </Badge>
            </div>
          </div>

          {}
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {product.name || 'Unknown Product'}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {product.set_name || product.category} • {product.card_number || product.article_number}
              </p>
              {product.rarity && (
                <p className="text-xs text-muted-foreground">
                  {product.rarity}
                </p>
              )}
            </div>

            {}
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm font-bold text-primary">
                CHF {productPrice.toFixed(2)}
              </div>
              
              <Button
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={isLoading}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                {t('shop.addToCart')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopProductListItem;
