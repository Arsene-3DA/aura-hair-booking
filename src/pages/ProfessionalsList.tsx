
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HairdresserCard from '@/components/HairdresserCard';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

// Separated hairdressers by gender avec possibilité d'ajouter de nouveaux
const baseProfessionals = {
  male: [
    {
      id: 3,
      name: "Marc Rousseau",
      specialties: ["Coupe Homme", "Barbe", "Styling"],
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
      availability: "Aujourd'hui dès 16h",
      experience: "12 ans d'expérience",
      location: "Salon Premium - 15e arr.",
      gender: "male" as const
    },
    {
      id: 5,
      name: "Thomas Moreau", 
      specialties: ["Coupe Moderne", "Dégradé", "Entretien"],
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      availability: "Aujourd'hui dès 15h",
      experience: "7 ans d'expérience",
      location: "Salon Premium - 8e arr.",
      gender: "male" as const
    },
    {
      id: 7,
      name: "Pierre Martin",
      specialties: ["Coupe Classique", "Barbe", "Rasage"],
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      availability: "Demain dès 10h",
      experience: "15 ans d'expérience",
      location: "Salon Premium - 1er arr.",
      gender: "male" as const
    }
  ],
  female: [
    {
      id: 1,
      name: "Anna Martin",
      specialties: ["Coupe Femme", "Couleur", "Balayage"],
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop&crop=face",
      availability: "Aujourd'hui dès 14h",
      experience: "8 ans d'expérience",
      location: "Salon Premium - 16e arr.",
      gender: "female" as const
    },
    {
      id: 2,
      name: "Julie Dubois",
      specialties: ["Soins", "Extensions", "Coiffage"],
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face",
      availability: "Demain dès 9h",
      experience: "6 ans d'expérience",
      location: "Salon Premium - 7e arr.", 
      gender: "female" as const
    },
    {
      id: 4,
      name: "Sophie Laurent",
      specialties: ["Coupe", "Couleur", "Mèches"],
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
      availability: "Lundi dès 10h",
      experience: "5 ans d'expérience",
      location: "Salon Premium - 9e arr.",
      gender: "female" as const
    },
    {
      id: 6,
      name: "Camille Petit",
      specialties: ["Mariée", "Événement", "Chignon"],
      rating: 5.0,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      availability: "Sur RDV",
      experience: "10 ans d'expérience",
      location: "Salon Premium - 6e arr.",
      gender: "female" as const
    }
  ]
};

const ProfessionalsList = () => {
  const { gender } = useParams<{ gender?: 'male' | 'female' }>();
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState(baseProfessionals);
  
  console.log('Current gender parameter:', gender);
  console.log('Available professionals:', professionals);
  
  // Si pas de genre spécifié ou genre invalide, rediriger vers l'accueil
  useEffect(() => {
    if (!gender || !['male', 'female'].includes(gender)) {
      console.log('Invalid gender parameter, redirecting to home');
      navigate('/');
      return;
    }
  }, [gender, navigate]);

  // Charger les nouveaux professionnels ajoutés par l'admin depuis localStorage
  useEffect(() => {
    const loadAddedProfessionals = () => {
      try {
        const savedProfessionals = localStorage.getItem('addedProfessionals');
        if (savedProfessionals) {
          const parsed = JSON.parse(savedProfessionals);
          setProfessionals(prev => ({
            male: [...prev.male, ...parsed.male],
            female: [...prev.female, ...parsed.female]
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des professionnels:', error);
      }
    };

    loadAddedProfessionals();
  }, []);

  // Si pas de genre valide, ne rien afficher (useEffect va rediriger)
  if (!gender || !['male', 'female'].includes(gender)) {
    return null;
  }

  const currentProfessionals = professionals[gender];
  const title = gender === 'male' ? 'Nos Coiffeurs Experts' : 'Nos Coiffeuses Expertes';
  const subtitle = gender === 'male' 
    ? 'Spécialistes en coupe homme, barbe et styling masculin'
    : 'Spécialistes en coupe femme, couleur et coiffage';

  console.log('Rendering professionals for gender:', gender);
  console.log('Current professionals count:', currentProfessionals.length);

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
            {currentProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentProfessionals.map((professional) => (
                  <div key={professional.id} className="animate-fade-in">
                    <HairdresserCard 
                      name={professional.name}
                      photo={professional.image}
                      tags={professional.specialties}
                      rating={professional.rating}
                      onChoose={() => {
                        console.log('Professionnel choisi:', professional.name);
                        // TODO: Implement booking logic
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">Aucun professionnel trouvé pour cette catégorie.</p>
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
