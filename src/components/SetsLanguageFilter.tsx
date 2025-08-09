import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useSetsLanguagesData } from '@/hooks/useSetsLanguagesData';

interface SetsLanguageFilterProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const SetsLanguageFilter = ({ selectedLanguage, onLanguageChange, className = '' }: SetsLanguageFilterProps) => {
  const { t } = useTranslation();
  const { data: availableLanguages = [], isLoading: languagesLoading } = useSetsLanguagesData();

  // Helper function to get language display names
  function getLanguageDisplayName(langCode: string): { label: string, name: string } {
    const languageMap: { [key: string]: { label: string, name: string } } = {
      'en': { label: 'EN', name: 'English' },
      'de': { label: 'DE', name: 'Deutsch' },
      'fr': { label: 'FR', name: 'Français' },
      'es': { label: 'ES', name: 'Español' },
      'it': { label: 'IT', name: 'Italiano' },
      'pt': { label: 'PT', name: 'Português' },
      'nl': { label: 'NL', name: 'Nederlands' },
      'ja': { label: 'JA', name: '日本語' },
      'ko': { label: 'KO', name: '한국어' },
      'zh': { label: 'ZH', name: '中文' },
      'ru': { label: 'RU', name: 'Русский' }
    };
    
    return languageMap[langCode] || { label: langCode.toUpperCase(), name: langCode.toUpperCase() };
  }

  // Create dynamic languages array from database data
  const languages = [
    { code: 'all', label: 'ALL', name: 'All Languages' },
    ...availableLanguages.map(lang => ({
      code: lang,
      ...getLanguageDisplayName(lang)
    }))
  ];

  if (languagesLoading) {
    return (
      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${className}`}>
        <span className="text-sm font-bold text-foreground whitespace-nowrap">
          {t('cards.language')}:
        </span>
        <div className="text-sm text-muted-foreground">Loading languages...</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${className}`}>
      <span className="text-sm font-bold text-foreground whitespace-nowrap">
        {t('cards.language')}:
      </span>
      <div className="flex flex-wrap gap-1 w-full sm:w-auto">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={selectedLanguage === language.code ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange(language.code)}
            className={`
              px-2 sm:px-3 py-1 text-xs font-bold uppercase border-2 border-black flex-shrink-0
              ${selectedLanguage === language.code 
                ? 'bg-gray-800 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                : 'bg-gray-100 text-black hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]'
              }
              transition-all duration-100
            `}
            title={language.name}
          >
            {language.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SetsLanguageFilter;
