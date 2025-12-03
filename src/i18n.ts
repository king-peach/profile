import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './i18n/zh';
import en from './i18n/en';

function detectSystemLanguage(): 'zh' | 'en' {
  try {
    const supported = ['zh', 'en'];
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null;
    if (stored && supported.includes(stored)) return stored as 'zh' | 'en';

    const langs: string[] = (navigator as any)?.languages?.length ? (navigator as any).languages : [(navigator as any)?.language || 'en'];
    const first = (langs[0] || 'en').toLowerCase();
    if (first.startsWith('zh')) return 'zh';
    return 'en';
  } catch {
    return 'en';
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh,
      en,
    },
    lng: detectSystemLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    supportedLngs: ['zh', 'en'],
  });

export default i18n;
