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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-card p-4 rounded-lg border">
        <div className="text-center lg:text-left">
          <h2 className="text-lg font-semibold">
            {format(selectedWeek, "'Semaine du' d MMMM yyyy", { locale: fr })}
          </h2>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Précédente</span>
          </Button>
          <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <span className="hidden sm:inline mr-1">Suivante</span>
            <ChevronRight className="h-4 w-4" />
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Rendez-vous</h3>
              <p className="text-2xl font-bold text-primary">
                {events.filter(e => e.type === 'booking').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Disponible</h3>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.type === 'availability').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">Occupé</h3>
              <p className="text-2xl font-bold text-red-600">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">En attente</h3>
              <p className="text-2xl font-bold text-orange-600">
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