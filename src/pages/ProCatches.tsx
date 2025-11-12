import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ShoppingCart, Star, Sparkles, Crown, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProCatches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("price-desc");

  const proCatches = [
    {
      id: 1,
      name: "Black Lotus Alpha",
      category: "Magic: The Gathering",
      price: 25000,
      condition: "Near Mint",
      rarity: "Mythic",
      year: 1993,
      description: "Extremst seltene Alpha Black Lotus in nahezu perfektem Zustand",
      image: "/placeholder.svg",
      inStock: true,
      certified: true,
    },
    {
      id: 2,
      name: "Charizard 1st Edition Base Set",
      category: "Pokémon",
      price: 15000,
      condition: "Mint",
      rarity: "Holo Rare",
      year: 1998,
      description: "PSA 10 bewertete 1st Edition Charizard aus dem Base Set",
      image: "/placeholder.svg",
      inStock: true,
      certified: true,
    },
    {
      id: 3,
      name: "Blue-Eyes White Dragon LOB-001",
      category: "Yu-Gi-Oh!",
      price: 8500,
      condition: "Near Mint",
      rarity: "Ultra Rare",
      year: 2002,
      description: "1st Edition Blue-Eyes White Dragon aus Legend of Blue Eyes",
      image: "/placeholder.svg",
      inStock: false,
      certified: true,
    },
    {
      id: 4,
      name: "Time Walk Beta",
      category: "Magic: The Gathering",
      price: 12000,
      condition: "Lightly Played",
      rarity: "Rare",
      year: 1993,
      description: "Beta Time Walk aus der originalen Magic Edition",
      image: "/placeholder.svg",
      inStock: true,
      certified: false,
    },
    {
      id: 5,
      name: "Pikachu Illustrator Promo",
      category: "Pokémon",
      price: 45000,
      condition: "Mint",
      rarity: "Promo",
      year: 1998,
      description: "Extrem seltene Pikachu Illustrator Promo Karte",
      image: "/placeholder.svg",
      inStock: false,
      certified: true,
    },
    {
      id: 6,
      name: "Exodia the Forbidden One Set",
      category: "Yu-Gi-Oh!",
      price: 3500,
      condition: "Near Mint",
      rarity: "Ultra Rare",
      year: 2002,
      description: "Komplettes Exodia Set in ausgezeichnetem Zustand",
      image: "/placeholder.svg",
      inStock: true,
      certified: false,
    },
  ];

  const filteredCatches = proCatches
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "year":
          return b.year - a.year;
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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Mythic":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      case "Ultra Rare":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "Holo Rare":
        return "bg-gradient-to-r from-blue-500 to-purple-500";
      case "Promo":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              PRO Catches
            </h1>
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie die seltensten und wertvollsten Sammelkarten der Welt. 
            Nur für echte Sammler und Investoren.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Alle Artikel sind authentifiziert und professionell bewertet</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        {}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Suchen Sie nach seltenen Karten..."
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
                  <SelectItem value="price-desc">Preis (hoch zu niedrig)</SelectItem>
                  <SelectItem value="price-asc">Preis (niedrig zu hoch)</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="year">Jahr</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatches.map((item) => (
            <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {item.certified && (
                    <Badge className="bg-green-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Zertifiziert
                    </Badge>
                  )}
                  <Badge className={`text-white ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </Badge>
                </div>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Ausverkauft</Badge>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <CardDescription>{item.category} • {item.year}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      CHF {item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Zustand:</span>
                  <span className="font-medium">{item.condition}</span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    disabled={!item.inStock}
                    onClick={() => handleAddToCart(item.name)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {item.inStock ? "In den Warenkorb" : "Ausverkauft"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleAddToWishlist(item.name)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                {!item.inStock && (
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Benachrichtigung anfordern
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCatches.length === 0 && (
          <div className="text-center py-12">
            <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Keine PRO Catches gefunden
            </h3>
            <p className="text-muted-foreground">
              Versuchen Sie einen anderen Suchbegriff oder schauen Sie später wieder vorbei.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProCatches;