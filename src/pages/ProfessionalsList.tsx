import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HairdresserCard from '@/components/HairdresserCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  image_url: string;
  experience: string;
  location: string;
  gender: 'male' | 'female';
  email: string;
  phone?: string;
  is_active: boolean;
}

const ProfessionalsList = () => {
  const { gender } = useParams<{ gender?: 'male' | 'female' }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log('Current gender parameter:', gender);
  
  // Si pas de genre spécifié ou genre invalide, rediriger vers l'accueil
  useEffect(() => {
    if (!gender || !['male', 'female'].includes(gender)) {
      console.log('Invalid gender parameter, redirecting to home');
      navigate('/');
      return;
    }
  }, [gender, navigate]);

  // Charger les professionnels depuis Supabase
  useEffect(() => {
    const loadProfessionals = async () => {
      if (!gender || !['male', 'female'].includes(gender)) return;
      
      try {
        setLoading(true);
        console.log('Loading professionals for gender:', gender);
        
        // Requête directe avec seulement les colonnes publiques autorisées
        const { data, error } = await supabase
          .from('hairdressers')
          .select('id, name, rating, salon_address, image_url, gender, is_active, created_at, updated_at')
          .eq('is_active', true);

        if (error) {
          console.error('Erreur lors du chargement des professionnels:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les professionnels",
            variant: "destructive",
          });
          return;
        }

        console.log('Data received from Supabase:', data);

        // Filtrer par genre
        const filteredData = (data || []).filter(item => 
          item.gender === gender && item.is_active
        );

        // Mapper les données Supabase vers l'interface Professional
        const mappedProfessionals: Professional[] = filteredData.map(item => ({
          id: item.id,
          name: item.name,
          specialties: [], // Pas exposé publiquement pour la sécurité
          rating: item.rating || 5.0,
          image_url: item.image_url || '/placeholder.svg',
          experience: '', // Pas exposé publiquement pour la sécurité
          location: item.salon_address || '',
          gender: item.gender as 'male' | 'female',
          email: '',
          phone: '',
          is_active: item.is_active || false
        }));

        setProfessionals(mappedProfessionals);
        console.log('Professionnels chargés:', mappedProfessionals.length, mappedProfessionals);
        
        if (mappedProfessionals.length === 0) {
          toast({
            title: "Information",
            description: `Aucun ${gender === 'male' ? 'coiffeur' : 'coiffeuse'} trouvé actuellement.`,
          });
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, [gender, toast]);

  // Si pas de genre valide, ne rien afficher (useEffect va rediriger)
  if (!gender || !['male', 'female'].includes(gender)) {
    return null;
  }

  const title = gender === 'male' ? 'Nos Coiffeurs Experts' : 'Nos Coiffeuses Expertes';
  const subtitle = gender === 'male' 
    ? 'Spécialistes en coupe homme, barbe et styling masculin'
    : 'Spécialistes en coupe femme, couleur et coiffage';

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        {/* Header Section */}
        <section className="bg-black py-16 border-b border-[#FFD700]/20">
          <div className="container mx-auto px-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-6 bg-transparent border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-white">
                {title.split(' ').slice(0, 2).join(' ')} <span className="text-[#FFD700]">{title.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Professionals Grid */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
                <p className="text-gray-300 text-lg">Chargement des professionnels...</p>
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {professionals.map((professional) => (
                  <div key={professional.id} className="animate-fade-in">
                    <HairdresserCard 
                      id={professional.id}
                      name={professional.name}
                      photo={professional.image_url}
                      tags={professional.specialties}
                      rating={professional.rating}
                      experience={professional.experience}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-300 text-lg mb-4">
                  Aucun {gender === 'male' ? 'coiffeur' : 'coiffeuse'} trouvé pour cette catégorie.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Nos professionnels seront bientôt disponibles sur la plateforme.
                </p>
                <Button onClick={() => navigate('/auth')} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300">
                  Être notifié de leur arrivée
                </Button>
              </div>
            )}
            
            <div className="text-center mt-16">
              <p className="text-gray-300 mb-6">
                Vous ne trouvez pas votre créneau idéal ? Contactez-nous directement
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                  <p className="font-semibold text-white">📞 Téléphone</p>
                  <p className="text-[#FFD700]">+1 (873) 655-5275</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#FFD700]/30 hover:border-[#FFD700]/60 transition-all duration-300">
                  <p className="font-semibold text-white">⏰ Horaires</p>
                  <p className="text-[#FFD700]">9h-21h du lundi au samedi</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProfessionalsList;