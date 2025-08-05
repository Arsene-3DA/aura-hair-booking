/**
 * Hook pour gérer la détection responsive et les breakpoints
 */
import { useState, useEffect } from 'react';

export interface ResponsiveBreakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  screenWidth: number;
}

export const useResponsive = (): ResponsiveBreakpoints => {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    
    // Mettre à jour immédiatement
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return {
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024 && screenWidth < 1280,
    isLargeDesktop: screenWidth >= 1280,
    screenWidth
  };
};

/**
 * Classe utilitaire pour les grilles responsives
 */
export const responsiveGrid = {
  // Grilles de services/produits
  services: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",
  professionals: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6",
  
  // Grilles de statistiques
  stats: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
  
  // Layouts principaux
  twoColumns: "grid grid-cols-1 lg:grid-cols-2 gap-8",
  sidebar: "grid grid-cols-1 lg:grid-cols-4 gap-8",
  
  // Formulaires
  form: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  formFull: "grid grid-cols-1 gap-4"
};

/**
 * Classes flex responsives
 */
export const responsiveFlex = {
  centerBetween: "flex flex-col sm:flex-row items-center justify-between gap-4",
  center: "flex flex-col sm:flex-row items-center gap-4",
  buttons: "flex flex-col sm:flex-row gap-3 w-full sm:w-auto",
  navigation: "flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8"
};

/**
 * Padding et margins responsives
 */
export const responsiveSpacing = {
  section: "py-8 sm:py-12 lg:py-16",
  container: "px-4 sm:px-6 lg:px-8",
  card: "p-4 sm:p-6",
  cardLarge: "p-6 sm:p-8 lg:p-10"
};

/**
 * Tailles de texte responsives
 */
export const responsiveText = {
  hero: "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl",
  heading: "text-2xl sm:text-3xl lg:text-4xl",
  subheading: "text-lg sm:text-xl lg:text-2xl",
  body: "text-sm sm:text-base",
  small: "text-xs sm:text-sm"
};