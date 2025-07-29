import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Filter, 
  X, 
  Star, 
  Package, 
  Grid3X3,
  Zap,
  Shield,
  Heart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

interface FilterState {
  rarity: string[];
  types: string[];
  series: string[];
  sets: string[];
  minHp: number | null;
  maxHp: number | null;
  hasAttacks: boolean | null;
  hasWeaknesses: boolean | null;
  priceRange: [number, number] | null;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const AdvancedFilters = ({ onFiltersChange, className }: AdvancedFiltersProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    rarity: [],
    types: [],
    series: [],
    sets: [],
    minHp: null,
    maxHp: null,
    hasAttacks: null,
    hasWeaknesses: null,
    priceRange: null
  });

  const [availableFilters, setAvailableFilters] = useState({
    rarities: [],
    types: [],
    series: [],
    sets: []
  });

  useEffect(() => {
    const loadAvailableFilters = async () => {
      try {
        // Load rarities
        const { data: rarities } = await supabase
          .from('cards')
          .select('rarity')
          .not('rarity', 'is', null);

        // Load types
        const { data: types } = await supabase
          .from('cards')
          .select('types');

        // Load series
        const { data: series } = await supabase
          .from('series')
          .select('series_id, series_name');

        // Load sets
        const { data: sets } = await supabase
          .from('sets')
          .select('set_id, set_name');

        setAvailableFilters({
          rarities: [...new Set(rarities?.map(r => r.rarity).filter(Boolean) || [])],
          types: [...new Set(types?.flatMap(t => t.types || []).filter(Boolean) || [])],
          series: series || [],
          sets: sets || []
        });
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };

    loadAvailableFilters();
  }, []);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const toggleFilter = (category: keyof FilterState, value: string) => {
    if (category === 'rarity' || category === 'types' || category === 'series' || category === 'sets') {
      setFilters(prev => ({
        ...prev,
        [category]: prev[category].includes(value)
          ? prev[category].filter(v => v !== value)
          : [...prev[category], value]
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      rarity: [],
      types: [],
      series: [],
      sets: [],
      minHp: null,
      maxHp: null,
      hasAttacks: null,
      hasWeaknesses: null,
      priceRange: null
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== null
  );

  return (
    <Card className={`pixel-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('filters.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="pixel-button-small"
              >
                <X className="h-4 w-4 mr-1" />
                {t('filters.clear')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="pixel-button-small"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Rarity Filter */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              {t('filters.rarity')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.rarities.map((rarity) => (
                <Badge
                  key={rarity}
                  variant={filters.rarity.includes(rarity) ? "default" : "outline"}
                  className="cursor-pointer pixel-badge"
                  onClick={() => toggleFilter('rarity', rarity)}
                >
                  {rarity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Types Filter */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t('filters.types')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.types.map((type) => (
                <Badge
                  key={type}
                  variant={filters.types.includes(type) ? "default" : "outline"}
                  className="cursor-pointer pixel-badge"
                  onClick={() => toggleFilter('types', type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Series Filter */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              {t('filters.series')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.series.map((series) => (
                <Badge
                  key={series.series_id}
                  variant={filters.series.includes(series.series_id) ? "default" : "outline"}
                  className="cursor-pointer pixel-badge"
                  onClick={() => toggleFilter('series', series.series_id)}
                >
                  {series.series_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Sets Filter */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('filters.sets')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableFilters.sets.map((set) => (
                <Badge
                  key={set.set_id}
                  variant={filters.sets.includes(set.set_id) ? "default" : "outline"}
                  className="cursor-pointer pixel-badge"
                  onClick={() => toggleFilter('sets', set.set_id)}
                >
                  {set.set_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* HP Range Filter */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t('filters.hpRange')}
            </h4>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={t('filters.minHp')}
                className="pixel-input flex-1"
                value={filters.minHp || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  minHp: e.target.value ? parseInt(e.target.value) : null
                }))}
              />
              <span className="self-center">-</span>
              <input
                type="number"
                placeholder={t('filters.maxHp')}
                className="pixel-input flex-1"
                value={filters.maxHp || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  maxHp: e.target.value ? parseInt(e.target.value) : null
                }))}
              />
            </div>
          </div>

          {/* Special Filters */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t('filters.special')}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasAttacks"
                  checked={filters.hasAttacks === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasAttacks: e.target.checked ? true : null
                  }))}
                  className="pixel-checkbox"
                />
                <label htmlFor="hasAttacks" className="text-sm cursor-pointer">
                  {t('filters.hasAttacks')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasWeaknesses"
                  checked={filters.hasWeaknesses === true}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    hasWeaknesses: e.target.checked ? true : null
                  }))}
                  className="pixel-checkbox"
                />
                <label htmlFor="hasWeaknesses" className="text-sm cursor-pointer">
                  {t('filters.hasWeaknesses')}
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters; 