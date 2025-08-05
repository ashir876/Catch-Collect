import { useState, useEffect, useRef } from "react";
import { Search, X, Filter, Star, Package, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: 'card' | 'series' | 'set';
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  rarity?: string;
  set_name?: string;
}

const SearchBar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const filters = [
    { key: 'card', label: t('search.cards'), icon: Star },
    { key: 'series', label: t('search.series'), icon: Grid3X3 },
    { key: 'set', label: t('search.sets'), icon: Package }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCards = async () => {
      if (query.length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      setShowResults(true);

      try {
        const searchResults: SearchResult[] = [];

        // Search cards
        if (activeFilters.includes('card') || activeFilters.length === 0) {
          const { data: cards } = await supabase
            .from('cards')
            .select('card_id, name, image_url, rarity, set_name')
            .ilike('name', `%${query}%`)
            .limit(5);

          if (cards) {
            searchResults.push(...cards.map(card => ({
              type: 'card' as const,
              id: card.card_id,
              name: card.name,
              image_url: card.image_url,
              rarity: card.rarity,
              set_name: card.set_name
            })));
          }
        }

        // Search series
        if (activeFilters.includes('series') || activeFilters.length === 0) {
          const { data: series } = await supabase
            .from('series')
            .select('series_id, series_name, logo_url')
            .ilike('series_name', `%${query}%`)
            .limit(3);

          if (series) {
            searchResults.push(...series.map(s => ({
              type: 'series' as const,
              id: s.series_id,
              name: s.series_name,
              image_url: s.logo_url
            })));
          }
        }

        // Search sets
        if (activeFilters.includes('set') || activeFilters.length === 0) {
          const { data: sets } = await supabase
            .from('sets')
            .select('set_id, name')
            .ilike('name', `%${query}%`)
            .limit(3);

          if (sets) {
            searchResults.push(...sets.map(set => ({
              type: 'set' as const,
              id: set.set_id,
              name: set.name,
              image_url: undefined
            })));
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchCards, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, activeFilters]);

  const toggleFilter = (filterKey: string) => {
    setActiveFilters(prev => 
      prev.includes(filterKey) 
        ? prev.filter(f => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery("");
    
    switch (result.type) {
      case 'card':
        navigate(`/card/${result.id}`);
        break;
      case 'series':
        navigate('/series');
        break;
      case 'set':
        navigate('/sets');
        break;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full search-container" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 pixel-input w-full text-center text-sm sm:text-base"
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilters.includes(filter.key) || activeFilters.length === 0;
          
          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => toggleFilter(filter.key)}
              className="pixel-button-small text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              <Icon className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">{filter.key}</span>
            </Button>
          );
        })}
      </div>

      {/* Search Results */}
      {showResults && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 pixel-card max-h-96 overflow-y-auto search-results-overlay w-full">
          <CardContent className="p-2 sm:p-4">
            {isSearching ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">{t('search.searching')}</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {result.image_url ? (
                        <img 
                          src={result.image_url} 
                          alt={result.name}
                          className="w-full h-full object-cover pixelated"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          {result.type === 'card' && <Star className="h-3 w-3 sm:h-4 sm:w-4" />}
                          {result.type === 'series' && <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />}
                          {result.type === 'set' && <Package className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">{result.name}</h4>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {result.type === 'card' && t('search.card')}
                          {result.type === 'series' && t('search.series')}
                          {result.type === 'set' && t('search.set')}
                        </Badge>
                        {result.rarity && (
                          <Badge variant="secondary" className="text-xs">
                            {result.rarity}
                          </Badge>
                        )}
                        {result.set_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {result.set_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm">{t('search.noResults')}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar; 