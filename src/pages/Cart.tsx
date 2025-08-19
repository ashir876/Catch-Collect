import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNewCartData } from "@/hooks/useNewCartData";
import { useCartActions } from "@/hooks/useCartActions";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: cartItems = [], isLoading, error } = useNewCartData();
  const { updateQuantity, removeItem, clearCart, isLoading: isUpdating } = useCartActions();

  // Debug logging
  console.log('Cart component render:', { user, cartItems, isLoading, error });

  const updateCartQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    try {
      await updateQuantity({ id, quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quantity. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const removeCartItem = async (id: string) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const clearCartItems = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: t('cart.emptyCart'),
        description: t('cart.noItemsToClear'),
      });
      return;
    }

    // Simple confirmation - in a real app you might want a proper confirmation dialog
    if (window.confirm(t('cart.confirmClearCart'))) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast({
          title: 'Error',
          description: 'Failed to clear cart. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-4">{t('auth.loginRequired')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('auth.loginRequiredCart')}
          </p>
          <Link to="/auth">
            <Button size="lg">
              {t('auth.signIn')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Safely calculate totals with error handling
  let subtotal = 0;
  let totalItems = 0;
  
  try {
    subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    console.error('Error calculating cart totals:', error);
    subtotal = 0;
    totalItems = 0;
  }
  
  const shipping = subtotal > 50 ? 0 : 5.90;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      toast({
        title: t('cart.emptyCart'),
        description: t('cart.addItemsFirst'),
        variant: 'destructive',
      });
      return;
    }

    // For now, show a placeholder message
    // In a real implementation, this would redirect to a checkout page or payment processor
    toast({
      title: t('cart.checkoutRedirect'),
      description: t('cart.checkoutDescription'),
    });
    
    // TODO: Implement actual checkout flow
    // This could redirect to a checkout page or integrate with a payment processor
    console.log('Checkout initiated with items:', cartItems);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Cart loading error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Error Loading Cart</h2>
          <p className="text-muted-foreground mb-8">
            There was an error loading your cart. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
          <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
            {t('cart.title')}
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
          {totalItems || 0} {(totalItems || 0) !== 1 ? t('cart.items') : t('cart.item')} {t('cart.inCart')}
        </p>
      </div>
      
      {/* Back to Shop Button */}
      <div className="mb-8">
        <Link to="/shop">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('cart.backToShop')}
          </Button>
        </Link>
      </div>

      {!cartItems || cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-4">{t('cart.emptyCart')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('cart.emptyCartSubtitle')}
          </p>
          <Link to="/shop">
            <Button size="lg">
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('cart.startShopping')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t('cart.items')}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCartItems}
                disabled={isUpdating}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('cart.clearCart')}
              </Button>
            </div>

            {cartItems && Array.isArray(cartItems) && cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Card Image */}
                    <div className="w-20 h-28 flex-shrink-0">
                      <img
                        src={item.product_image || "/placeholder.svg"}
                        alt={item.product_name || item.article_number}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    
                    {/* Card Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.product_name || item.article_number || 'Unknown Item'}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCartItem(item.id)}
                          disabled={isUpdating}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Badges Section */}
                      <div className="flex items-center gap-2 mb-4">
                        {item.product_rarity && (
                          <Badge 
                            className={
                              item.product_rarity === 'legendary' ? 'bg-legendary/10 text-legendary border-legendary' :
                              item.product_rarity === 'epic' ? 'bg-epic/10 text-epic border-epic' :
                              item.product_rarity === 'rare' ? 'bg-rare/10 text-rare border-rare' :
                              'bg-common/10 text-common border-common'
                            }
                          >
                            {item.product_rarity}
                          </Badge>
                        )}

                      </div>

                      {/* Quantity Controls and Price */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1 || isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-8 text-center">{item.quantity || 1}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">CHF {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">CHF {(item.price || 0).toFixed(2)} {t('cart.perItem')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')} ({(totalItems || 0)} {(totalItems || 0) !== 1 ? t('cart.items') : t('cart.item')})</span>
                  <span>CHF {(subtotal || 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('cart.shipping')}</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">{t('cart.free')}</span>
                    ) : (
                      `CHF ${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {t('cart.freeShippingThreshold')}
                  </p>
                )}

                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('cart.total')}</span>
                  <span>CHF {(total || 0).toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isUpdating}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('cart.checkout')} ({(totalItems || 0)})
                </Button>

                <div className="text-sm text-muted-foreground text-center">
                  {t('cart.securePayment')}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('cart.paymentMethods')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• {t('cart.creditCard')}</div>
                  <div>• PayPal</div>
                  <div>• TWINT</div>
                  <div>• {t('cart.invoice')}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
