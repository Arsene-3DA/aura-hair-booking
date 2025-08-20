import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationForm from '@/components/ReservationForm';
import { useToast } from "@/hooks/use-toast";
import { validateId } from '@/utils/authHelper';
import { usePublicProfessionalData } from '@/hooks/usePublicProfessionalData';

const ReservationPage = () => {
  const { stylistId } = useParams<{ stylistId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Utiliser le nouveau hook pour récupérer les données publiques
  const { professional: hairdresser, loading, error } = usePublicProfessionalData(stylistId);

  // Vérifier la validité de l'ID au montage
  useEffect(() => {
    if (!validateId(stylistId)) {
      console.error('ID coiffeur invalide:', stylistId);
      toast({
        title: "Erreur",
        description: "ID du coiffeur manquant ou invalide",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [stylistId, navigate, toast]);

  // Gérer les erreurs de chargement
  useEffect(() => {
    if (error) {
      console.error('Erreur lors du chargement du professionnel:', error);
      toast({
        title: "Erreur",
        description: error,
        variant: "destructive"
      });
      navigate('/');
    }
  }, [error, navigate, toast]);

  const handleReservationSuccess = () => {
    navigate('/client/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!hairdresser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Professionnel non trouvé</h2>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-black border-b border-[#FFD700]/20 py-16">
          <div className="container mx-auto px-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // Navigation intelligente selon la catégorie du coiffeur
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate('/professionals');
                }
              }} 
              className="mb-6 bg-transparent border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">
                Réserver avec <span className="text-[#FFD700]">{hairdresser.name}</span>
              </h1>
              <p className="text-xl text-gray-300">
                Choisissez votre créneau et service préféré
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Informations du professionnel */}
              <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-8 border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                <div className="flex items-center space-x-6">
                  <img 
                    src={hairdresser.image_url} 
                    alt={hairdresser.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#FFD700]" 
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }} 
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{hairdresser.name}</h2>
                    <p className="text-gray-300 text-lg mb-3">
                      {hairdresser.experience || hairdresser.bio || 'Professionnel expérimenté'}
                    </p>
                    <div className="flex items-center">
                      <span className="text-[#FFD700] text-xl">★</span>
                      <span className="ml-2 text-lg font-medium text-white">{hairdresser.rating}/5</span>
                    </div>
                  </div>
                </div>
                
                {hairdresser.specialties && hairdresser.specialties.length > 0 && (
                  <div className="mt-6">
                    <p className="text-lg font-bold text-[#FFD700] mb-3">Spécialités :</p>
                    <div className="flex flex-wrap gap-3">
                      {hairdresser.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="px-4 py-2 bg-black border border-[#FFD700]/40 text-[#FFD700] rounded-xl text-sm font-medium hover:bg-[#FFD700]/10 transition-colors duration-300"
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
                hairdresserId={hairdresser.auth_id} 
                hairdresserName={hairdresser.name} 
                onSuccess={handleReservationSuccess} 
                preselectedService={location.state?.preselectedService} 
              />
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReservationPage;