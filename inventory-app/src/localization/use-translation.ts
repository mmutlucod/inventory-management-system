import { useTranslation as useI18nTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, getSupportedLanguages } from './i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  return {
    t,
    i18n,
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    supportedLanguages: getSupportedLanguages(),
    isRTL: i18n.dir() === 'rtl',
  };
};