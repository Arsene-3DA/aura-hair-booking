
import HairdresserCard from './HairdresserCard';

// Sample data for hairdressers
const hairdressers = [
  {
    id: 1,
    name: "Anna Martin",
    specialties: ["Coupe Femme", "Couleur", "Balayage"],
    rating: 4.9,
    image: "",
    availability: "Aujourd'hui dès 14h",
    experience: "8 ans d'expérience"
  },
  {
    id: 2,
    name: "Julie Dubois",
    specialties: ["Soins", "Extensions", "Coiffage"],
    rating: 4.8,
    image: "",
    availability: "Demain dès 9h",
    experience: "6 ans d'expérience"
  },
  {
    id: 3,
    name: "Marc Rousseau",
    specialties: ["Coupe Homme", "Barbe", "Styling"],
    rating: 4.9,
    image: "",
    availability: "Aujourd'hui dès 16h",
    experience: "12 ans d'expérience"
  },
  {
    id: 4,
    name: "Sophie Laurent",
    specialties: ["Coupe", "Couleur", "Mèches"],
    rating: 4.7,
    image: "",
    availability: "Lundi dès 10h",
    experience: "5 ans d'expérience"
  },
  {
    id: 5,
    name: "Thomas Moreau",
    specialties: ["Coupe Moderne", "Dégradé", "Entretien"],
    rating: 4.8,
    image: "",
    availability: "Aujourd'hui dès 15h",
    experience: "7 ans d'expérience"
  },
  {
    id: 6,
    name: "Camille Petit",
    specialties: ["Mariée", "Événement", "Chignon"],
    rating: 5.0,
    image: "",
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
