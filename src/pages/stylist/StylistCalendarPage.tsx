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

      {/* Week Navigation */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border border-border/50 shadow-sm">
        <div className="text-center lg:text-left">
          <h2 className="text-xl font-bold text-primary">
            {format(selectedWeek, "'Semaine du' d MMMM yyyy", { locale: fr })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos créneaux et consultez vos rendez-vous
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={goToPreviousWeek}
            className="flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-primary/5"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Précédente</span>
          </Button>
          <Button 
            variant="default" 
            size="lg" 
            onClick={goToCurrentWeek}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200 px-6"
          >
            <Calendar className="h-5 w-5" />
            <span>Aujourd'hui</span>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={goToNextWeek}
            className="flex items-center gap-2 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-primary/5"
          >
            <span className="hidden sm:inline">Suivante</span>
            <ChevronRight className="h-5 w-5" />
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