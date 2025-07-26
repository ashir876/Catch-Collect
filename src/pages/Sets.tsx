import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useSetsData, useSetsCount } from "@/hooks/useSetsData";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";

const Sets = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const seriesFilter = searchParams.get("series");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 items per page

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch sets data with pagination
  const { data: setsData, isLoading, error } = useSetsData({
    language: 'en',
    seriesId: seriesFilter || undefined,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined
  });

  // Fetch total count for pagination
  const { data: totalCount = 0 } = useSetsCount({
    language: 'en',
    seriesId: seriesFilter || undefined,
    searchTerm: searchTerm || undefined
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // Sort sets (client-side sorting since we can't sort in the database query easily)
  const sortedSets = setsData?.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
      case "oldest":
        return new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
      case "name":
        return (a.name || '').localeCompare(b.name || '');
      default:
        return 0;
    }
  }) || [];

  const getCompletionPercentage = (owned: number, total: number) => {
    return Math.round((owned / total) * 100);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('sets.loadError')}</h2>
          <p className="text-muted-foreground">{t('sets.loadErrorSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('sets.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('sets.subtitle')}
        </p>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('sets.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "newest" ? "default" : "outline"}
            onClick={() => handleSortChange("newest")}
            size="sm"
          >
            {t('sets.newest')}
          </Button>
          <Button
            variant={sortBy === "oldest" ? "default" : "outline"}
            onClick={() => handleSortChange("oldest")}
            size="sm"
          >
            {t('sets.oldest')}
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => handleSortChange("name")}
            size="sm"
          >
            {t('sets.name')}
          </Button>
        </div>
      </div>

      {/* Pagination Info */}
      {totalCount > 0 && (
        <div className="mb-4">
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Sets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSets.map((set) => {
            // Mock completion data for now - this would come from user's collection
            const cardCount = set.card_count || 0;
            const ownedCards = Math.floor(Math.random() * cardCount); // Mock data
            const completionPercentage = getCompletionPercentage(ownedCards, cardCount);
            const isComplete = ownedCards === cardCount && cardCount > 0;
            
            return (
              <Card key={set.set_id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {set.series_name || t('sets.unknownSeries')}
                      </Badge>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {set.name || t('sets.unknownSet')}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {set.description || t('sets.noDescription')}
                      </CardDescription>
                    </div>
                    {isComplete && (
                      <Badge className="bg-success/10 text-success border-success">
                        {t('sets.complete')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Collection Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('sets.progress')}:</span>
                        <span className="font-medium">
                          {ownedCards}/{cardCount} ({completionPercentage}%)
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>

                    {/* Set Info */}
                    <div className="space-y-2">
                      {set.release_date && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t('sets.release')}:</span>
                          <span className="font-medium">
                            {new Date(set.release_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('sets.cardCount')}:</span>
                        <span className="font-medium text-primary">
                          {cardCount}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/cards?set=${set.set_id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <Package className="mr-2 h-4 w-4" />
                          {t('sets.cards')}
                        </Button>
                      </Link>
                      <Button className="flex-1" size="sm">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        {t('sets.buySet')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedSets.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t('sets.noSetsFound')}</h3>
          <p className="text-muted-foreground">
            {t('sets.noSetsFoundSubtitle')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Sets;