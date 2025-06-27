
import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

const LazyImage = ({ src, alt, className = "", placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder blur */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-luxury-gold-100 animate-pulse" />
      )}
      
      {/* Image principale */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />
      
      {/* Fallback en cas d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Image non disponible</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
