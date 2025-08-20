import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LocationData {
  province?: string;
  country?: string;
  region?: string;
}

interface CanadianLocalization {
  detectedProvince: string | null;
  suggestedLanguage: 'fr' | 'en';
  formatPrice: (amount: number) => string;
  isLoading: boolean;
  error: string | null;
}

export const useCanadianLocalization = (): CanadianLocalization => {
  const [detectedProvince, setDetectedProvince] = useState<string | null>(null);
  const [suggestedLanguage, setSuggestedLanguage] = useState<'fr' | 'en'>('fr');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  // Map des provinces canadiennes et leurs langues préférées
  const provinceLanguageMap: Record<string, 'fr' | 'en'> = {
    'QC': 'fr', // Québec
    'NB': 'fr', // Nouveau-Brunswick (bilingue, mais préférence française)
    'ON': 'en', // Ontario
    'BC': 'en', // Colombie-Britannique
    'AB': 'en', // Alberta
    'SK': 'en', // Saskatchewan
    'MB': 'en', // Manitoba
    'NS': 'en', // Nouvelle-Écosse
    'PE': 'en', // Île-du-Prince-Édouard
    'NL': 'en', // Terre-Neuve-et-Labrador
    'YT': 'en', // Yukon
    'NT': 'en', // Territoires du Nord-Ouest
    'NU': 'en', // Nunavut
  };

  const detectLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Désactiver la détection automatique pour éviter les erreurs de rate limit
      // Utiliser les valeurs par défaut canadiennes
      setDetectedProvince('QC');
      setSuggestedLanguage('fr');
      setIsLoading(false);
      return;

      // Code désactivé pour éviter les erreurs de rate limit
      /*
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Normaliser les réponses des différents services
          let province = '';
          let country = '';
          
          if (service.includes('ipapi.co')) {
            province = data.region_code;
            country = data.country_code;
          } else if (service.includes('ip-api.com')) {
            province = data.region;
            country = data.countryCode;
          } else if (service.includes('ipinfo.io')) {
            province = data.region;
            country = data.country;
          }

          // Vérifier si c'est le Canada
          if (country === 'CA' && province) {
            setDetectedProvince(province);
            
            // Déterminer la langue suggérée
            const language = provinceLanguageMap[province] || 'en';
            setSuggestedLanguage(language);
            
            // Changer automatiquement la langue si elle n'est pas déjà définie
            if (i18n.language !== language) {
              await i18n.changeLanguage(language);
            }
            
            return; // Succès, sortir de la boucle
          }
        } catch (serviceError) {
          console.warn(`Service ${service} failed:`, serviceError);
          continue; // Essayer le service suivant
        }
      }
      
      // Si aucun service n'a fonctionné ou si pas au Canada, utiliser les paramètres par défaut
      setDetectedProvince(null);
      setSuggestedLanguage('fr'); // Défaut français pour le Canada
      */
      
    } catch (err) {
      console.error('Erreur de détection de localisation:', err);
      setError('Impossible de détecter la localisation');
      setDetectedProvince(null);
      setSuggestedLanguage('fr');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number): string => {
    const language = i18n.language || suggestedLanguage;
    
    // Format canadien selon la langue
    if (language === 'fr') {
      return `${amount.toFixed(2).replace('.', ',')} $ CAD`;
    } else {
      return `$${amount.toFixed(2)} CAD`;
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  return {
    detectedProvince,
    suggestedLanguage,
    formatPrice,
    isLoading,
    error
  };
};