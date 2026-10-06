import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enNotification from './translations/en/notification.json';
import enValidation from './translations/en/validation.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'ua'],
  resources: {
    en: {
      validation: enValidation,
      notification: enNotification,
    },
  },
  ns: ['validation', 'notification'],
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
});

export const t = i18n.t.bind(i18n);
export default i18n;
