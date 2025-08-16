
import { Link, useSearchParams } from "react-router-dom";
import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeriesData, useSeriesCount } from "@/hooks/useSeriesData";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { useQueryClient } from "@tanstack/react-query";
import SeriesFilters from "@/components/filters/SeriesFilters";

const Series = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Show 12 items per page
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Prepare API parameters
  const apiParams = {
    language: languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined
  };



  // Fetch series data with pagination
  const { data: seriesData, isLoading, error } = useSeriesData(apiParams);

  // Fetch total count for pagination
  const { data: totalCount = 0 } = useSeriesCount({
    language: languageFilter,
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
    
    // Invalidate cache to ensure fresh data for both series and series languages
    // Use predicate to invalidate all series-related queries
    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'series' 
    });
    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'series-count' 
    });
    queryClient.invalidateQueries({ queryKey: ['available-series-languages'] });
  };

  // Initialize and update language filter from URL parameters
  useEffect(() => {
    const urlLanguage = searchParams.get("language");
    if (urlLanguage) {
      setLanguageFilter(urlLanguage);
    }
  }, [searchParams]);

  // Reset page when language filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [languageFilter]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{t('series.loadError')}</h2>
          <p className="text-muted-foreground">{t('series.loadErrorSubtitle')}</p>
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
              {t('series.title')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-bold">
            {t('series.subtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <SeriesFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          languageFilter={languageFilter}
          onLanguageChange={handleLanguageFilterChange}
        />

        {/* View Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex border-2 border-black rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="pixel-button-small rounded-none"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              {t('series.gridView', 'Grid')}
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="pixel-button-small rounded-none"
            >
              <List className="h-4 w-4 mr-2" />
              {t('series.listView', 'List')}
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

        {/* Series Grid/List */}
        {isLoading ? (
          viewMode === 'grid' ? (
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
            <div className="space-y-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="border-4 border-black animate-pulse">
                  <div className="flex items-center p-4 gap-4">
                    <div className="w-16 h-16 bg-muted rounded flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : seriesData && seriesData.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seriesData.map((series, index) => {
                const linkUrl = `/sets?series=${series.series_id}&language=${languageFilter}`;
                // Create unique key combining series_id and language to handle duplicates
                const uniqueKey = `${series.series_id}-${series.language || 'unknown'}-${index}`;
                return (
                  <Link key={uniqueKey} to={linkUrl}>
                    <Card className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer group h-80 flex flex-col">
                      <div className="h-48 bg-white flex items-center justify-center p-4 overflow-hidden flex-shrink-0">
                        {series.logo_url ? (
                          <img 
                            src={series.logo_url} 
                            alt={series.series_name || 'Series'} 
                            className="max-h-full max-w-full object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-white font-black text-2xl text-center group-hover:scale-110 transition-transform duration-300">
                            <Grid3X3 className="h-16 w-16 mx-auto mb-2" />
                            {series.series_name}
                          </div>
                        )}
                      </div>
                      <CardHeader className="bg-background flex-1 flex flex-col justify-center p-4">
                        <CardTitle className="font-black text-lg uppercase tracking-wide line-clamp-2">
                          {series.series_name}
                        </CardTitle>
                        <CardDescription className="font-bold text-muted-foreground">
                          ID: {series.series_id}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {seriesData.map((series, index) => {
                const linkUrl = `/sets?series=${series.series_id}&language=${languageFilter}`;
                // Create unique key combining series_id and language to handle duplicates
                const uniqueKey = `${series.series_id}-${series.language || 'unknown'}-${index}`;
                return (
                  <Link key={uniqueKey} to={linkUrl}>
                    <Card className="border-4 border-black hover:scale-[1.02] transition-all duration-300 hover:shadow-xl cursor-pointer group">
                      <div className="flex items-center p-4 gap-4">
                        <div className="w-16 h-16 bg-white flex items-center justify-center rounded overflow-hidden flex-shrink-0 border-2 border-black">
                          {series.logo_url ? (
                            <img 
                              src={series.logo_url} 
                              alt={series.series_name || 'Series'} 
                              className="max-h-14 max-w-14 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-lg uppercase tracking-wide truncate">
                            {series.series_name}
                          </h3>
                          <p className="font-bold text-muted-foreground text-sm">
                            ID: {series.series_id}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Grid3X3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-black mb-2">{t('series.noSeriesFound')}</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `${t('series.noSeriesSubtitle')} "${searchTerm}"` : t('series.noSeriesSubtitle')}
            </p>
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

        {/* Stats */}
        {seriesData && seriesData.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="border-4 border-black bg-muted/50 inline-block hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Grid3X3 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-3xl font-black text-primary">
                      {totalCount}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                      {t('series.seriesAvailable')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
};

export default Series;
