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
  onReloadCollection
}: AdvancedFiltersProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: collectionData = [] } = useCollectionData();
  const { data: wishlistData = [] } = useWishlistData();
  const { data: illustrators = [] } = useIllustratorsData();

  const rarities = [
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret',
    'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Ultra', 'Rare Secret'
  ];

  const types = [
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
    'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
  ];

  const languages = [
    { value: 'all', label: t('filters.allLanguages') },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'nl', label: 'Nederlands' }
  ];

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
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder={t('filters.searchByNameIdNumber')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 h-12 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.language')}:</span>
          <Select value={languageFilter} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
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
                onClick={() => onCollectionChange('in_collection')}
                className="h-7 px-3 text-xs"
              >
                <Heart className="mr-1 h-3 w-3" />
                {t('filters.inCollection')}
              </Button>
              <Button
                variant={wishlistFilter === 'in_wishlist' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onWishlistChange('in_wishlist')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.productType')}</label>
              <Select value="cards" disabled>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectProductType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">{t('filters.singleCards')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">{t('filters.series')}</label>
              <Select value="all" disabled>
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder={t('filters.selectSeries')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all')}</SelectItem>
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