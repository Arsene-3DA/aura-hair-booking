import { useState, Suspense } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import PageHeader from '@/components/PageHeader';
import InteractiveCalendar from '@/components/InteractiveCalendar';
import { validateUUID } from '@/utils/validateUUID';

const StylistCalendarPage = () => {
  const { userProfile } = useRoleAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { events, loading } = useWeeklyCalendar(userProfile?.user_id, selectedWeek);

  if (!userProfile?.user_id || !validateUUID(userProfile.user_id)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">ID utilisateur invalide</p>
      </div>
    );
  }

  const goToPreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Planning"
          description="Gérez vos disponibilités et rendez-vous"
          icon={<Calendar className="h-8 w-8" />}
          breadcrumbs={[
            { label: 'Dashboard', path: '/stylist' },
            { label: 'Calendrier' }
          ]}
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planning"
        description="Gérez vos disponibilités et rendez-vous"
        icon={<Calendar className="h-8 w-8" />}
        breadcrumbs={[
          { label: 'Dashboard', path: '/stylist' },
          { label: 'Calendrier' }
        ]}
      />

      {/* Week Navigation - AMÉLIORÉE POUR LISIBILITÉ */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-primary/5 to-secondary/5 p-8 rounded-xl border-2 border-primary/20 shadow-lg backdrop-blur-sm">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-primary mb-2 tracking-wide">
            📅 {format(selectedWeek, "'Semaine du' d MMMM yyyy", { locale: fr })}
          </h2>
          <p className="text-base text-muted-foreground font-medium">
            Gérez vos créneaux et consultez vos rendez-vous en temps réel
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-700"></div>
              <span className="font-medium">Disponible</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-700"></div>
              <span className="font-medium">Réservé</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-gray-500 rounded border-2 border-gray-700"></div>
              <span className="font-medium">Bloqué</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-orange-500 rounded border-2 border-orange-700"></div>
              <span className="font-medium">En attente</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={goToPreviousWeek}
            className="flex items-center gap-3 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg hover:bg-primary/10 border-2 border-primary/30 px-6 py-3 text-base font-semibold"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="hidden sm:inline">Semaine précédente</span>
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            onClick={goToCurrentWeek}
            className="flex items-center gap-3 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-base font-bold border-2 border-primary-foreground/20"
          >
            <Calendar className="h-6 w-6" />
            <span className="text-lg">📍 Aujourd'hui</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={goToNextWeek}
            className="flex items-center gap-3 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg hover:bg-primary/10 border-2 border-primary/30 px-6 py-3 text-base font-semibold"
          >
            <span className="hidden sm:inline">Semaine suivante</span>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Interactive Calendar */}
      <Suspense fallback={
        <div className="bg-card rounded-xl border p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      }>
        <InteractiveCalendar 
          stylistId={userProfile.user_id} 
          selectedWeek={selectedWeek} 
        />
      </Suspense>

      {/* Events Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rendez-vous</h3>
              <p className="text-3xl font-bold text-primary mt-1">
                {events.filter(e => e.type === 'booking').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Disponible</h3>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {events.filter(e => e.type === 'availability').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border border-red-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Occupé</h3>
              <p className="text-3xl font-bold text-red-600 mt-1">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">En attente</h3>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {events.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistCalendarPage;