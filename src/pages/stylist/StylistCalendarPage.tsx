import { useState } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useWeeklyCalendar } from '@/hooks/useWeeklyCalendar';
import { useAvailability } from '@/hooks/useAvailability';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import WeeklyCalendar from '@/components/WeeklyCalendar';

const StylistCalendarPage = () => {
  const { userProfile } = useRoleAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { events, loading } = useWeeklyCalendar(userProfile?.user_id, selectedWeek);
  const { createAvailability } = useAvailability(userProfile?.user_id);

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Planning
          </h1>
          <p className="text-muted-foreground">
            Gérez vos disponibilités et rendez-vous
          </p>
        </div>
        <Button onClick={() => createAvailability({
          start_at: new Date().toISOString(),
          end_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        })}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter créneaux
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
        <Button variant="outline" onClick={goToPreviousWeek}>
          ← Semaine précédente
        </Button>
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {format(selectedWeek, "'Semaine du' d MMMM yyyy", { locale: fr })}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToCurrentWeek}>
            Aujourd'hui
          </Button>
          <Button variant="outline" onClick={goToNextWeek}>
            Semaine suivante →
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <WeeklyCalendar />

      {/* Events Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Rendez-vous cette semaine</h3>
          <p className="text-2xl font-bold text-primary">
            {events.filter(e => e.type === 'booking').length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="font-semibold mb-2">Créneaux disponibles</h3>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.type === 'availability').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StylistCalendarPage;