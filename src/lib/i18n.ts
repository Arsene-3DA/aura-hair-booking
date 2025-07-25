import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translation files
import commonFR from '@/locales/fr/common.json'
import adminFR from '@/locales/fr/admin.json'
import clientFR from '@/locales/fr/client.json'
import stylistFR from '@/locales/fr/stylist.json'
import authFR from '@/locales/fr/auth.json'

const resources = {
  fr: {
    common: commonFR,
    admin: adminFR,
    client: clientFR,
    stylist: stylistFR,
    auth: authFR,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  })

export default i18n