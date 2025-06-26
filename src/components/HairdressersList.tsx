
import HairdresserCard from './HairdresserCard';

// Sample data for hairdressers
const hairdressers = [
  {
    id: 1,
    name: "Anna Martin",
    specialties: ["Coupe Femme", "Couleur", "Balayage"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop&crop=face",
    availability: "Aujourd'hui dès 14h",
    experience: "8 ans d'expérience"
  },
  {
    id: 2,
    name: "Julie Dubois",
    specialties: ["Soins", "Extensions", "Coiffage"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop&crop=face",
    availability: "Demain dès 9h",
    experience: "6 ans d'expérience"
  },
  {
    id: 3,
    name: "Marc Rousseau",
    specialties: ["Coupe Homme", "Barbe", "Styling"],
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    availability: "Aujourd'hui dès 16h",
    experience: "12 ans d'expérience"
  },
  {
    id: 4,
    name: "Sophie Laurent",
    specialties: ["Coupe", "Couleur", "Mèches"],
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    availability: "Lundi dès 10h",
    experience: "5 ans d'expérience"
  },
  {
    id: 5,
    name: "Thomas Moreau",
    specialties: ["Coupe Moderne", "Dégradé", "Entretien"],
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    availability: "Aujourd'hui dès 15h",
    experience: "7 ans d'expérience"
  },
  {
    id: 6,
    name: "Camille Petit",
    specialties: ["Mariée", "Événement", "Chignon"],
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    availability: "Sur RDV",
    experience: "10 ans d'expérience"
  }
];

const HairdressersList = () => {
  return (
    <section id="coiffeurs" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Nos <span className="gradient-text">Experts</span> Coiffeurs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez notre équipe de professionnels passionnés, 
            chacun spécialisé dans son domaine pour vous offrir le meilleur service.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hairdressers.map((hairdresser) => (
            <div key={hairdresser.id} className="animate-fade-in">
              <HairdresserCard hairdresser={hairdresser} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
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
  );
};

export default HairdressersList;
