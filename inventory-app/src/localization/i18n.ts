import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from './locales/tr.json';
import en from './locales/en.json';

type TranslationKey = string;
const LANGUAGE_KEY = '@app_language';
const SUPPORTED_LANGUAGES = ['tr', 'en'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

const getDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const deviceLang = locales[0].languageCode;
      
      if (deviceLang && SUPPORTED_LANGUAGES.includes(deviceLang as SupportedLanguage)) {
        return deviceLang as SupportedLanguage;
      }
    }
    
    return 'en';
  } catch {
    return 'en';
  }
};
export const translate = (key: TranslationKey, lang: 'en' | 'tr'): string => {
  const translations = lang === 'tr' ? tr : en;
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};
const getInitialLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
    const deviceLanguage = getDeviceLanguage();
    await AsyncStorage.setItem(LANGUAGE_KEY, deviceLanguage);
    return deviceLanguage;
  } catch {
    return 'en';
  }
};
export const initI18n = async () => {
  const language = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });
  
  return i18n;
};

export const changeLanguage = async (language: SupportedLanguage) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language as SupportedLanguage) || 'en';
};
export const getSupportedLanguages = () => SUPPORTED_LANGUAGES;
export default i18n;