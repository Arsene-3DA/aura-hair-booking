import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logSecurityEvent } from '@/utils/securityUtils';

interface RouteGuardOptions {
  validRoutes?: string[];
  onNotFound?: (path: string) => void;
  enableLogging?: boolean;
}

export const useRouteGuard = (options: RouteGuardOptions = {}) => {
  const [isValidRoute, setIsValidRoute] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const { validRoutes = [], onNotFound, enableLogging = true } = options;

  // Routes valides par défaut
  const defaultValidRoutes = [
    '/',
    '/auth',
    '/login',
    '/register',
    '/client',
    '/client/dashboard',
    '/client/bookings',
    '/client/history',
    '/client/profile',
    '/client/reviews',
    '/client/support',
    '/client/notifications',
    '/stylist',
    '/stylist/dashboard',
    '/stylist/calendar',
    '/stylist/bookings',
    '/stylist/clients',
    '/stylist/portfolio',
    '/stylist/services',
    '/stylist/chat',
    '/stylist/queue',
    '/admin',
    '/admin/overview',
    '/admin/users',
    '/admin/bookings',
    '/admin/reports',
    '/admin/settings',
    '/admin/security-audit',
    '/admin/audit-trail',
    '/stylists',
    '/services',
    '/experts',
    '/booking',
    '/reserve',
    '/403',
    '/404'
  ];

  const allValidRoutes = [...defaultValidRoutes, ...validRoutes];

  useEffect(() => {
    const checkRoute = async () => {
      const currentPath = location.pathname;
      
      // Vérifier si la route est valide (exacte ou avec paramètres)
      const isValid = allValidRoutes.some(route => {
        // Route exacte
        if (route === currentPath) return true;
        
        // Routes avec paramètres dynamiques
        if (route.includes('/:')) {
          const routePattern = route.replace(/\/:[^/]+/g, '/[^/]+');
          const regex = new RegExp(`^${routePattern}$`);
          return regex.test(currentPath);
        }
        
        // Routes qui commencent par le chemin (pour les sous-routes)
        if (currentPath.startsWith(route + '/')) return true;
        
        return false;
      });

      setIsValidRoute(isValid);

      if (!isValid) {
        // Générer des suggestions basées sur la similarité
        const suggestions = generateSuggestions(currentPath, allValidRoutes);
        setSuggestions(suggestions);

        // Logger l'erreur 404
        if (enableLogging) {
          await logSecurityEvent('route_not_found', 'User accessed non-existent route', {
            requestedPath: currentPath,
            userAgent: navigator.userAgent,
            referer: document.referrer,
            suggestions: suggestions.slice(0, 3)
          });
        }

        // Callback personnalisé
        if (onNotFound) {
          onNotFound(currentPath);
        }
      }
    };

    checkRoute();
  }, [location.pathname, allValidRoutes, enableLogging, onNotFound]);

  const generateSuggestions = (path: string, validRoutes: string[]): string[] => {
    const suggestions: Array<{ route: string; score: number }> = [];

    validRoutes.forEach(route => {
      const score = calculateSimilarity(path.toLowerCase(), route.toLowerCase());
      if (score > 0.3) {
        suggestions.push({ route, score });
      }
    });

    // Trier par score de similarité et prendre les 5 meilleures
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.route);
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    // Algorithme de distance de Levenshtein simplifié
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Vérifier les sous-chaînes communes
    const commonSubstring = findCommonSubstring(str1, str2);
    const baseScore = commonSubstring.length / longer.length;
    
    // Bonus pour les préfixes communs
    const prefixBonus = getCommonPrefix(str1, str2).length / longer.length * 0.5;
    
    return Math.min(1.0, baseScore + prefixBonus);
  };

  const findCommonSubstring = (str1: string, str2: string): string => {
    let longest = '';
    for (let i = 0; i < str1.length; i++) {
      for (let j = i + 1; j <= str1.length; j++) {
        const substring = str1.slice(i, j);
        if (str2.includes(substring) && substring.length > longest.length) {
          longest = substring;
        }
      }
    }
    return longest;
  };

  const getCommonPrefix = (str1: string, str2: string): string => {
    let prefix = '';
    const minLength = Math.min(str1.length, str2.length);
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) {
        prefix += str1[i];
      } else {
        break;
      }
    }
    return prefix;
  };

  const navigateToSuggestion = (route: string) => {
    navigate(route);
  };

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    isValidRoute,
    suggestions,
    currentPath: location.pathname,
    navigateToSuggestion,
    goHome,
    goBack
  };
};