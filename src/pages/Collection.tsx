import { useState } from "react";
import { Search, TrendingUp, Package, Star, Grid3X3, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import TradingCard from "@/components/cards/TradingCard";

// Mock collection data
const collectionStats = {
  totalCards: 1247,
  totalValue: 2847.95,
  totalSets: 12,
  completedSets: 3,
  rarityBreakdown: {
    legendary: 23,
    epic: 89,
    rare: 234,
    common: 901
  }
};

const ownedCards = [
  {
    id: "1",
    name: "Pikachu VMAX",
    series: "Sword & Shield",
    set: "Vivid Voltage",
    number: "043/185",
    rarity: "legendary" as const,
    type: "Electric",
    price: 45.99,
    image: "/placeholder.svg",
    inCollection: true,
    inWishlist: false,
    description: "A powerful Electric-type Pokémon VMAX card",
    acquiredDate: "2024-01-15",
    condition: "Near Mint"
  },
  {
    id: "2",
    name: "Bidoof",
    series: "Sword & Shield",
    set: "Brilliant Stars",
    number: "111/172",
    rarity: "common" as const,
    type: "Normal",
    price: 0.25,
    image: "/placeholder.svg",
    inCollection: true,
    inWishlist: false,
    description: "A Normal-type Pokémon known for its simplicity",
    acquiredDate: "2024-02-20",
    condition: "Mint"
  },
  {
    id: "3",
    name: "Arceus VSTAR",
    series: "Sword & Shield",
    set: "Brilliant Stars",
    number: "123/172",
    rarity: "epic" as const,
    type: "Normal",
    price: 67.50,
    image: "/placeholder.svg",
    inCollection: true,
    inWishlist: false,
    description: "The Alpha Pokémon in VSTAR form",
    acquiredDate: "2024-01-08",
    condition: "Near Mint"
  }
];

const setProgress = [
  {
    id: "1",
    name: "Brilliant Stars",
    series: "Sword & Shield",
    owned: 142,
    total: 172,
    percentage: 82
  },
  {
    id: "2", 
    name: "Fusion Strike",
    series: "Sword & Shield",
    owned: 284,
    total: 284,
    percentage: 100
  },
  {
    id: "3",
    name: "Evolving Skies", 
    series: "Sword & Shield",
    owned: 89,
    total: 237,
    percentage: 38
  }
];

const Collection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "stats">("stats");

  const filteredCards = ownedCards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Meine Sammlung</h1>
        <p className="text-muted-foreground text-lg">
          Übersicht über deine Trading Card Sammlung und deren Wert
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={viewMode === "stats" ? "default" : "outline"}
          onClick={() => setViewMode("stats")}
        >
          <BarChart className="mr-2 h-4 w-4" />
          Statistiken
        </Button>
        <Button
          variant={viewMode === "cards" ? "default" : "outline"}
          onClick={() => setViewMode("cards")}
        >
          <Grid3X3 className="mr-2 h-4 w-4" />
          Karten
        </Button>
      </div>

      {viewMode === "stats" ? (
        <div className="space-y-8">
          {/* Collection Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamte Karten</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.totalCards.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% seit letztem Monat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamtwert</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">CHF {collectionStats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% seit letztem Monat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sets</CardTitle>
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.totalSets}</div>
                <p className="text-xs text-muted-foreground">
                  {collectionStats.completedSets} komplett abgeschlossen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legendäre Karten</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{collectionStats.rarityBreakdown.legendary}</div>
                <p className="text-xs text-muted-foreground">
                  Seltenste Karten in deiner Sammlung
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rarity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Seltenheits-Verteilung</CardTitle>
              <CardDescription>Aufschlüsselung deiner Karten nach Seltenheit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-legendary/10 text-legendary border-legendary">Legendary</Badge>
                    <span>{collectionStats.rarityBreakdown.legendary} Karten</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {((collectionStats.rarityBreakdown.legendary / collectionStats.totalCards) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(collectionStats.rarityBreakdown.legendary / collectionStats.totalCards) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-epic/10 text-epic border-epic">Epic</Badge>
                    <span>{collectionStats.rarityBreakdown.epic} Karten</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {((collectionStats.rarityBreakdown.epic / collectionStats.totalCards) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(collectionStats.rarityBreakdown.epic / collectionStats.totalCards) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-rare/10 text-rare border-rare">Rare</Badge>
                    <span>{collectionStats.rarityBreakdown.rare} Karten</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {((collectionStats.rarityBreakdown.rare / collectionStats.totalCards) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(collectionStats.rarityBreakdown.rare / collectionStats.totalCards) * 100} 
                  className="h-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-common/10 text-common border-common">Common</Badge>
                    <span>{collectionStats.rarityBreakdown.common} Karten</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {((collectionStats.rarityBreakdown.common / collectionStats.totalCards) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={(collectionStats.rarityBreakdown.common / collectionStats.totalCards) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Set Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Set-Fortschritt</CardTitle>
              <CardDescription>Deine Fortschritte beim Sammeln kompletter Sets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {setProgress.map((set) => (
                  <div key={set.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{set.name}</h4>
                        <p className="text-sm text-muted-foreground">{set.series}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{set.owned}/{set.total}</div>
                        <div className="text-sm text-muted-foreground">{set.percentage}%</div>
                      </div>
                    </div>
                    <Progress value={set.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Deine Karten durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map((card) => (
              <div key={card.id} className="relative">
                <TradingCard
                  {...card}
                  onAddToCollection={() => {}}
                  onAddToWishlist={() => {}}
                  onAddToCart={() => {}}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {card.condition}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Karten gefunden</h3>
              <p className="text-muted-foreground">
                Versuche es mit anderen Suchbegriffen.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Collection;