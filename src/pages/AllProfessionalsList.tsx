import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HairdresserCard from '@/components/HairdresserCard';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
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
  salon_address: string;
  gender: string;
  email: string;
  phone?: string;
  is_active: boolean;
}
const AllProfessionalsList = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Charger tous les professionnels depuis Supabase
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        console.log('Loading all professionals...');
        const {
          data,
          error
        } = await supabase.from('hairdressers').select(`
            id,
            auth_id,
            name,
            email,
            phone,
            salon_address,
            bio,
            website,
            instagram,
            specialties,
            rating,
            image_url,
            experience,
            location,
            gender,
            is_active
          `).eq('is_active', true).not('auth_id', 'is', null) // Exclure les données de test (auth_id null)
        .order('rating', {
          ascending: false
        });
        if (error) {
          console.error('Erreur lors du chargement des professionnels:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les professionnels",
            variant: "destructive"
          });
          return;
        }
        console.log('Data received from Supabase:', data);

        // Mapper les données Supabase vers l'interface Professional
        const mappedProfessionals: Professional[] = (data || []).map(item => ({
          id: item.auth_id || item.id,
          name: item.name,
          specialties: item.specialties || [],
          rating: item.rating || 5.0,
          image_url: item.image_url || '/placeholder.svg',
          experience: item.experience || '',
          location: item.salon_address || item.location || '',
          salon_address: item.salon_address || '',
          gender: item.gender || '',
          email: item.email,
          phone: item.phone || undefined,
          is_active: item.is_active || false
        }));
        setProfessionals(mappedProfessionals);
        setFilteredProfessionals(mappedProfessionals);
        console.log('Professionnels chargés:', mappedProfessionals.length, mappedProfessionals);
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    loadProfessionals();
  }, [toast]);

  // Filtrer les professionnels en temps réel selon la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfessionals(professionals);
    } else {
      const filtered = professionals.filter(professional => professional.name.toLowerCase().includes(searchQuery.toLowerCase()) || professional.specialties.some(specialty => specialty.toLowerCase().includes(searchQuery.toLowerCase())) || professional.location.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredProfessionals(filtered);
    }
  }, [searchQuery, professionals]);
  return <div className="min-h-screen">
      <Header />
      <main>
        {/* Header Section */}
        <section className="bg-gradient-to-br from-gold-50 via-orange-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">
                Nos <span className="gradient-text">Professionnels</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Découvrez notre équipe d'experts qualifiés et réservez directement
              </p>
              
              {/* Barre de recherche */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input type="text" placeholder="Rechercher par nom, spécialité ou lieu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 border-gray-300 rounded-full h-12 text-black placeholder:text-gray-500 focus:border-gold-500 focus:ring-gold-500 bg-slate-950" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professionals Grid */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {loading ? <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Chargement des professionnels...</p>
              </div> : <>
                {/* Résultats de recherche */}
                {searchQuery && <div className="mb-6 text-center">
                    <p className="text-gray-600">
                      {filteredProfessionals.length} professionnel{filteredProfessionals.length > 1 ? 's' : ''} trouvé{filteredProfessionals.length > 1 ? 's' : ''}
                      {searchQuery && ` pour "${searchQuery}"`}
                    </p>
                  </div>}
                
                {filteredProfessionals.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProfessionals.map(professional => <div key={professional.id} className="animate-fade-in">
                        <HairdresserCard id={professional.id} name={professional.name} photo={professional.image_url} tags={professional.specialties} rating={professional.rating} experience={professional.experience} />
                      </div>)}
                  </div> : searchQuery ? <div className="text-center py-16">
                    <p className="text-gray-600 text-lg mb-4">
                      Aucun professionnel trouvé pour "{searchQuery}"
                    </p>
                    <p className="text-gray-500 text-sm">
                      Essayez avec d'autres mots-clés ou parcourez tous nos professionnels
                    </p>
                  </div> : <div className="text-center py-16">
                    <p className="text-gray-600 text-lg mb-4">
                      Aucun professionnel disponible pour le moment
                    </p>
                  </div>}
              </>}
            
            {/* Contact Info */}
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
    </div>;
};
export default AllProfessionalsList;