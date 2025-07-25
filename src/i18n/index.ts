
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import deTranslations from './locales/de.json';
import nlTranslations from './locales/nl.json';

const resources = {
  en: {
    translation: enTranslations
  },
  de: {
    translation: deTranslations
  },
  nl: {
    translation: nlTranslations
  }
};

const savedLanguage = localStorage.getItem('i18nextLng');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || 'en', // Use saved language or default to English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Persist language changes
 i18n.on('languageChanged', (lng) => {
   localStorage.setItem('i18nextLng', lng);
 });

export default i18n;
