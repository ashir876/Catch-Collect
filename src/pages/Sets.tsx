import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Package, TrendingUp, Calendar, Grid3X3, List, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useSetsData, useSetsCount } from "@/hooks/useSetsData";
import { useSeriesData } from "@/hooks/useSeriesData";
import { useTranslation } from 'react-i18next';
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { useQueryClient } from "@tanstack/react-query";
import SetsFilters from "@/components/filters/SetsFilters";
import { useSetProgress } from "@/hooks/useSetProgress";
import SetProgressDisplay from "@/components/cards/SetProgressDisplay";

const Sets = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const seriesFilter = searchParams.get("series");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("en");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  const offset = (currentPage - 1) * itemsPerPage;

  const apiParams = {
    seriesId: seriesFilter || undefined,
    language: languageFilter,
    limit: itemsPerPage,
    offset,
    searchTerm: searchTerm || undefined,
    sortBy
  };

  const { data: setsData, isLoading, error } = useSetsData(apiParams);

  const { data: totalCount = 0 } = useSetsCount({
    seriesId: seriesFilter || undefined,
    language: languageFilter,
    searchTerm: searchTerm || undefined
  });

  const { data: setProgressData = [], isLoading: progressLoading, error: progressError } = useSetProgress();

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handleLanguageFilterChange = (newLanguageFilter: string) => {
    setLanguageFilter(newLanguageFilter);
    setCurrentPage(1);

    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'sets' 
    });
    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'sets-count' 
    });
    queryClient.invalidateQueries({ 
      predicate: (query) => query.queryKey[0] === 'series' 
    });
    queryClient.invalidateQueries({ queryKey: ['available-sets-languages'] });
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

  useEffect(() => {
    const urlLanguage = searchParams.get("language");
    if (urlLanguage) {
      setLanguageFilter(urlLanguage);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [languageFilter]);

  const filteredAndSortedSets = setsData?.slice()
    .filter(set => {
      if (completionFilter === 'all') return true;
      const progress = getSetProgress(set.set_id);
      if (completionFilter === 'completed') {
        return progress?.is_completed || false;
      }
      if (completionFilter === 'incomplete') {
        return progress && !progress.is_completed;
      }
      return true;
    })
    .sort((a, b) => {
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
      
      return (a.set_id || '').localeCompare(b.set_id || '');
    }) || [];

  const getCompletionPercentage = (owned: number, total: number) => {
    return Math.round((owned / total) * 100);
  };

  const getSetProgress = (setId: string) => {
    return setProgressData.find(progress => progress.set_id === setId);
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
      {}
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

      {}
      <SetsFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        languageFilter={languageFilter}
        onLanguageChange={handleLanguageFilterChange}
        seriesFilter={seriesFilter}
        onSeriesFilterChange={handleSeriesFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        completionFilter={completionFilter}
        onCompletionFilterChange={setCompletionFilter}
      />

      {}
      <div className="flex justify-center mb-6">
        <div className="flex border-2 border-black rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="pixel-button-small rounded-none"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            {t('sets.gridView', 'Grid')}
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="pixel-button-small rounded-none"
          >
            <List className="h-4 w-4 mr-2" />
            {t('sets.listView', 'List')}
          </Button>
        </div>
      </div>

      {}
      {totalCount > 0 && (
        <div className="mb-4 space-y-4">
          <PaginationInfo
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={itemsPerPage}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="border-4 border-black animate-pulse h-96 flex flex-col overflow-hidden">
                <div className="h-56 bg-muted flex-shrink-0"></div>
                <CardHeader className="flex-1 p-4 overflow-hidden">
                  <div className="space-y-1">
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-auto"></div>
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
                  <div className="w-24 h-4 bg-muted rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedSets.map((set, index) => {
            
            const uniqueKey = `${set.set_id}-${set.language || 'unknown'}-${index}`;
            return (
              <Card 
                key={uniqueKey} 
                className="border-4 border-black hover:scale-105 transition-all duration-300 hover:shadow-xl cursor-pointer group h-96 flex flex-col overflow-hidden"
                onClick={() => {
                  const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                  console.log('Grid view - Navigating to set:', set.set_id, 'for set:', set.name, 'with language:', languageFilter);
                  navigate(`/set/${set.set_id}${languageParam}`);
                }}
              >
                <div className="h-56 bg-white flex items-center justify-center p-4 overflow-hidden flex-shrink-0">
                  {set.logo_url ? (
                    <img
                      src={set.logo_url}
                      alt={set.name || 'Set Logo'}
                      className="max-h-40 max-w-40 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : set.symbol_url ? (
                    <img
                      src={set.symbol_url}
                      alt={set.name || 'Set Symbol'}
                      className="max-h-40 max-w-40 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-black font-black text-2xl text-center group-hover:scale-110 transition-transform duration-300">
                      {set.name}
                    </div>
                  )}
                </div>
                <CardHeader className="bg-background flex-1 flex flex-col justify-between p-4 min-h-0 overflow-hidden">
                  <div className="space-y-1 overflow-hidden">
                    <CardTitle className="font-black text-base uppercase tracking-wide line-clamp-2 break-words">
                      {set.name || t('sets.unknownSet')}
                    </CardTitle>
                    <CardDescription className="font-bold text-muted-foreground text-sm truncate">
                      ID: {set.set_id}
                    </CardDescription>
                    {set.release_date && (
                      <div className="font-bold text-muted-foreground text-sm truncate">
                        {t('sets.release')}: {new Date(set.release_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {}
                  {(() => {
                    const progress = getSetProgress(set.set_id);
                    if (progress) {
                      return (
                        <div className="mt-3 space-y-2">
                          {progress.is_completed && (
                            <div className="flex items-center gap-2 text-green-600 font-bold text-xs">
                              <CheckCircle2 className="h-4 w-4" />
                              {t('sets.completed', 'Completed')}
                            </div>
                          )}
                          <SetProgressDisplay 
                            progress={progress} 
                            variant="compact" 
                            showProgressBar={false}
                            className="text-xs"
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="font-bold text-primary text-sm mt-auto flex-shrink-0">
                        {t('sets.cardCount')}: {set.total || 0}
                      </div>
                    );
                  })()}
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedSets.map((set, index) => {
            
            const uniqueKey = `${set.set_id}-${set.language || 'unknown'}-${index}`;
            return (
              <Card 
                key={uniqueKey} 
                className="border-4 border-black hover:scale-[1.02] transition-all duration-300 hover:shadow-xl cursor-pointer group"
                onClick={() => {
                  const languageParam = languageFilter !== "all" ? `?language=${languageFilter}` : "";
                  console.log('List view - Navigating to set:', set.set_id, 'for set:', set.name, 'with language:', languageFilter);
                  navigate(`/set/${set.set_id}${languageParam}`);
                }}
              >
                <div className="flex items-center p-4 gap-4">
                  <div className="w-16 h-16 bg-white flex items-center justify-center rounded overflow-hidden flex-shrink-0 border-2 border-black">
                    {set.logo_url ? (
                      <img
                        src={set.logo_url}
                        alt={set.name || 'Set Logo'}
                        className="max-h-14 max-w-14 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : set.symbol_url ? (
                      <img
                        src={set.symbol_url}
                        alt={set.name || 'Set Symbol'}
                        className="max-h-14 max-w-14 object-contain pixelated group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg uppercase tracking-wide truncate">
                      {set.name || t('sets.unknownSet')}
                    </h3>
                    <p className="font-bold text-muted-foreground text-sm">
                      ID: {set.set_id}
                    </p>
                    {set.release_date && (
                      <p className="font-bold text-muted-foreground text-sm">
                        {t('sets.release')}: {new Date(set.release_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {(() => {
                      const progress = getSetProgress(set.set_id);
                      if (progress) {
                        return (
                          <div className="space-y-2">
                            <SetProgressDisplay 
                              progress={progress} 
                              variant="compact" 
                              showProgressBar={false}
                              className="text-sm"
                            />
                          </div>
                        );
                      }
                      return (
                        <>
                          <div className="font-black text-lg text-primary">
                            {set.total || 0}
                          </div>
                          <div className="font-bold text-muted-foreground text-sm uppercase">
                            {t('sets.cards', 'Cards')}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {}
      {totalCount > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {}
      {!isLoading && filteredAndSortedSets.length === 0 && (
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