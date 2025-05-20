import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './i18n/zh';
import en from './i18n/en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh,
      en
    },
    lng: 'zh',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: ['zh', 'en']
  });

export default i18n;
