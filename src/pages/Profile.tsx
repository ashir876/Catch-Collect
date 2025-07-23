import { useState } from "react";
import { User, Mail, Calendar, Trophy, Star, Package, Heart, ShoppingCart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock user data
const userData = {
  id: "1",
  name: "Max Mustermann",
  email: "max.mustermann@example.com",
  memberSince: "2023-06-15",
  avatar: "/placeholder.svg",
  customerCategory: "Shining",
  loyaltyPoints: 247,
  stats: {
    totalCards: 1247,
    totalValue: 2847.95,
    setsCompleted: 3,
    wishlistItems: 12,
    ordersPlaced: 8
  }
};

const recentActivity = [
  {
    id: "1",
    type: "purchase",
    description: "Pikachu VMAX gekauft",
    date: "2024-03-10",
    value: 45.99
  },
  {
    id: "2", 
    type: "wishlist",
    description: "Charizard V zur Wunschliste hinzugefügt",
    date: "2024-03-08",
    value: null
  },
  {
    id: "3",
    type: "collection",
    description: "Set 'Brilliant Stars' zu 85% abgeschlossen",
    date: "2024-03-05",
    value: null
  }
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Promo":
        return "secondary";
      case "Rare":
        return "default";
      case "Epic":
        return "destructive";
      case "Shining":
        return "default";
      default:
        return "secondary";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="h-4 w-4" />;
      case "wishlist":
        return <Heart className="h-4 w-4" />;
      case "collection":
        return <Package className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Mein Profil</h1>
        <p className="text-muted-foreground text-lg">
          Verwalte dein Konto und verfolge deine Sammelfortschritte
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-lg">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <Badge variant={getCategoryColor(userData.customerCategory)} className="text-sm">
                      {userData.customerCategory} Collector
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{userData.email}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Mitglied seit {new Date(userData.memberSince).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Karten</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">in deiner Sammlung</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sammlungswert</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF {userData.stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">geschätzter Wert</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sets komplett</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.setsCompleted}</div>
                <p className="text-xs text-muted-foreground">vollständige Sets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wunschliste</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.stats.wishlistItems}</div>
                <p className="text-xs text-muted-foreground">gewünschte Karten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treuepunkte</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.loyaltyPoints}</div>
                <p className="text-xs text-muted-foreground">Punkte gesammelt</p>
              </CardContent>
            </Card>
          </div>

          {/* Loyalty Program */}
          <Card>
            <CardHeader>
              <CardTitle>Treueprogramm</CardTitle>
              <CardDescription>
                Sammle Punkte bei jedem Kauf (CHF 10 = 1 Punkt) und steige in höhere Kategorien auf
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Aktuelle Kategorie:</span>
                  <Badge variant={getCategoryColor(userData.customerCategory)}>
                    {userData.customerCategory} Collector
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Aktuelle Punkte:</span>
                  <span className="font-bold">{userData.loyaltyPoints} Punkte</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bis zur nächsten Kategorie:</span>
                    <span>53 Punkte</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Informationen</CardTitle>
              <CardDescription>
                Aktualisiere deine Kontoinformationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>Speichern</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Abbrechen
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Letzte Aktivitäten</CardTitle>
              <CardDescription>
                Deine letzten Aktionen und Transaktionen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    {activity.value && (
                      <Badge variant="secondary">
                        CHF {activity.value}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;