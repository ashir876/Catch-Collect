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
  const { data: cartItems = [], isLoading } = useNewCartData();
  const { updateQuantity, removeItem, isLoading: isUpdating } = useCartActions();

  const updateCartQuantity = async (id: number, newQuantity: number) => {
    try {
      await updateQuantity({ id, quantity: newQuantity });
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeCartItem = async (id: number) => {
    try {
      await removeItem(id);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCartItems = async () => {
    // try {
    //   await clearCart();
    // } catch (error) {
    //   console.error('Error clearing cart:', error);
    // }
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

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.90;
  const total = subtotal + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    toast({
      title: t('cart.checkoutRedirect'),
      description: t('cart.checkoutDescription'),
    });
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/shop">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('cart.backToShop')}
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">{t('cart.title')}</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          {totalItems} {totalItems !== 1 ? t('cart.items') : t('cart.item')} {t('cart.inCart')}
        </p>
      </div>

      {cartItems.length === 0 ? (
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

            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Card Image */}
                    <div className="w-20 h-28 flex-shrink-0">
                      <img
                        src={item.product_image || "/placeholder.svg"}
                        alt={item.article_number}
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
                          <h3 className="font-semibold text-lg">{item.product_name || item.article_number}</h3>
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
                        {item.product_condition && (
                          <Badge variant="secondary">{item.product_condition}</Badge>
                        )}
                      </div>

                      {/* Quantity Controls and Price */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium min-w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">CHF {(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">CHF {item.price.toFixed(2)} {t('cart.perItem')}</div>
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
                  <span>{t('cart.subtotal')} ({totalItems} {totalItems !== 1 ? t('cart.items') : t('cart.item')})</span>
                  <span>CHF {subtotal.toFixed(2)}</span>
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
                  <span>CHF {total.toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isUpdating}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {t('cart.checkout')} ({totalItems})
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
