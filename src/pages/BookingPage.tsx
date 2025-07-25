import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Euro } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface Stylist {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

const BookingPage = () => {
  const { serviceId, stylistId } = useParams();
  const navigate = useNavigate();
  const { createBooking, loading } = useBookings();
  
  const [service, setService] = useState<Service | null>(null);
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (serviceId) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('*')
          .eq('id', serviceId)
          .single();
        setService(serviceData);
      }

      if (stylistId) {
        const { data: stylistData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('user_id', stylistId)
          .single();
        setStylist(stylistData);
      }
    };

    fetchData();
  }, [serviceId, stylistId]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !stylistId || !serviceId) return;

    const scheduledAt = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes));

    const result = await createBooking({
      stylist_id: stylistId,
      service_id: serviceId,
      scheduled_at: scheduledAt.toISOString()
    });

    if (result.success) {
      navigate('/app/bookings');
    }
  };

  const isFormValid = selectedDate && selectedTime && stylistId && serviceId;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Réserver un rendez-vous</h1>
        </div>

        {service && (
          <Card>
            <CardHeader>
              <CardTitle>Service sélectionné</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{service.name}</h3>
                {service.description && (
                  <p className="text-muted-foreground">{service.description}</p>
                )}
              </div>
              <div className="flex gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {service.price}€
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {service.duration} min
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {stylist && (
          <Card>
            <CardHeader>
              <CardTitle>Coiffeur sélectionné</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  {stylist.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="font-medium">{stylist.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Choisir une date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              locale={fr}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Créneaux disponibles - {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Notes (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ajoutez des notes pour votre coiffeur..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Création...' : 'Confirmer la réservation'}
        </Button>
      </div>
    </div>
  );
};

export default BookingPage;