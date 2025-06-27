import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, Mail, MessageSquare, Scissors, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useBookings } from '@/contexts/BookingsContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  hairdresser: {
    id: number;
    name: string;
    specialties: string[];
    gender?: 'male' | 'female';
  };
}

const allSpecialties = {
  male: [
    'Coupe Classique Homme',
    'Coupe Moderne/Tendance',
    'Dégradé',
    'Barbe & Styling',
    'Rasage Traditionnel',
    'Coupe Enfant',
    'Entretien & Soins'
  ],
  female: [
    'Coupe Femme Classique',
    'Coupe Moderne/Tendance', 
    'Coloration',
    'Mèches & Balayage',
    'Coiffure Mariage/Événement',
    'Extensions',
    'Défrisage/Lissage',
    'Soins Capillaires',
    'Chignon & Coiffage',
    'Coupe Enfant'
  ]
};

const BookingModal = ({ isOpen, onClose, hairdresser }: BookingModalProps) => {
  const { toast } = useToast();
  const { addBooking, getBookingsForDate } = useBookings();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    service: '',
    comments: ''
  });

  // Available time slots
  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Get booked slots for the selected date
  const getBookedSlots = () => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dayBookings = getBookingsForDate(hairdresser.id, dateKey);
    // Inclure tous les créneaux réservés ou en attente
    return dayBookings
      .filter(booking => booking.status === 'confirmé' || booking.status === 'en_attente')
      .map(booking => booking.time);
  };

  const bookedSlots = getBookedSlots();

  const handleTimeSelection = (time: string) => {
    if (!bookedSlots.includes(time)) {
      setSelectedTime(time);
      toast({
        title: "Créneau sélectionné",
        description: `${time} sélectionné pour votre réservation`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    const bookingDate = selectedDate.toISOString().split('T')[0];
    const newBooking = {
      time: selectedTime,
      clientName: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      email: formData.email,
      service: formData.service || 'Service non spécifié',
      date: selectedDate.toLocaleDateString('fr-FR'),
      comments: formData.comments,
      hairdresserId: hairdresser.id,
      bookingDate: bookingDate,
      status: 'en_attente' as const,
      createdAt: new Date().toISOString()
    };

    addBooking(newBooking);
    setShowConfirmation(true);
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      service: '',
      comments: ''
    });
    setSelectedDate(undefined);
    setSelectedTime('');
    setShowConfirmation(false);
    onClose();
  };

  const getAvailableSpecialties = () => {
    const genderSpecialties = allSpecialties[hairdresser.gender || 'female'];
    return [...hairdresser.specialties, ...genderSpecialties].filter((value, index, self) => self.indexOf(value) === index);
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-green-600">
              ✅ Demande envoyée !
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                En attente de validation
              </h3>
              <p className="text-gray-600">
                Votre demande de réservation a été envoyée à <strong>{hairdresser.name}</strong>
              </p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center text-orange-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Important</span>
              </div>
              <p className="text-sm text-orange-700">
                Le professionnel dispose de <strong>30 minutes</strong> pour valider votre demande.
                Vous recevrez une notification par email dès que la décision sera prise.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div><strong>Date :</strong> {selectedDate?.toLocaleDateString('fr-FR')}</div>
              <div><strong>Heure :</strong> {selectedTime}</div>
              <div><strong>Service :</strong> {formData.service}</div>
            </div>
            
            <Button onClick={handleClose} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center">
            <Scissors className="h-6 w-6 mr-2 text-gold-500" />
            Réserver avec {hairdresser.name}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez votre créneau et remplissez vos informations. Votre demande sera envoyée au professionnel pour validation
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar and Time Slots */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gold-500" />
                1. Sélectionnez une date
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-4">2. Choisissez votre heure</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time);
                    const isSelected = selectedTime === time;
                    
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : isBooked ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleTimeSelection(time)}
                        disabled={isBooked}
                        className={`${
                          isSelected 
                            ? "bg-gradient-gold text-white" 
                            : isBooked 
                            ? "opacity-50 cursor-not-allowed bg-gray-200" 
                            : "hover:bg-gold-50"
                        }`}
                      >
                        {time}
                        {isBooked && <span className="ml-1 text-xs">❌</span>}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ❌ = Créneau réservé • ⏰ = Disponible
                </p>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-gold-500" />
                3. Vos informations
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div>
                  <Label htmlFor="service">Type de coupe souhaité</Label>
                  <select
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Sélectionnez un service</option>
                    {getAvailableSpecialties().map((specialty) => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="comments" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Commentaires spéciaux (optionnel)
                  </Label>
                  <textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold-500"
                    rows={3}
                    placeholder="Précisions particulières, demandes spéciales..."
                  />
                </div>

                {selectedDate && selectedTime && (
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Récapitulatif de votre demande :</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Professionnel :</strong> {hairdresser.name}</p>
                      <p><strong>Date :</strong> {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><strong>Heure :</strong> {selectedTime}</p>
                      {formData.service && <p><strong>Service :</strong> {formData.service}</p>}
                    </div>
                    <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-700">
                      ⚠️ Cette demande sera envoyée au professionnel pour validation
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                    disabled={!selectedDate || !selectedTime}
                  >
                    📤 Envoyer la demande
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
