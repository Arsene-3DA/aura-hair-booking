import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logSecurityEvent } from '@/utils/securityUtils';

interface RouteTrackerProps {
  children: React.ReactNode;
}

export const RouteTracker: React.FC<RouteTrackerProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Logger la navigation (pour analytics et sécurité)
    const logNavigation = async () => {
      try {
        await logSecurityEvent('page_navigation', 'User navigated to page', {
          path: location.pathname,
          search: location.search,
          hash: location.hash,
          timestamp: new Date().toISOString(),
          referrer: document.referrer
        });
      } catch (error) {
        console.error('Error logging navigation:', error);
      }
    };

    // Délai pour éviter trop de logs
    const timeoutId = setTimeout(logNavigation, 500);

    return () => clearTimeout(timeoutId);
  }, [location]);

  return <>{children}</>;
};