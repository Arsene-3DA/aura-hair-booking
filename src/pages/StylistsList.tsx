import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StylistCard } from '@/components/StylistCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateId, sanitizeSearchInput } from '@/utils/authHelper';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users,
  Loader2 
} from 'lucide-react';

interface Hairdresser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  specialties: string[];
  experience?: string;
  image_url?: string;
  rating: number;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const StylistsList = () => {
  const [hairdressers, setHairdressers] = useState<Hairdresser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock services data - you can later create a services table
  const mockServices = [
    { id: '1', name: 'Coupe Femme', price: 45, duration: 60 },
    { id: '2', name: 'Coupe Homme', price: 25, duration: 30 },
    { id: '3', name: 'Coloration', price: 80, duration: 120 },
    { id: '4', name: 'Mèches', price: 60, duration: 90 },
    { id: '5', name: 'Brushing', price: 25, duration: 30 }
  ];

  useEffect(() => {
    loadHairdressers();
  }, []);

  const loadHairdressers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('hairdressers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;

      setHairdressers(data || []);
    } catch (error: any) {
      console.error('Error loading hairdressers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des coiffeurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique specialties and locations for filters
  const allSpecialties = Array.from(
    new Set(hairdressers.flatMap(h => h.specialties))
  ).filter(Boolean);

  const allLocations = Array.from(
    new Set(hairdressers.map(h => h.location).filter(Boolean))
  );

  // Filter hairdressers
  const filteredHairdressers = hairdressers.filter(hairdresser => {
    const matchesSearch = !searchTerm || 
      hairdresser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hairdresser.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecialty = !selectedSpecialty || 
      hairdresser.specialties.includes(selectedSpecialty);

    const matchesLocation = !selectedLocation || 
      hairdresser.location === selectedLocation;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const handleBooking = (stylistId: string) => {
    if (!validateId(stylistId)) {
      console.error('ID styliste invalide pour réservation:', stylistId);
      toast({
        title: "Erreur",
        description: "ID du coiffeur manquant ou invalide",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que le styliste existe dans nos données
    const stylist = hairdressers.find(h => h.id === stylistId);
    if (!stylist) {
      console.error('Styliste non trouvé dans les données:', stylistId);
      toast({
        title: "Erreur", 
        description: "Coiffeur non trouvé",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Navigation vers réservation:', { stylistId, stylist: stylist.name });
    navigate(`/reservation/${stylistId}`, {
      state: { 
        hairdresser: stylist 
      }
    });
  };

  const handleViewProfile = (stylistId: string) => {
    if (!validateId(stylistId)) {
      console.error('ID styliste invalide pour profil:', stylistId);
      toast({
        title: "Erreur",
        description: "ID du coiffeur manquant ou invalide",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que le styliste existe
    const stylist = hairdressers.find(h => h.id === stylistId);
    if (!stylist) {
      console.error('Styliste non trouvé pour profil:', stylistId);
      toast({
        title: "Erreur",
        description: "Coiffeur non trouvé", 
        variant: "destructive"
      });
      return;
    }
    
    console.log('Navigation vers profil:', { stylistId, stylist: stylist.name });
    navigate(`/stylist/${stylistId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
          <p className="text-muted-foreground">Recherche des coiffeurs disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Nos Coiffeurs</h1>
          <p className="text-muted-foreground">
            Trouvez le coiffeur parfait pour votre style
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {filteredHairdressers.length} coiffeur{filteredHairdressers.length > 1 ? 's' : ''} disponible{filteredHairdressers.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un coiffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value))}
                className="pl-10"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="">Toutes les spécialités</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="">Toutes les locations</option>
              {allLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Effacer les filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredHairdressers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun coiffeur trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={clearFilters} variant="outline">
              Voir tous les coiffeurs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHairdressers.map((hairdresser) => (
            <StylistCard
              key={hairdresser.id}
              id={hairdresser.id}
              name={hairdresser.name}
              avatar_url={hairdresser.image_url}
              email={hairdresser.email}
              phone={hairdresser.phone}
              location={hairdresser.location}
              specialties={hairdresser.specialties}
              rating={hairdresser.rating}
              experience={hairdresser.experience}
              isActive={hairdresser.is_active}
              onBooking={handleBooking}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistsList;