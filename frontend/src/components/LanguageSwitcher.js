import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language);
    };
    document.addEventListener('languageChanged', handleLanguageChange);
    return () => document.removeEventListener('languageChanged', handleLanguageChange);
  }, [i18n]);

  const languages = [
    { code: 'en', name: t('languages.en'), flag: '🇬🇧' },
    { code: 'hi', name: t('languages.hi'), flag: '🇮🇳' },
    { code: 'as', name: t('languages.as'), flag: '🇮🇳' },
    { code: 'bn', name: t('languages.bn'), flag: '🇮🇳' },
    { code: 'mr', name: t('languages.mr'), flag: '🇮🇳' },
    { code: 'gu', name: t('languages.gu'), flag: '🇮🇳' },
    { code: 'pa', name: t('languages.pa'), flag: '🇮🇳' },
    { code: 'or', name: t('languages.or'), flag: '🇮🇳' },
    { code: 'te', name: t('languages.te'), flag: '🇮🇳' },
    { code: 'ta', name: t('languages.ta'), flag: '🇮🇳' },
    { code: 'kn', name: t('languages.kn'), flag: '🇮🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('nav.language')}
      >
        <Languages className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="hidden md:inline text-gray-700 dark:text-gray-300">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('nav.language')}</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                currentLang === lang.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <span className="flex items-center space-x-3">
                <span className="text-xl">{lang.flag}</span>
                <span className="text-gray-700 dark:text-gray-300">{lang.name}</span>
              </span>
              {currentLang === lang.code && (
                <Check className="w-5 h-5 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;