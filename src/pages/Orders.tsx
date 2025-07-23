
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Search,
  Calendar,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrdersData } from "@/hooks/useOrdersData";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useState } from "react";

const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrdersData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { 
          label: t('orders.pending'), 
          color: "bg-yellow-500", 
          icon: Clock,
          description: t('orders.pendingDescription')
        };
      case "processing":
        return { 
          label: t('orders.processing'), 
          color: "bg-blue-500", 
          icon: Package,
          description: t('orders.processingDescription')
        };
      case "shipped":
        return { 
          label: t('orders.shipped'), 
          color: "bg-purple-500", 
          icon: Truck,
          description: t('orders.shippedDescription')
        };
      case "delivered":
        return { 
          label: t('orders.delivered'), 
          color: "bg-green-500", 
          icon: CheckCircle,
          description: t('orders.deliveredDescription')
        };
      default:
        return { 
          label: t('orders.unknown'), 
          color: "bg-gray-500", 
          icon: Clock,
          description: ""
        };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.article_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.order_items && order.order_items.some((item: any) => 
                           item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadInvoice = (orderId: string) => {
    toast({
      title: t('orders.downloadInvoice'),
      description: `${t('orders.invoiceFor')} ${orderId} ${t('orders.downloading')}.`,
    });
  };

  const handleViewInvoice = (orderId: string) => {
    toast({
      title: t('orders.viewInvoice'),
      description: `${t('orders.invoiceFor')} ${orderId} ${t('orders.opening')}.`,
    });
  };

  const handleTrackOrder = (orderNumber: string) => {
    toast({
      title: t('orders.trackOrder'),
      description: `${t('orders.trackingNumber')}: ${orderNumber}`,
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold mb-4">{t('auth.loginRequired')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('orders.loginRequiredDescription')}
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
          <div className="text-sm text-muted-foreground">
            {orders.length} {orders.length !== 1 ? t('orders.orders') : t('orders.order')}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('orders.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('orders.filterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('orders.pending')}</SelectItem>
                  <SelectItem value="processing">{t('orders.processing')}</SelectItem>
                  <SelectItem value="shipped">{t('orders.shipped')}</SelectItem>
                  <SelectItem value="delivered">{t('orders.delivered')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <CardTitle className="text-lg">{order.article_number}</CardTitle>
                        <Badge className={`${statusInfo.color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <span>CHF {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewInvoice(order.article_number)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('orders.view')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.article_number)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('orders.invoice')}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">{t('orders.orderedItems')}:</h4>
                    <div className="space-y-1">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
                            <span>{item.quantity}x {item.product_name}</span>
                            <span className="font-medium">CHF {(item.product_price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">{t('orders.noItems')}</div>
                      )}
                    </div>
                  </div>

                  {/* Status Description */}
                  {statusInfo.description && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <StatusIcon className="h-4 w-4 inline mr-2" />
                        {statusInfo.description}
                      </p>
                    </div>
                  )}

                  {/* Track Order Button */}
                  {(order.status === 'shipped' || order.status === 'delivered') && (
                    <div className="pt-2">
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary"
                        onClick={() => handleTrackOrder(order.article_number)}
                      >
                        {t('orders.trackShipment')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? t('orders.noOrdersFound') : t('orders.noOrders')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== "all" 
                ? t('orders.tryDifferentCriteria')
                : t('orders.noOrdersDescription')}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Link to="/shop">
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {t('orders.startShopping')}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
