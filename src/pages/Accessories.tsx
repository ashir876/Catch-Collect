import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Package, Shield, Gamepad2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Accessories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const accessories = [
    // Schutzhüllen & Sleeves
    {
      id: 1,
      name: "Ultra Pro Deck Protector Sleeves (100 Stück)",
      category: "sleeves",
      price: 12.90,
      description: "Hochwertige Kartenhüllen für optimalen Schutz Ihrer wertvollen Karten",
      image: "/placeholder.svg",
      rating: 4.8,
      inStock: true,
      brand: "Ultra Pro"
    },
    {
      id: 2,
      name: "Dragon Shield Matte Sleeves (100 Stück)",
      category: "sleeves",
      price: 15.50,
      description: "Premium matte Sleeves mit Anti-Glare Beschichtung",
      image: "/placeholder.svg",
      rating: 4.9,
      inStock: true,
      brand: "Dragon Shield"
    },
    {
      id: 3,
      name: "KMC Perfect Fit Sleeves (100 Stück)",
      category: "sleeves",
      price: 8.90,
      description: "Perfekt sitzende Inner Sleeves für maximalen Schutz",
      image: "/placeholder.svg",
      rating: 4.7,
      inStock: true,
      brand: "KMC"
    },

    // Sammelmappen & Binder
    {
      id: 4,
      name: "Ultra Pro 9-Pocket Binder",
      category: "binders",
      price: 24.90,
      description: "Hochwertiger Sammelordner mit 20 Seiten für 360 Karten",
      image: "/placeholder.svg",
      rating: 4.6,
      inStock: true,
      brand: "Ultra Pro"
    },
    {
      id: 5,
      name: "BCW Z-Folio 12-Pocket Binder",
      category: "binders",
      price: 32.50,
      description: "Luxus Sammelmappe mit 12 Taschen pro Seite, 480 Karten Kapazität",
      image: "/placeholder.svg",
      rating: 4.8,
      inStock: true,
      brand: "BCW"
    },
    {
      id: 6,
      name: "Vault X 4-Pocket Binder",
      category: "binders",
      price: 18.90,
      description: "Kompakter 4-Pocket Binder für kleinere Sammlungen",
      image: "/placeholder.svg",
      rating: 4.5,
      inStock: false,
      brand: "Vault X"
    },

    // Aufbewahrungsboxen
    {
      id: 7,
      name: "BCW Storage Box 800ct",
      category: "storage",
      price: 6.90,
      description: "Stabile Aufbewahrungsbox für bis zu 800 Karten",
      image: "/placeholder.svg",
      rating: 4.4,
      inStock: true,
      brand: "BCW"
    },
    {
      id: 8,
      name: "Ultimate Guard Deck Box",
      category: "storage",
      price: 14.90,
      description: "Premium Deck Box mit Magnetverschluss für 100+ Karten",
      image: "/placeholder.svg",
      rating: 4.7,
      inStock: true,
      brand: "Ultimate Guard"
    },
    {
      id: 9,
      name: "Ultra Pro Satin Tower Deck Box",
      category: "storage",
      price: 19.90,
      description: "Deck Box mit integriertem Würfelfach und Kartentrenner",
      image: "/placeholder.svg",
      rating: 4.6,
      inStock: true,
      brand: "Ultra Pro"
    },

    // Spielmatten & Zubehör
    {
      id: 10,
      name: "Playmat Pokémon Design",
      category: "playmats",
      price: 29.90,
      description: "Offizielle Pokémon Spielmatte mit rutschfester Unterseite",
      image: "/placeholder.svg",
      rating: 4.8,
      inStock: true,
      brand: "Pokémon"
    },
    {
      id: 11,
      name: "Magic: The Gathering Playmat",
      category: "playmats",
      price: 25.90,
      description: "Offizielle MTG Spielmatte mit hochwertigem Druck",
      image: "/placeholder.svg",
      rating: 4.7,
      inStock: true,
      brand: "Wizards of the Coast"
    },
    {
      id: 12,
      name: "6-Seitige Würfel Set (10 Stück)",
      category: "dice",
      price: 12.50,
      description: "Hochwertige Würfel Set für Kartenspiele",
      image: "/placeholder.svg",
      rating: 4.5,
      inStock: true,
      brand: "Chessex"
    },
  ];

  const categories = {
    all: "Alle",
    sleeves: "Schutzhüllen",
    binders: "Sammelmappen",
    storage: "Aufbewahrung",
    playmats: "Spielmatten",
    dice: "Würfel & Zubehör"
  };

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAccessories = accessories
    .filter(item => 
      (selectedCategory === "all" || item.category === selectedCategory) &&
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleAddToCart = (itemName: string) => {
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${itemName} wurde zum Warenkorb hinzugefügt.`,
    });
  };

  const handleAddToWishlist = (itemName: string) => {
    toast({
      title: "Zur Wunschliste hinzugefügt",
      description: `${itemName} wurde zur Wunschliste hinzugefügt.`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Zubehör</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schützen und organisieren Sie Ihre Sammlung mit hochwertigem Zubehör. 
            Von Schutzhüllen bis hin zu Aufbewahrungsboxen - alles für den perfekten Schutz Ihrer Karten.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Suchen Sie nach Zubehör..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-asc">Preis (niedrig zu hoch)</SelectItem>
                  <SelectItem value="price-desc">Preis (hoch zu niedrig)</SelectItem>
                  <SelectItem value="rating">Bewertung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(categories).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAccessories.map((item) => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                    />
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                        <Badge variant="destructive">Ausverkauft</Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.brand}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground ml-1">{item.rating}</span>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        CHF {item.price.toFixed(2)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        disabled={!item.inStock}
                        onClick={() => handleAddToCart(item.name)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {item.inStock ? "Kaufen" : "Ausverkauft"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddToWishlist(item.name)}
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAccessories.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Kein Zubehör gefunden
                </h3>
                <p className="text-muted-foreground">
                  Versuchen Sie einen anderen Suchbegriff oder wählen Sie eine andere Kategorie.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Accessories;