
import { Button } from "@/components/ui/button";
import { Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HairdresserCardProps {
  id: string;
  name: string;
  photo: string;
  tags: string[];
  rating: number;
  experience?: string;
  onChoose?: () => void;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

const HairdresserCard = ({ id, name, photo, tags, rating, experience, onChoose }: HairdresserCardProps) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchHairdresserServices = async () => {
      try {
        const { data, error } = await supabase
          .from('hairdresser_services')
          .select(`
            services (
              id,
              name,
              price
            )
          `)
          .eq('hairdresser_id', id);

        if (error) {
          console.error('Erreur lors du chargement des services:', error);
          return;
        }

        const servicesList = data?.map(item => item.services).filter(Boolean) || [];
        setServices(servicesList);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchHairdresserServices();
  }, [id]);

  const handleChooseHairdresser = () => {
    if (onChoose) {
      onChoose();
    } else {
      // Naviguer vers la page de réservation avec les données du coiffeur
      navigate(`/reservation/${id}`, {
        state: {
          hairdresser: {
            id,
            name,
            image_url: photo,
            specialties: tags,
            rating,
            experience,
            services
          }
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer border border-gray-100">
      {/* Photo ronde 96px */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img 
            src={photo}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-gold-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
        </div>
      </div>

      {/* Nom */}
      <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{name}</h3>

      {/* Experience */}
      {experience && (
        <p className="text-sm text-gray-600 text-center mb-3">{experience}</p>
      )}

      {/* Services disponibles */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2 text-center">
          Services ({services.length})
        </p>
        <div className="flex flex-wrap gap-1 justify-center min-h-[60px]">
          {services.length > 0 ? (
            services.slice(0, 4).map((service) => (
              <span key={service.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {service.name}
              </span>
            ))
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              Services généraux
            </span>
          )}
          {services.length > 4 && (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
              +{services.length - 4} autres
            </span>
          )}
        </div>
      </div>

      {/* Tags spécialités */}
      <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[32px]">
        {tags && tags.length > 0 ? (
          tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-medium">
              {tag}
            </span>
          ))
        ) : (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            Coiffure générale
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-1 mr-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-700 font-medium">{rating.toFixed(1)}</span>
      </div>

      {/* Bouton Choisir */}
      <Button 
        onClick={handleChooseHairdresser}
        className="w-full bg-gradient-gold hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-200"
      >
        <User className="h-5 w-5 mr-2" />
        Réserver maintenant
      </Button>
    </div>
  );
};

export default HairdresserCard;
