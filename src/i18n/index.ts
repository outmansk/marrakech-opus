import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import { DEFAULT_LANG, LANGS, langFromPath } from './routing';

// The language comes from the URL (see ./routing.ts), never from the browser:
// every address always renders in the same language, for visitors and crawlers alike.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      es: { translation: es },
    },
    lng: typeof window !== 'undefined' ? langFromPath(window.location.pathname) : DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    supportedLngs: [...LANGS],
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
