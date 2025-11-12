
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ShoppingCart,
  FileDown,
  Clipboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrdersData } from "@/hooks/useOrdersData";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";

const Orders = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useOrdersData();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'invoices') {
      setActiveTab('invoices');
    } else if (action === 'delivery-notes') {
      setActiveTab('delivery-notes');
    } else {
      setActiveTab('orders');
    }
  }, [searchParams]);

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

  const handleBulkDownloadInvoices = () => {
    toast({
      title: t('orders.bulkDownload'),
      description: t('orders.preparingInvoices'),
    });
    
  };

  const handleViewDeliveryNote = (orderId: string) => {
    toast({
      title: t('orders.deliveryNote'),
      description: `${t('orders.viewingDeliveryNote')} ${orderId}`,
    });
  };

  const handleDownloadDeliveryNote = (orderId: string) => {
    toast({
      title: t('orders.deliveryNote'),
      description: `${t('orders.downloadingDeliveryNote')} ${orderId}`,
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
        {}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
            <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {t('orders.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {orders.length} {orders.length !== 1 ? t('orders.orders') : t('orders.order')}
          </p>
        </div>

        {}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders" className="pixel-nav-item">
              <Package className="w-4 h-4 mr-2" />
              {t('orders.allOrders', 'All Orders')}
            </TabsTrigger>
            <TabsTrigger value="invoices" className="pixel-nav-item">
              <FileDown className="w-4 h-4 mr-2" />
              {t('orders.invoices', 'Invoices')}
            </TabsTrigger>
            <TabsTrigger value="delivery-notes" className="pixel-nav-item">
              <Truck className="w-4 h-4 mr-2" />
              {t('orders.deliveryNotes', 'Delivery Notes')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {}
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

            {}
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
                      {}
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

                      {}
                      {statusInfo.description && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <StatusIcon className="h-4 w-4 inline mr-2" />
                            {statusInfo.description}
                          </p>
                        </div>
                      )}

                      {}
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

            {}
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
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            {}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileDown className="w-5 h-5" />
                    {t('orders.invoicesTitle', 'Invoices & Documents')}
                  </CardTitle>
                  <Button onClick={handleBulkDownloadInvoices} className="pixel-button">
                    <Download className="w-4 h-4 mr-2" />
                    {t('orders.downloadAll', 'Download All')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('orders.invoicesDescription', 'Download invoices and receipts for all your orders.')}
                </p>
              </CardContent>
            </Card>

            {}
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={`invoice-${order.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {t('orders.invoice')} #{order.article_number}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()} • CHF {order.total.toFixed(2)}
                        </p>
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
                          {t('orders.download')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {}
            {orders.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t('orders.noInvoices', 'No Invoices Available')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('orders.noInvoicesDescription', 'Invoices will appear here once you place your first order.')}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delivery-notes" className="space-y-4">
            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t('orders.deliveryNotesTitle', 'Delivery Notes & Tracking')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {t('orders.deliveryNotesDescription', 'View delivery notes and tracking information for shipped orders.')}
                </p>
              </CardContent>
            </Card>

            {}
            <div className="space-y-4">
              {orders.filter(order => order.status === 'shipped' || order.status === 'delivered').map((order) => (
                <Card key={`delivery-${order.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {t('orders.order')} #{order.article_number}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'delivered' ? t('orders.delivered') : t('orders.shipped')} • 
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDeliveryNote(order.article_number)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('orders.viewNote', 'View Note')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadDeliveryNote(order.article_number)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t('orders.download')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTrackOrder(order.article_number)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          {t('orders.track')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {}
            {orders.filter(order => order.status === 'shipped' || order.status === 'delivered').length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t('orders.noDeliveries', 'No Shipped Orders')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('orders.noDeliveriesDescription', 'Delivery notes will appear here once your orders are shipped.')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
