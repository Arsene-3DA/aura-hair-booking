
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationForm from '@/components/ReservationForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { validateId } from '@/utils/authHelper';

interface Hairdresser {
  id: string;
  name: string;
  image_url: string;
  specialties: string[];
  experience: string;
  rating: number;
}

const ReservationPage = () => {
  const { hairdresserId } = useParams<{ hairdresserId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [hairdresser, setHairdresser] = useState<Hairdresser | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupérer les données du coiffeur depuis les paramètres de navigation ou la BD
  useEffect(() => {
    const loadHairdresser = async () => {
      if (!validateId(hairdresserId)) {
        console.error('ID coiffeur invalide:', hairdresserId);
        toast({
          title: "Erreur",
          description: "ID du coiffeur manquant ou invalide",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Essayer d'abord de récupérer depuis l'état de navigation
      if (location.state?.hairdresser) {
        setHairdresser(location.state.hairdresser);
        setLoading(false);
        return;
      }

      // Sinon, charger depuis la base de données
      try {
        const { data, error } = await supabase
          .from('hairdressers')
          .select('*')
          .eq('id', hairdresserId)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          console.error('Erreur lors du chargement du coiffeur:', error);
          toast({
            title: "Erreur",
            description: "Coiffeur non trouvé",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        setHairdresser({
          id: data.id,
          name: data.name,
          image_url: data.image_url || '/placeholder.svg',
          specialties: data.specialties || [],
          experience: data.experience || '',
          rating: data.rating || 4.5
        });
      } catch (error) {
        console.error('Erreur lors du chargement du coiffeur:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadHairdresser();
  }, [hairdresserId, location.state, navigate, toast]);

  const handleReservationSuccess = () => {
    navigate('/', { 
      state: { 
        message: 'Votre demande de réservation a été envoyée avec succès!' 
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!hairdresser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coiffeur non trouvé</h2>
          <Button onClick={() => navigate('/')} className="bg-gradient-gold text-white">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="max-w-4xl mx-auto">
            {/* Informations du coiffeur */}
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
              <div className="flex items-center space-x-4">
                <img 
                  src={hairdresser.image_url} 
                  alt={hairdresser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gold-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{hairdresser.name}</h1>
                  <p className="text-gray-600">{hairdresser.experience}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm font-medium">{hairdresser.rating}/5</span>
                  </div>
                </div>
              </div>
              
              {hairdresser.specialties && hairdresser.specialties.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Spécialités :</p>
                  <div className="flex flex-wrap gap-2">
                    {hairdresser.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Formulaire de réservation */}
            <ReservationForm
              hairdresserId={hairdresser.id}
              hairdresserName={hairdresser.name}
              onSuccess={handleReservationSuccess}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReservationPage;
