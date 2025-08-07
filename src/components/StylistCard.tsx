import React from 'react';
import { Star, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedAvatar } from '@/components/EnhancedAvatar';
import { cn } from '@/lib/utils';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
import PriceDisplay from '@/components/ui/price-display';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface StylistCardProps {
  id: string;
  name: string;
  avatar_url?: string | null;
  email?: string;
  phone?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  experience?: string;
  isActive?: boolean;
  onBooking?: (stylistId: string) => void;
  onViewProfile?: (stylistId: string) => void;
  className?: string;
}

export const StylistCard = ({
  id,
  name,
  avatar_url,
  email,
  phone,
  location,
  specialties = [],
  rating = 0,
  experience,
  isActive = true,
  onBooking,
  onViewProfile,
  className
}: StylistCardProps) => {

  // Récupérer les services du styliste avec mises à jour temps réel
  const { services, loading: servicesLoading } = useProfessionalServices(id, true);
  
  const handleBookingClick = () => {
    onBooking?.(id);
  };

  const handleProfileClick = () => {
    onViewProfile?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        !isActive && "opacity-60 grayscale",
        className
      )}
      role="article"
      aria-labelledby={`stylist-name-${id}`}
      data-testid="stylist-card"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative">
            <EnhancedAvatar 
              src={avatar_url}
              name={name}
              size="lg"
              className="ring-2 ring-border"
            />
            {!isActive && (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                <span className="text-xs text-white font-medium">Indisponible</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 
              id={`stylist-name-${id}`}
              className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors"
            >
              {name}
            </h3>
            
            {experience && (
              <p className="text-sm text-muted-foreground mt-1">
                {experience}
              </p>
            )}

            {/* Contact Info */}
            <div className="flex flex-col gap-1 mt-2">
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  <span>{location}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  <span>{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating - 5 étoiles par défaut */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span className="text-sm font-medium" aria-label={`Note: ${rating > 0 ? rating : 5.0} sur 5`}>
              {(rating > 0 ? rating : 5.0).toFixed(1)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Specialties */}
        {specialties && specialties.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Spécialités</h4>
            <div className="flex flex-wrap gap-1">
              {specialties.map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  aria-label={`Spécialité: ${specialty}`}
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {!servicesLoading && services.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Services</h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {services.slice(0, 3).map((service) => (
                <div 
                  key={service.id} 
                  className="flex items-center justify-between text-xs"
                  role="listitem"
                >
                  <span className="text-foreground">{service.name}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{service.duration}min</span>
                    </div>
                    <PriceDisplay amount={service.price} size="sm" />
                  </div>
                </div>
              ))}
              {services.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{services.length - 3} autres services
                </p>
              )}
            </div>
          </div>
        )}

        {/* Indicateur de chargement des services */}
        {servicesLoading && (
          <div className="text-xs text-muted-foreground">
            Chargement des services...
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleProfileClick}
              onKeyDown={(e) => handleKeyDown(e, handleProfileClick)}
              className="flex-1"
              aria-label={`Voir le profil de ${name}`}
            >
              Voir le profil
            </Button>
          )}
          
          {onBooking && isActive && (
            <Button
              size="sm"
              onClick={handleBookingClick}
              onKeyDown={(e) => handleKeyDown(e, handleBookingClick)}
              className="flex-1"
              aria-label={`Réserver avec ${name}`}
            >
              Réserver
            </Button>
          )}
          
          {!isActive && (
            <Button
              size="sm"
              disabled
              className="flex-1"
              aria-label={`${name} n'est pas disponible`}
            >
              Indisponible
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </Card>
  );
};