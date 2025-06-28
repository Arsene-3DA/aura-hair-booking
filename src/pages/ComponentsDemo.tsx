
import { useState } from 'react';
import HeroLanding from '@/components/HeroLanding';
import HairdresserCard from '@/components/HairdresserCard';
import BookingStepper from '@/components/BookingStepper';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import DashboardWidget from '@/components/DashboardWidget';
import MobileDrawer from '@/components/MobileDrawer';
import { useToast } from '@/components/ToastNotification';
import { SkeletonCard } from '@/components/SkeletonLoader';
import { updateSEOMeta } from '@/utils/seo';
import { Button } from '@/components/ui/button';
import { Calendar, User, Sparkles, Wallet, Scissors } from 'lucide-react';

const ComponentsDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();

  // Données de démonstration
  const steps = ['Sélection', 'Créneau', 'Confirmation', 'Paiement'];
  const appointments = [
    { id: '1', time: '10:00', client: 'Marie D.', status: 'confirmed' as const },
    { id: '2', time: '14:00', client: 'Jean P.', status: 'pending' as const },
    { id: '3', time: '16:00', client: 'Anna M.', status: 'cancelled' as const },
  ];
  
  const sparklineData = [10, 25, 15, 40, 30, 55, 45, 60];

  // Mettre à jour les meta SEO
  useState(() => {
    updateSEOMeta({
      title: "Démonstration Composants - SalonBook",
      description: "Découvrez tous les composants premium de SalonBook",
      hairdresserName: "Marie Dupont",
      siteName: "SalonBook Premium"
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Landing */}
      <HeroLanding />

      {/* Démonstration des composants */}
      <div className="container mx-auto px-4 py-16 space-y-16">
        
        {/* Stepper */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-luxury-charcoal">Stepper de Réservation</h2>
          <BookingStepper currentStep={currentStep} steps={steps} />
          <div className="flex space-x-4 mt-6">
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>
              Précédent
            </Button>
            <Button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}>
              Suivant
            </Button>
          </div>
        </section>

        {/* Cartes Coiffeur */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-luxury-charcoal">Cartes Coiffeur</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HairdresserCard
              id="demo-1"
              name="Marie Dupont"
              photo="https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop&crop=face"
              tags={['Coupe', 'Couleur', 'Brushing']}
              rating={5}
              onChoose={() => showToast('success', 'Marie Dupont sélectionnée !')}
            />
            <HairdresserCard
              id="demo-2"
              name="Jean Martin"
              photo="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face"
              tags={['Barbe', 'Coupe Homme']}
              rating={4}
              onChoose={() => showToast('info', 'Jean Martin disponible demain')}
            />
            <SkeletonCard />
          </div>
        </section>

        {/* Dashboard Widgets */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-luxury-charcoal">Widgets Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DashboardWidget
              title="Revenus"
              value="€2,450"
              change="+12%"
              isPositive={true}
              sparklineData={sparklineData}
            />
            <DashboardWidget
              title="Réservations"
              value="45"
              change="+8%"
              isPositive={true}
              sparklineData={[20, 35, 25, 50, 40, 65, 55, 70]}
            />
            <DashboardWidget
              title="Annulations"
              value="3"
              change="-5%"
              isPositive={false}
              sparklineData={[15, 10, 20, 8, 12, 5, 8, 3]}
            />
          </div>
        </section>

        {/* Calendrier */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-luxury-charcoal">Calendrier Semaine</h2>
          <WeeklyCalendar appointments={appointments} />
        </section>

        {/* Boutons de test */}
        <section>
          <h2 className="text-3xl font-bold mb-8 text-luxury-charcoal">Tests Interactifs</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsDrawerOpen(true)}>
              <User className="h-5 w-5 mr-2" />
              Ouvrir Drawer Mobile
            </Button>
            <Button onClick={() => showToast('success', 'Réservation confirmée !')}>
              <Calendar className="h-5 w-5 mr-2" />
              Toast Success
            </Button>
            <Button onClick={() => showToast('error', 'Erreur de connexion')}>
              <Scissors className="h-5 w-5 mr-2" />
              Toast Error
            </Button>
            <Button onClick={() => showToast('info', 'Nouveau message reçu')}>
              <Sparkles className="h-5 w-5 mr-2" />
              Toast Info
            </Button>
          </div>
        </section>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl">
            <User className="h-6 w-6 text-luxury-gold-500" />
            <span className="font-medium">Mon Profil</span>
          </div>
          <div className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl">
            <Calendar className="h-6 w-6 text-luxury-gold-500" />
            <span className="font-medium">Mes Réservations</span>
          </div>
          <div className="flex items-center space-x-3 p-4 hover:bg-gray-50 rounded-xl">
            <Wallet className="h-6 w-6 text-luxury-gold-500" />
            <span className="font-medium">Paiements</span>
          </div>
        </div>
      </MobileDrawer>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default ComponentsDemo;
