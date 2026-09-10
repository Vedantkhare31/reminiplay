import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translations
import enTranslations from './locales/en/translation.json';
import hiTranslations from './locales/hi/translation.json';
import asTranslations from './locales/as/translation.json';
import bnTranslations from './locales/bn/translation.json';
import mrTranslations from './locales/mr/translation.json';
import guTranslations from './locales/gu/translation.json';
import paTranslations from './locales/pa/translation.json';
import orTranslations from './locales/or/translation.json';
import teTranslations from './locales/te/translation.json';
import taTranslations from './locales/ta/translation.json';
import knTranslations from './locales/kn/translation.json';

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  as: { translation: asTranslations },
  bn: { translation: bnTranslations },
  mr: { translation: mrTranslations },
  gu: { translation: guTranslations },
  pa: { translation: paTranslations },
  or: { translation: orTranslations },
  te: { translation: teTranslations },
  ta: { translation: taTranslations },
  kn: { translation: knTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

// Force re-render on language change
i18n.on('languageChanged', () => {
  document.dispatchEvent(new Event('languageChanged'));
});

export default i18n;