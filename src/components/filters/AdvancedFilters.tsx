import { useState } from "react";
import { ChevronDown, ChevronUp, Search, Filter, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { useCollectionData } from "@/hooks/useCollectionData";
import { useWishlistData } from "@/hooks/useWishlistData";
import { useIllustratorsData } from "@/hooks/useIllustratorsData";
import { useLanguagesData } from "@/hooks/useLanguagesData";

interface AdvancedFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  languageFilter: string;
  onLanguageChange: (value: string) => void;
  rarityFilter: string;
  onRarityChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  hpRange: { min: string; max: string };
  onHpRangeChange: (range: { min: string; max: string }) => void;
  illustratorFilter: string;
  onIllustratorChange: (value: string) => void;
  collectionFilter: string;
  onCollectionChange: (value: string) => void;
  wishlistFilter: string;
  onWishlistChange: (value: string) => void;
  onReloadCollection: () => void;
  // New filter props
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  stageFilter?: string;
  onStageChange?: (value: string) => void;
  evolveFromFilter?: string;
  onEvolveFromChange?: (value: string) => void;
  retreatCostFilter?: string;
  onRetreatCostChange?: (value: string) => void;
  regulationMarkFilter?: string;
  onRegulationMarkChange?: (value: string) => void;
  formatLegalityFilter?: string;
  onFormatLegalityChange?: (value: string) => void;
  weaknessTypeFilter?: string;
  onWeaknessTypeChange?: (value: string) => void;
}

