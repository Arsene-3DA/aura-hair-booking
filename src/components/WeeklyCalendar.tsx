
import { Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  time: string;
  client: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface WeeklyCalendarProps {
  appointments?: Appointment[];
}

const WeeklyCalendar = ({ appointments = [] }: WeeklyCalendarProps) => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const hours = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      pending: 'bg-gray-500 text-white',
      confirmed: 'bg-purple-500 text-white',
      cancelled: 'bg-red-500 text-white'
    };
    
    return styles[status];
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 text-luxury-gold-500 mr-3" />
        <h3 className="text-2xl font-bold text-luxury-charcoal">Planning Semaine</h3>
      </div>

      <div className="grid grid-cols-8 gap-2">
        {/* Header */}
        <div className="p-3"></div>
        {days.map(day => (
          <div key={day} className="p-3 text-center font-semibold text-luxury-charcoal border-b-2 border-luxury-gold-200">
            {day}
          </div>
        ))}

        {/* Time slots */}
        {hours.map(hour => (
          <>
            <div key={hour} className="p-3 text-sm font-medium text-luxury-charcoal/70 border-r border-gray-200">
              {hour}
            </div>
            {days.map((day, dayIndex) => {
              const appointment = appointments.find(apt => 
                apt.time === hour && Math.random() > 0.7 // Simulation
              );
              
              return (
                <div key={`${day}-${hour}`} className="p-2 border border-gray-100 min-h-16">
                  {appointment && (
                    <div className={`
                      px-3 py-2 rounded-lg text-xs font-medium
                      ${getStatusBadge(appointment.status)}
                    `}>
                      <div className="font-semibold">{appointment.client}</div>
                      <div className="opacity-80">{appointment.time}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
