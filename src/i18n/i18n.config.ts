import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import en from './translations/en.json';
import uz from './translations/uz.json';
import ru from './translations/ru.json';
const language = I18nManager.isRTL
  ? 'ar'
  : Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0] || 'ru';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

const getSavedLanguage = async () => {
  try {
    const storedLang = await AsyncStorage.getItem('language');
    return storedLang || language;
  } catch (error) {
    console.error('Tilni yuklashda xatolik:', error);
    return 'ru';
  }
};

// Tilni sozlash
(async () => {
  const lng = await getSavedLanguage();
  i18next.use(initReactI18next).init({
    debug: __DEV__,
    fallbackLng: 'eu',
    lng,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
    resources,
  });
})();

export default i18next;
