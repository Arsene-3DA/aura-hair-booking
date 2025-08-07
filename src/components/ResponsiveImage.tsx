import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  fallback = '/placeholder.svg',
  placeholder,
  onLoad,
  onError,
  loading = 'lazy',
  sizes,
  quality = 75
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 2;

  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src || null);
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
    }
  }, [src, currentSrc]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    if (retryCount < maxRetries && currentSrc !== fallback) {
      // Premier retry avec fallback
      if (retryCount === 0 && fallback) {
        setCurrentSrc(fallback);
        setRetryCount(prev => prev + 1);
        return;
      }
      
      // Deuxième retry avec un délai
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(currentSrc); // Force reload
      }, 1000);
      return;
    }

    // Après tous les essais, marquer comme erreur
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Optimisation des images Supabase si c'est une URL Supabase
  const getOptimizedSrc = (originalSrc: string | null) => {
    if (!originalSrc) return null;
    
    // Si c'est une URL Supabase Storage, on peut ajouter des paramètres d'optimisation
    if (originalSrc.includes('supabase.co/storage')) {
      const url = new URL(originalSrc);
      if (quality < 100) {
        url.searchParams.set('quality', quality.toString());
      }
      return url.toString();
    }
    
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(currentSrc);

  if (hasError && !optimizedSrc) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted text-muted-foreground",
        className
      )}>
        {placeholder || (
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📷</div>
            <p className="text-xs">Image non disponible</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder pendant le chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Image principale */}
      {optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
          sizes={sizes}
          style={{ 
            aspectRatio: '1/1',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      )}
      
      {/* Indicateur de retry */}
      {retryCount > 0 && retryCount < maxRetries && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Retry {retryCount}/{maxRetries}
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;