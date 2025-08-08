import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useSetsData, useSetsCount } from "@/hooks/useSetsData";
import { useSeriesData } from "@/hooks/useSeriesData";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import LanguageFilter from "@/components/LanguageFilter";

const Sets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seriesFilter = searchParams.get("series");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 items per page

  // Fetch series data for filter
  const { data: seriesData = [] } = useSeriesData({ language: 'de' });

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

  const handleSeriesFilterChange = (seriesId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (seriesId) {
      newSearchParams.set("series", seriesId);
    } else {
      newSearchParams.delete("series");
    }
    navigate(`?${newSearchParams.toString()}`);
    setCurrentPage(1);
  };



  // Sort sets (client-side sorting since we can't sort in the database query easily)
  const sortedSets = setsData?.slice().sort((a, b) => {
    let primary = 0;
    switch (sortBy) {
      case "newest":
        primary = new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
        break;
      case "oldest":
        primary = new Date(a.release_date || 0).getTime() - new Date(b.release_date || 0).getTime();
        break;
      case "name":
        primary = (a.name || '').localeCompare(b.name || '');
        break;
      default:
        primary = 0;
    }
    if (primary !== 0) return primary;
    // Secondary sort by unique set_id
    return (a.set_id || '').localeCompare(b.set_id || '');
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

      {/* Series Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {t('sets.filterBySeries')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!seriesFilter ? "default" : "outline"}
            onClick={() => handleSeriesFilterChange(null)}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {t('common.all')}
          </Button>
          {seriesData.map((series) => (
            <Button
              key={series.series_id}
              variant={seriesFilter === series.series_id ? "default" : "outline"}
              onClick={() => handleSeriesFilterChange(series.series_id)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {series.series_name}
            </Button>
          ))}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="border-4 border-black animate-pulse h-80 flex flex-col">
              <div className="h-48 bg-muted flex-shrink-0"></div>
              <CardHeader className="flex-1 p-4">
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedSets.map((set) => {
            return (
              <Card key={set.set_id} className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer group h-80 flex flex-col">
                <div className="h-40 bg-white flex items-center justify-center p-3 overflow-hidden flex-shrink-0">
                  {set.logo_url ? (
                    <img
                      src={set.logo_url}
                      alt={set.name || 'Set Logo'}
                      className="max-h-28 max-w-28 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : set.symbol_url ? (
                    <img
                      src={set.symbol_url}
                      alt={set.name || 'Set Symbol'}
                      className="max-h-28 max-w-28 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-black font-black text-2xl text-center group-hover:scale-110 transition-transform duration-300">
                      {set.name}
                    </div>
                  )}
                </div>
                <CardHeader className="bg-background flex-1 flex flex-col justify-center p-4">
                  <CardTitle className="font-black text-lg uppercase tracking-wide line-clamp-2">
                    {set.name || t('sets.unknownSet')}
                  </CardTitle>
                  <CardDescription className="font-bold text-muted-foreground">
                    ID: {set.set_id}
                  </CardDescription>
                  {set.release_date && (
                    <div className="font-bold text-muted-foreground mt-1">
                      {t('sets.release')}: {new Date(set.release_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="font-bold text-primary mt-2">
                    {t('sets.cardCount')}: {set.total || 0}
                  </div>
                </CardHeader>
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