import { Button } from "@/components/ui/button";
import { Star, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfessionalServices } from '@/hooks/useProfessionalServices';
interface HairdresserCardProps {
  id: string;
  name: string;
  photo: string;
  tags: string[];
  rating: number;
  experience?: string;
  onChoose?: () => void;
}
const HairdresserCard = ({
  id,
  name,
  photo,
  tags,
  rating,
  experience,
  onChoose
}: HairdresserCardProps) => {
  const navigate = useNavigate();
  const [currentRating, setCurrentRating] = useState(rating);
  const {
    services
  } = useProfessionalServices(id, true);

  // Synchronisation temps réel pour le rating
  useEffect(() => {
    const channel = supabase
      .channel(`hairdresser-rating-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'hairdressers',
          filter: `auth_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new.rating !== undefined) {
            setCurrentRating(payload.new.rating);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
  const handleViewProfile = () => {
    navigate(`/stylist/${id}`);
  };
  return <div className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer border border-gray-100">
      {/* Photo ronde 96px */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img src={photo} alt={name} className="w-24 h-24 rounded-full object-cover border-4 border-gold-200" onError={e => {
          const target = e.target as HTMLImageElement;
          target.src = '/placeholder.svg';
        }} />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
        </div>
      </div>

      {/* Nom */}
      <h3 className="text-xl font-bold text-gray-900 text-center mb-3">{name}</h3>

      {/* Experience */}
      {experience && <p className="text-sm text-gray-600 text-center mb-3">{experience}</p>}

      {/* Services disponibles - en forme carrée */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">
          Services ({services.length})
        </p>
        <div className="grid grid-cols-2 gap-2 min-h-[80px]">
          {services.length > 0 ? services.slice(0, 4).map(service => <div key={service.id} className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center hover:shadow-sm transition-shadow px-[10px] py-[15px] my-[15px] mx-[15px]">
                <p className="text-xs font-medium text-blue-800 truncate">
                  {service.name}
                </p>
              </div>) : <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="text-sm text-gray-600">Services généraux</span>
            </div>}
        </div>
        {services.length > 4 && <p className="text-xs text-gray-500 text-center mt-2">
            +{services.length - 4} autres services
          </p>}
      </div>

      {/* Tags spécialités */}
      <div className="flex flex-wrap gap-2 justify-center mb-4 min-h-[32px]">
        {tags && tags.length > 0 ? tags.slice(0, 3).map((tag, index) => <span key={index} className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-medium">
              {tag}
            </span>) : <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
            Coiffure générale
          </span>}
      </div>

      {/* Rating - synchronisé en temps réel */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-1 mr-2">
          {[...Array(5)].map((_, i) => 
            <Star 
              key={i} 
              className={`h-4 w-4 ${
                i < Math.floor(currentRating) 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
              }`} 
            />
          )}
        </div>
        <span className="text-sm text-gray-700 font-medium">
          {currentRating.toFixed(1)}
        </span>
      </div>

      {/* Boutons d'action */}
      <div className="space-y-3">
        <Button onClick={handleViewProfile} variant="outline" className="w-full border-gold-300 text-gold-700 hover:bg-gold-50 px-6 py-3 rounded-xl font-bold transition-colors duration-200 text-slate-400">
          <User className="h-5 w-5 mr-2" />
          Voir le profil
        </Button>
        <Button onClick={handleChooseHairdresser} className="w-full bg-gradient-gold hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-200">
          <User className="h-5 w-5 mr-2" />
          Réserver maintenant
        </Button>
      </div>
    </div>;
};
export default HairdresserCard;