const AdvancedFilters = ({
  searchTerm,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  rarityFilter,
  onRarityChange,
  typeFilter,
  onTypeChange,
  hpRange,
  onHpRangeChange,
  illustratorFilter,
  onIllustratorChange,
  collectionFilter,
  onCollectionChange,
  wishlistFilter,
  onWishlistChange,
  onReloadCollection,
  // New filter props with defaults
  categoryFilter = "all",
  onCategoryChange = () => {},
  stageFilter = "all",
  onStageChange = () => {},
  evolveFromFilter = "all",
  onEvolveFromChange = () => {},
  retreatCostFilter = "all",
  onRetreatCostChange = () => {},
  regulationMarkFilter = "all",
  onRegulationMarkChange = () => {},
  formatLegalityFilter = "all",
  onFormatLegalityChange = () => {},
  weaknessTypeFilter = "all",
  onWeaknessTypeChange = () => {}
}: AdvancedFiltersProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: collectionData = [] } = useCollectionData();
  const { data: wishlistData = [] } = useWishlistData();
  const { data: illustrators = [] } = useIllustratorsData();
  const { data: availableLanguages = [], isLoading: languagesLoading } = useLanguagesData();

  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret'
  ];

  const types = [
    'Fire', 'Water', 'Lightning', 'Grass', 'Fighting', 'Psychic', 'Colorless', 
    'Darkness', 'Metal', 'Dragon', 'Fairy'
  ];

  const categories = [
    { value: 'all', label: t('filters.allCategories') },
    { value: 'Pokemon', label: 'Pokémon' },
    { value: 'Trainer', label: 'Trainer' },
    { value: 'Energy', label: 'Energy' }
  ];

  const stages = [
    { value: 'all', label: t('filters.allStages') },
    { value: 'Basic', label: 'Basic' },
    { value: 'Stage1', label: 'Stage 1' },
    { value: 'Stage2', label: 'Stage 2' }
  ];

  const retreatCosts = [
    { value: 'all', label: t('filters.allRetreatCosts') },
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4+' }
  ];

  const regulationMarks = [
    { value: 'all', label: t('filters.allRegulationMarks') },
    { value: 'D', label: 'D' },
    { value: 'E', label: 'E' },
    { value: 'F', label: 'F' },
    { value: 'G', label: 'G' },
    { value: 'H', label: 'H' }
  ];

  const formatLegalities = [
    { value: 'all', label: t('filters.allFormats') },
    { value: 'standard', label: t('filters.standard') },
    { value: 'expanded', label: t('filters.expanded') },
    { value: 'legacy', label: t('filters.legacy') }
  ];

  const weaknessTypes = [
    { value: 'all', label: t('filters.allWeaknessTypes') },
    { value: 'Fire', label: 'Fire' },
    { value: 'Water', label: 'Water' },
    { value: 'Lightning', label: 'Lightning' },
    { value: 'Grass', label: 'Grass' },
    { value: 'Fighting', label: 'Fighting' },
    { value: 'Psychic', label: 'Psychic' }
  ];

  // Create dynamic languages array from database data
  const languages = [
    { value: 'all', label: t('filters.allLanguages') },
    ...availableLanguages.map(lang => ({
      value: lang,
      label: getLanguageDisplayName(lang)
    }))
  ];

  // Helper function to get proper display names for languages
  function getLanguageDisplayName(langCode: string): string {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'de': 'Deutsch',
      'fr': 'Français', 
      'es': 'Español',
      'it': 'Italiano',
      'pt': 'Português',
      'nl': 'Nederlands',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'ru': 'Русский'
    };
    
    return languageNames[langCode] || langCode.toUpperCase();
  }

  const collectionStatuses = [
    { value: 'all', label: t('filters.allCards') },
    { value: 'in_collection', label: t('filters.inCollection') },
    { value: 'not_in_collection', label: t('filters.notInCollection') }
  ];

  const wishlistStatuses = [
    { value: 'all', label: t('filters.allCards') },
    { value: 'in_wishlist', label: t('filters.inWishlist') },
    { value: 'not_in_wishlist', label: t('filters.notInWishlist') }
  ];

  return (
    <div className="mb-8">
      {/* Main Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
        <Input
          placeholder={t('filters.searchByNameIdNumber')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.language')}:</span>
          <Select value={languageFilter} onValueChange={onLanguageChange} disabled={languagesLoading}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue placeholder={languagesLoading ? "Loading..." : undefined} />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.category')}:</span>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.rarity')}:</span>
          <Select value={rarityFilter} onValueChange={onRarityChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allRarities')}</SelectItem>
              {rarities.map((rarity) => (
                <SelectItem key={rarity} value={rarity}>
                  {rarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.type')}:</span>
          <Select value={typeFilter} onValueChange={onTypeChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* HP Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">HP:</span>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="0"
              value={hpRange.min}
              onChange={(e) => onHpRangeChange({ ...hpRange, min: e.target.value })}
              className="w-16 h-8 text-sm border border-gray-300 rounded-md"
            />
            <span className="text-sm text-gray-500">-</span>
            <Input
              type="number"
              placeholder="300"
              value={hpRange.max}
              onChange={(e) => onHpRangeChange({ ...hpRange, max: e.target.value })}
              className="w-16 h-8 text-sm border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          {t('filters.advancedSearch')}
          {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>

        {/* Collection Status */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={collectionFilter === 'in_collection' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCollectionChange(collectionFilter === 'in_collection' ? 'all' : 'in_collection')}
                className="h-7 px-3 text-xs"
              >
                <Heart className="mr-1 h-3 w-3" />
                {t('filters.inCollection')}
              </Button>
              <Button
                variant={wishlistFilter === 'in_wishlist' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWishlistChange(wishlistFilter === 'in_wishlist' ? 'all' : 'in_wishlist')}
                className="h-7 px-3 text-xs"
              >
                <Star className="mr-1 h-3 w-3" />
                {t('filters.inWishlist')}
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              {t('filters.collectionStats', { 
                collection: collectionData.length, 
                wishlist: wishlistData.length 
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReloadCollection}
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800"
            >
              {t('filters.reloadCollectionData')}
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Filters (Collapsible) */}
      {isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.illustrator')}</label>
              <Select value={illustratorFilter} onValueChange={onIllustratorChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectIllustrator')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.allIllustrators')}</SelectItem>
                  {illustrators.map((illustrator) => (
                    <SelectItem key={illustrator} value={illustrator}>
                      {illustrator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.stage')}</label>
              <Select value={stageFilter} onValueChange={onStageChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectStage')} />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.value} value={stage.value}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.retreatCost')}</label>
              <Select value={retreatCostFilter} onValueChange={onRetreatCostChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectRetreatCost')} />
                </SelectTrigger>
                <SelectContent>
                  {retreatCosts.map((cost) => (
                    <SelectItem key={cost.value} value={cost.value}>
                      {cost.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.regulationMark')}</label>
              <Select value={regulationMarkFilter} onValueChange={onRegulationMarkChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectRegulationMark')} />
                </SelectTrigger>
                <SelectContent>
                  {regulationMarks.map((mark) => (
                    <SelectItem key={mark.value} value={mark.value}>
                      {mark.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.formatLegality')}</label>
              <Select value={formatLegalityFilter} onValueChange={onFormatLegalityChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectFormat')} />
                </SelectTrigger>
                <SelectContent>
                  {formatLegalities.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.weaknessType')}</label>
              <Select value={weaknessTypeFilter} onValueChange={onWeaknessTypeChange}>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectWeaknessType')} />
                </SelectTrigger>
                <SelectContent>
                  {weaknessTypes.map((weakness) => (
                    <SelectItem key={weakness.value} value={weakness.value}>
                      {weakness.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!user && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                {t('filters.loginToSeeCollection')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters; 