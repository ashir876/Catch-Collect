import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface LanguageFilterProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

const LanguageFilter = ({ selectedLanguage, onLanguageChange, className = '' }: LanguageFilterProps) => {
  const { t } = useTranslation();

  const languages = [
    { code: 'all', label: 'ALL', name: 'All Languages' },
    { code: 'ja', label: 'JA', name: 'Japanese' },
    { code: 'fr', label: 'FR', name: 'French' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'pt', label: 'PT', name: 'Portuguese' },
    { code: 'es', label: 'ES', name: 'Spanish' },
    { code: 'it', label: 'IT', name: 'Italian' },
    { code: 'de', label: 'DE', name: 'German' },
  ];

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
          >
            {language.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageFilter; 