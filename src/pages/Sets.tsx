import { useState, useEffect } from "react";
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
import LanguageFilter from "@/components/LanguageFilter";

const Sets = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const seriesFilter = searchParams.get("series");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 items per page

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch sets data with pagination and language filter
  const { data: setsData, isLoading, error } = useSetsData({
    seriesId: seriesFilter || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined
  });

  // Fetch total count for pagination with language filter
  const { data: totalCount = 0 } = useSetsCount({
    seriesId: seriesFilter || undefined,
    language: languageFilter === "all" ? undefined : languageFilter,
    searchTerm: searchTerm || undefined
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Reset to first page when filters change
  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleLanguageFilterChange = (newLanguageFilter: string) => {
    setLanguageFilter(newLanguageFilter);
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
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-8 uppercase tracking-wider">
            <span className="bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
              {t('sets.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('sets.subtitle')}
          </p>
        </div>

      {/* Search, Filters and Sort */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
            <Input
              placeholder={t('sets.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
            />
          </div>
          {/* <div className="flex gap-2">
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
          </div> */}
        </div>
        
        {/* Language Filter */}
        <LanguageFilter
          selectedLanguage={languageFilter}
          onLanguageChange={handleLanguageFilterChange}
          className="mb-4"
        />
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
            const cardCount = set.total || 0;
            const ownedCards = Math.floor(Math.random() * cardCount); // Mock data
            const completionPercentage = getCompletionPercentage(ownedCards, cardCount);
            const isComplete = ownedCards === cardCount && cardCount > 0;
            
            return (
              <Card key={set.set_id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                {/* Set Logo/Image Section */}
                {(set.logo_url || set.symbol_url) && (
                  <div className="h-48 bg-white flex items-center justify-center p-4 overflow-hidden border-b-2 border-gray-200">
                    {set.logo_url ? (
                      <img 
                        src={set.logo_url} 
                        alt={set.name || 'Set Logo'} 
                        className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : set.symbol_url ? (
                      <img 
                        src={set.symbol_url} 
                        alt={set.name || 'Set Symbol'} 
                        className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : null}
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-2">
                        {set.series_name || t('sets.unknownSeries')}
                      </Badge>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {set.name || t('sets.unknownSet')}
                      </CardTitle>
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