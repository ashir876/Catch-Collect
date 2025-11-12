import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from 'react-i18next';
import { useSeriesData } from "@/hooks/useSeriesData";

interface SetsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  languageFilter: string;
  onLanguageChange: (value: string) => void;
  seriesFilter: string | null;
  onSeriesFilterChange: (value: string | null) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  completionFilter: 'all' | 'completed' | 'incomplete';
  onCompletionFilterChange: (value: 'all' | 'completed' | 'incomplete') => void;
}

const SetsFilters = ({
  searchTerm,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  seriesFilter,
  onSeriesFilterChange,
  sortBy,
  onSortChange,
  completionFilter,
  onCompletionFilterChange
}: SetsFiltersProps) => {
  const { t } = useTranslation();

  const { data: seriesData = [] } = useSeriesData({ 
    language: languageFilter === "all" ? undefined : languageFilter
  });

  const availableLanguages = [
    { value: 'all', label: t('filters.allLanguages') },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'nl', label: 'Nederlands' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
    { value: 'ru', label: 'Русский' }
  ];

  const sortOptions = [
    { value: 'newest', label: t('sets.sortByNewest') },
    { value: 'oldest', label: t('sets.sortByOldest') },
    { value: 'name', label: t('sets.sortByName') }
  ];

  const completionOptions = [
    { value: 'all', label: t('common.all') },
    { value: 'completed', label: t('sets.completed') },
    { value: 'incomplete', label: t('sets.incomplete') }
  ];

  return (
    <div className="mb-8">
      {}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10" />
        <Input
          placeholder={t('sets.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
        />
      </div>

      {}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('filters.language')}:</span>
          <Select value={languageFilter} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('sets.filterBySeries')}:</span>
          <Select value={seriesFilter || "all"} onValueChange={(value) => onSeriesFilterChange(value === "all" ? null : value)}>
            <SelectTrigger className="w-48 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue>
                {seriesFilter 
                  ? seriesData.find(s => s.series_id === seriesFilter)?.series_name || seriesFilter
                  : t('common.all')
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="all" className="py-2 px-4 hover:bg-gray-100">
                {t('common.all')}
              </SelectItem>
              {seriesData
                .filter((series, index, self) => 
                  index === self.findIndex(s => s.series_id === series.series_id)
                )
                .sort((a, b) => a.series_name.localeCompare(b.series_name))
                .map((series) => (
                  <SelectItem 
                    key={series.series_id} 
                    value={series.series_id}
                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="block truncate">{series.series_name}</span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('sets.sortBy')}:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{t('sets.completionStatus')}:</span>
          <Select value={completionFilter} onValueChange={onCompletionFilterChange}>
            <SelectTrigger className="w-32 h-8 text-sm border border-gray-300 rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {completionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

    </div>
  );
};

export default SetsFilters;
