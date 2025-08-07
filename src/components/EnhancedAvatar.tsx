import React from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EnhancedAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const EnhancedAvatar = ({ src, name, size = 'md', className }: EnhancedAvatarProps) => {
  // Génère les initiales à partir du nom
  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return '';
  };

  // Génère une URL d'avatar via ui-avatars.com comme fallback
  const getFallbackAvatarUrl = () => {
    if (!name) return null;
    
    const initials = getInitials();
    const backgroundColor = '6366f1'; // Couleur primaire
    const color = 'ffffff';
    const size = 400;
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor}&color=${color}&size=${size}&bold=true&format=png`;
  };

  // Classes de taille
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10', 
    lg: 'h-16 w-16',
    xl: 'h-32 w-32'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8', 
    xl: 'h-16 w-16'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {/* Essaie d'abord l'image fournie */}
      {src && (
        <AvatarImage 
          src={src} 
          alt={name || 'Avatar'} 
          className="object-cover"
          style={{ aspectRatio: '1/1' }}
          loading="lazy"
          onError={(e) => {
            // Si l'image échoue, essaie le fallback ui-avatars
            const fallbackUrl = getFallbackAvatarUrl();
            if (fallbackUrl && e.currentTarget.src !== fallbackUrl) {
              e.currentTarget.src = fallbackUrl;
            } else {
              // Si même le fallback échoue, on cache l'élément pour laisser place au fallback final
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      )}
      
      {/* Si pas d'image src, utilise directement ui-avatars */}
      {!src && name && (
        <AvatarImage 
          src={getFallbackAvatarUrl() || ''} 
          alt={name}
          className="object-cover"
          style={{ aspectRatio: '1/1' }}
          loading="lazy"
          onError={(e) => {
            // Si même ui-avatars échoue, on cache l'élément
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      
      {/* Fallback final : initiales ou icône */}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {getInitials() || <User className={iconSizes[size]} />}
      </AvatarFallback>
    </Avatar>
  );
};