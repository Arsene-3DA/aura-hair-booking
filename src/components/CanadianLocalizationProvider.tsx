import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCanadianLocalization } from '@/hooks/useCanadianLocalization';
import { useToast } from '@/hooks/use-toast';

interface CanadianLocalizationContextType {
  detectedProvince: string | null;
  suggestedLanguage: 'fr' | 'en';
  formatPrice: (amount: number) => string;
  isLoading: boolean;
  error: string | null;
}

const CanadianLocalizationContext = createContext<CanadianLocalizationContextType | null>(null);

export const useCanadianLocalizationContext = () => {
  const context = useContext(CanadianLocalizationContext);
  if (!context) {
    throw new Error('useCanadianLocalizationContext must be used within a CanadianLocalizationProvider');
  }
  return context;
};

interface CanadianLocalizationProviderProps {
  children: React.ReactNode;
}

export const CanadianLocalizationProvider: React.FC<CanadianLocalizationProviderProps> = ({ children }) => {
  const localization = useCanadianLocalization();
  const { toast } = useToast();
  const [hasShownDetectionToast, setHasShownDetectionToast] = useState(false);

  // Afficher une notification de détection de province une seule fois
  useEffect(() => {
    if (!localization.isLoading && !hasShownDetectionToast && localization.detectedProvince) {
      const provinceNames: Record<string, { fr: string; en: string }> = {
        'QC': { fr: 'Québec', en: 'Quebec' },
        'ON': { fr: 'Ontario', en: 'Ontario' },
        'BC': { fr: 'Colombie-Britannique', en: 'British Columbia' },
        'AB': { fr: 'Alberta', en: 'Alberta' },
        'SK': { fr: 'Saskatchewan', en: 'Saskatchewan' },
        'MB': { fr: 'Manitoba', en: 'Manitoba' },
        'NB': { fr: 'Nouveau-Brunswick', en: 'New Brunswick' },
        'NS': { fr: 'Nouvelle-Écosse', en: 'Nova Scotia' },
        'PE': { fr: 'Île-du-Prince-Édouard', en: 'Prince Edward Island' },
        'NL': { fr: 'Terre-Neuve-et-Labrador', en: 'Newfoundland and Labrador' }
      };

      const provinceName = provinceNames[localization.detectedProvince];
      if (provinceName) {
        const message = localization.suggestedLanguage === 'fr' 
          ? `Province détectée: ${provinceName.fr}. Langue adaptée automatiquement.`
          : `Province detected: ${provinceName.en}. Language automatically adapted.`;

        toast({
          title: localization.suggestedLanguage === 'fr' ? '🇨🇦 Localisation canadienne' : '🇨🇦 Canadian Localization',
          description: message,
          duration: 4000,
        });
      }
      
      setHasShownDetectionToast(true);
    }
  }, [localization.isLoading, localization.detectedProvince, localization.suggestedLanguage, hasShownDetectionToast, toast]);

  return (
    <CanadianLocalizationContext.Provider value={localization}>
      {children}
    </CanadianLocalizationContext.Provider>
  );
};