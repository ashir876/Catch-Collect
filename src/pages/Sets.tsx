import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

// Mock sets data
const setsData = [
  {
    id: "1",
    name: "Brilliant Stars",
    series: "Sword & Shield",
    seriesId: "1",
    description: "Featuring Arceus VSTAR and radiant Pokémon",
    cardCount: 216,
    ownedCards: 142,
    releaseDate: "2022-02-25",
    image: "/placeholder.svg",
    price: 89.99,
    isComplete: false
  },
  {
    id: "2",
    name: "Fusion Strike", 
    series: "Sword & Shield",
    seriesId: "1",
    description: "New Fusion Strike Battle Style cards",
    cardCount: 284,
    ownedCards: 284,
    releaseDate: "2021-11-12",
    image: "/placeholder.svg",
    price: 94.99,
    isComplete: true
  },
  {
    id: "3",
    name: "Evolving Skies",
    series: "Sword & Shield", 
    seriesId: "1",
    description: "Featuring Rayquaza VMAX and Eeveelutions",
    cardCount: 237,
    ownedCards: 89,
    releaseDate: "2021-08-27",
    image: "/placeholder.svg",
    price: 119.99,
    isComplete: false
  },
  {
    id: "4",
    name: "Ultra Prism",
    series: "Sun & Moon",
    seriesId: "2", 
    description: "Featuring Necrozma and Ultra Beasts",
    cardCount: 173,
    ownedCards: 45,
    releaseDate: "2018-02-02",
    image: "/placeholder.svg",
    price: 79.99,
    isComplete: false
  }
];

const Sets = () => {
  const [searchParams] = useSearchParams();
  const seriesFilter = searchParams.get("series");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  let filteredSets = setsData.filter(set => {
    const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeries = !seriesFilter || set.seriesId === seriesFilter;
    return matchesSearch && matchesSeries;
  });

  // Sort sets
  filteredSets = filteredSets.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case "oldest":
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "completion":
        return (b.ownedCards / b.cardCount) - (a.ownedCards / a.cardCount);
      default:
        return 0;
    }
  });

  const getCompletionPercentage = (owned: number, total: number) => {
    return Math.round((owned / total) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Sets</h1>
        <p className="text-muted-foreground text-lg">
          Durchstöbere alle verfügbaren Kartensets und verfolge deinen Sammelfortschritt
        </p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Set suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            onClick={() => setSortBy("newest")}
            size="sm"
          >
            Neueste
          </Button>
          <Button
            variant={sortBy === "completion" ? "default" : "outline"}
            onClick={() => setSortBy("completion")}
            size="sm"
          >
            Fortschritt
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => setSortBy("name")}
            size="sm"
          >
            Name
          </Button>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSets.map((set) => {
          const completionPercentage = getCompletionPercentage(set.ownedCards, set.cardCount);
          
          return (
            <Card key={set.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">
                      {set.series}
                    </Badge>
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {set.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {set.description}
                    </CardDescription>
                  </div>
                  {set.isComplete && (
                    <Badge className="bg-success/10 text-success border-success">
                      Komplett
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Collection Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fortschritt:</span>
                      <span className="font-medium">
                        {set.ownedCards}/{set.cardCount} ({completionPercentage}%)
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>

                  {/* Set Info */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Release:</span>
                      <span className="font-medium">
                        {new Date(set.releaseDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Set-Preis:</span>
                      <span className="font-medium text-primary">
                        CHF {set.price}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link to={`/cards?set=${set.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Package className="mr-2 h-4 w-4" />
                        Karten
                      </Button>
                    </Link>
                    <Button className="flex-1" size="sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Set kaufen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredSets.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Sets gefunden</h3>
          <p className="text-muted-foreground">
            Versuche es mit anderen Suchbegriffen oder wähle eine andere Serie.
          </p>
        </div>
      )}
    </div>
  );
};

export default Sets;