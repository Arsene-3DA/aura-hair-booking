
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
        
        const { data, error } = await supabase
          .from('hairdressers')
          .select('*')
          .eq('gender', gender)
          .eq('is_active', true)
          .order('rating', { ascending: false });

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

        // Mapper les données Supabase vers l'interface Professional
        const mappedProfessionals: Professional[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          specialties: item.specialties || [],
          rating: item.rating || 4.5,
          image_url: item.image_url || '/placeholder.svg',
          experience: item.experience || '',
          location: item.location || '',
          gender: item.gender as 'male' | 'female',
          email: item.email,
          phone: item.phone || undefined,
          is_active: item.is_active || false
        }));

        setProfessionals(mappedProfessionals);
        console.log('Professionnels chargés:', mappedProfessionals.length, mappedProfessionals);
        
        if (mappedProfessionals.length === 0) {
          toast({
            title: "Information",
            description: `Aucun ${gender === 'male' ? 'coiffeur' : 'coiffeuse'} trouvé. Utilisez le bouton 'Initialiser' pour créer des comptes de test.`,
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
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Header Section */}
        <section className="bg-gradient-to-br from-gold-50 via-orange-50 to-white py-16">
          <div className="container mx-auto px-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                {title.split(' ').slice(0, 2).join(' ')} <span className="gradient-text">{title.split(' ').slice(2).join(' ')}</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Professionals Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Chargement des professionnels...</p>
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
                <p className="text-gray-600 text-lg mb-4">
                  Aucun {gender === 'male' ? 'coiffeur' : 'coiffeuse'} trouvé pour cette catégorie.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Utilisez le bouton "Initialiser" sur la page de connexion pour créer des comptes de test.
                </p>
                <Button onClick={() => navigate('/auth')} className="bg-gradient-gold text-white">
                  Aller à la page de connexion
                </Button>
              </div>
            )}
            
            <div className="text-center mt-16">
              <p className="text-gray-600 mb-6">
                Vous ne trouvez pas votre créneau idéal ? Contactez-nous directement
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="bg-gradient-to-r from-gold-50 to-orange-50 p-4 rounded-lg border border-gold-200">
                  <p className="font-semibold text-gray-900">📞 Téléphone</p>
                  <p className="text-gold-600">01 23 45 67 89</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-gold-50 p-4 rounded-lg border border-orange-200">
                  <p className="font-semibold text-gray-900">⏰ Horaires</p>
                  <p className="text-orange-600">9h-19h du lundi au samedi</p>
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
