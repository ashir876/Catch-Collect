import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  TrendingUp,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [newCard, setNewCard] = useState({
    name: "",
    series: "",
    set: "",
    price: "",
    rarity: "Common",
    stock: "",
    description: ""
  });

  const mockOrders = [
    { id: "ORD-001", customer: "Max Mustermann", total: 89.50, status: "pending", date: "2024-01-15" },
    { id: "ORD-002", customer: "Anna Schmidt", total: 156.20, status: "paid", date: "2024-01-14" },
    { id: "ORD-003", customer: "Peter Weber", total: 45.90, status: "shipped", date: "2024-01-13" },
  ];

  const mockCustomers = [
    { id: 1, name: "Max Mustermann", email: "max@example.com", tier: "Shining", orders: 15 },
    { id: 2, name: "Anna Schmidt", email: "anna@example.com", tier: "Rare", orders: 8 },
    { id: 3, name: "Peter Weber", email: "peter@example.com", tier: "Uncommon", orders: 3 },
  ];

  const handleAddCard = () => {
    toast({
      title: t('admin.cardAdded'),
      description: t('admin.cardAddedDescription', { name: newCard.name }),
    });
    setNewCard({
      name: "",
      series: "",
      set: "",
      price: "",
      rarity: "Common",
      stock: "",
      description: ""
    });
  };

  const handleGenerateInvoice = (orderId: string) => {
    toast({
      title: t('admin.invoiceCreated'),
      description: t('admin.invoiceCreatedDescription', { orderId }),
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
          <Badge variant="secondary">{t('admin.administrator')}</Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CHF 12,847</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.revenueGrowth')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.orders')}</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.newOrdersToday')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.customers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,483</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.newCustomersThisWeek')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.cardsInStock')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,942</div>
              <p className="text-xs text-muted-foreground">
                {t('admin.differentCards')}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">{t('admin.orders')}</TabsTrigger>
            <TabsTrigger value="cards">{t('admin.manageCards')}</TabsTrigger>
            <TabsTrigger value="customers">{t('admin.customers')}</TabsTrigger>
            <TabsTrigger value="inventory">{t('admin.inventory')}</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.currentOrders')}</CardTitle>
                <CardDescription>{t('admin.ordersDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">CHF {order.total.toFixed(2)}</p>
                          <Badge variant={
                            order.status === 'paid' ? 'default' : 
                            order.status === 'shipped' ? 'secondary' : 'outline'
                          }>
                            {t(`admin.orderStatus.${order.status}`)}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateInvoice(order.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {t('admin.invoice')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.addNewCard')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">{t('admin.cardName')}</Label>
                    <Input 
                      id="cardName"
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder={t('admin.cardNamePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="series">{t('admin.series')}</Label>
                    <Input 
                      id="series"
                      value={newCard.series}
                      onChange={(e) => setNewCard({...newCard, series: e.target.value})}
                      placeholder={t('admin.seriesPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set">{t('admin.set')}</Label>
                    <Input 
                      id="set"
                      value={newCard.set}
                      onChange={(e) => setNewCard({...newCard, set: e.target.value})}
                      placeholder={t('admin.setPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('admin.price')}</Label>
                    <Input 
                      id="price"
                      type="number"
                      value={newCard.price}
                      onChange={(e) => setNewCard({...newCard, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">{t('admin.stock')}</Label>
                    <Input 
                      id="stock"
                      type="number"
                      value={newCard.stock}
                      onChange={(e) => setNewCard({...newCard, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rarity">{t('admin.rarity')}</Label>
                    <select 
                      id="rarity"
                      value={newCard.rarity}
                      onChange={(e) => setNewCard({...newCard, rarity: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Common">{t('admin.rarityCommon')}</option>
                      <option value="Uncommon">{t('admin.rarityUncommon')}</option>
                      <option value="Rare">{t('admin.rarityRare')}</option>
                      <option value="Holo Rare">{t('admin.rarityHoloRare')}</option>
                      <option value="Ultra Rare">{t('admin.rarityUltraRare')}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('admin.description')}</Label>
                  <Textarea 
                    id="description"
                    value={newCard.description}
                    onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                    placeholder={t('admin.cardDescription')}
                  />
                </div>
                <Button onClick={handleAddCard} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.addCard')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.customerManagement')}</CardTitle>
                <CardDescription>{t('admin.customerManagementDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">{t('admin.orderCount', { count: customer.orders })}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{customer.tier}</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.inventoryOverview')}</CardTitle>
                <CardDescription>{t('admin.inventoryDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {t('admin.inventoryManagementPlaceholder')}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;