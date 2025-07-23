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

const AdminDashboard = () => {
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
      title: "Karte hinzugefügt",
      description: `${newCard.name} wurde erfolgreich hinzugefügt.`,
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
      title: "Rechnung erstellt",
      description: `Rechnung für Bestellung ${orderId} wurde erstellt und versendet.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="secondary">Administrator</Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CHF 12,847</div>
              <p className="text-xs text-muted-foreground">
                +8.2% seit letztem Monat
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bestellungen</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">
                +12 neue heute
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kunden</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,483</div>
              <p className="text-xs text-muted-foreground">
                +23 neue diese Woche
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Karten im Lager</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,942</div>
              <p className="text-xs text-muted-foreground">
                247 verschiedene Karten
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Bestellungen</TabsTrigger>
            <TabsTrigger value="cards">Karten verwalten</TabsTrigger>
            <TabsTrigger value="customers">Kunden</TabsTrigger>
            <TabsTrigger value="inventory">Inventar</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle Bestellungen</CardTitle>
                <CardDescription>Verwalten Sie Bestellungen und erstellen Sie Rechnungen</CardDescription>
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
                            {order.status}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateInvoice(order.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Rechnung
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
                <CardTitle>Neue Karte hinzufügen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Kartenname</Label>
                    <Input 
                      id="cardName"
                      value={newCard.name}
                      onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                      placeholder="z.B. Pikachu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="series">Serie</Label>
                    <Input 
                      id="series"
                      value={newCard.series}
                      onChange={(e) => setNewCard({...newCard, series: e.target.value})}
                      placeholder="z.B. Base Set"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="set">Set</Label>
                    <Input 
                      id="set"
                      value={newCard.set}
                      onChange={(e) => setNewCard({...newCard, set: e.target.value})}
                      placeholder="z.B. 1st Edition"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preis (CHF)</Label>
                    <Input 
                      id="price"
                      type="number"
                      value={newCard.price}
                      onChange={(e) => setNewCard({...newCard, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Lagerbestand</Label>
                    <Input 
                      id="stock"
                      type="number"
                      value={newCard.stock}
                      onChange={(e) => setNewCard({...newCard, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rarity">Seltenheit</Label>
                    <select 
                      id="rarity"
                      value={newCard.rarity}
                      onChange={(e) => setNewCard({...newCard, rarity: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Common">Common</option>
                      <option value="Uncommon">Uncommon</option>
                      <option value="Rare">Rare</option>
                      <option value="Holo Rare">Holo Rare</option>
                      <option value="Ultra Rare">Ultra Rare</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea 
                    id="description"
                    value={newCard.description}
                    onChange={(e) => setNewCard({...newCard, description: e.target.value})}
                    placeholder="Kartenbeschreibung..."
                  />
                </div>
                <Button onClick={handleAddCard} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Karte hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kundenverwaltung</CardTitle>
                <CardDescription>Verwalten Sie Kundenkonten und Tier-Status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-sm text-muted-foreground">{customer.orders} Bestellungen</p>
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
                <CardTitle>Inventar Übersicht</CardTitle>
                <CardDescription>Lagerbestand und niedrige Bestände</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Inventar-Management wird hier angezeigt
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