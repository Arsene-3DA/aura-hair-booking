
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Booking {
  id: number;
  time: string;
  clientName: string;
  phone: string;
  email: string;
  service: string;
  status: 'nouveau' | 'confirmé';
  date: string;
  comments: string;
  hairdresserId: number;
  bookingDate: string; // Format: YYYY-MM-DD
}

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  getBookingsForHairdresser: (hairdresserId: number) => Booking[];
  getBookingsForDate: (hairdresserId: number, date: string) => Booking[];
  getAllBookingsByDate: (hairdresserId: number) => { [date: string]: Booking[] };
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

// Fonction utilitaire pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const todayDateString = getTodayDateString();
  
  const [bookings, setBookings] = useState<Booking[]>([
    // Données initiales pour Thomas Moreau (id: 1) - avec dates correctes
    {
      id: 1,
      time: '09:00',
      clientName: 'Marie Dubois',
      phone: '06 12 34 56 78',
      email: 'marie.dubois@email.com',
      service: 'Coupe Femme',
      status: 'confirmé',
      date: 'Aujourd\'hui',
      comments: 'Première visite, souhaite un changement de style',
      hairdresserId: 1,
      bookingDate: todayDateString
    },
    {
      id: 2,
      time: '10:30',
      clientName: 'Jean Martin',
      phone: '06 98 76 54 32',
      email: 'jean.martin@email.com',
      service: 'Coupe Homme',
      status: 'confirmé',
      date: 'Aujourd\'hui',
      comments: '',
      hairdresserId: 1,
      bookingDate: todayDateString
    },
    {
      id: 3,
      time: '14:00',
      clientName: 'Sophie Laurent',
      phone: '06 11 22 33 44',
      email: 'sophie.laurent@email.com',
      service: 'Couleur + Coupe',
      status: 'nouveau',
      date: 'Aujourd\'hui',
      comments: 'Souhaite passer au blond',
      hairdresserId: 1,
      bookingDate: todayDateString
    },
    // Ajout d'une réservation pour demain pour tester
    {
      id: 4,
      time: '15:30',
      clientName: 'Pierre Durand',
      phone: '06 55 44 33 22',
      email: 'pierre.durand@email.com',
      service: 'Coupe Homme',
      status: 'nouveau',
      date: 'Demain',
      comments: 'Coupe rapide avant un entretien',
      hairdresserId: 1,
      bookingDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  ]);

  const addBooking = (newBooking: Omit<Booking, 'id'>) => {
    const id = Math.max(...bookings.map(b => b.id), 0) + 1;
    console.log('Ajout nouvelle réservation:', { ...newBooking, id });
    setBookings(prev => {
      const updated = [...prev, { ...newBooking, id }];
      console.log('Réservations mises à jour:', updated);
      return updated;
    });
  };

  const getBookingsForHairdresser = (hairdresserId: number) => {
    const result = bookings.filter(booking => booking.hairdresserId === hairdresserId);
    console.log(`Réservations pour coiffeur ${hairdresserId}:`, result);
    return result;
  };

  const getBookingsForDate = (hairdresserId: number, date: string) => {
    const result = bookings.filter(booking => 
      booking.hairdresserId === hairdresserId && booking.bookingDate === date
    );
    console.log(`Réservations pour coiffeur ${hairdresserId} le ${date}:`, result);
    return result;
  };

  const getAllBookingsByDate = (hairdresserId: number) => {
    const hairdresserBookings = getBookingsForHairdresser(hairdresserId);
    const bookingsByDate: { [date: string]: Booking[] } = {};
    
    hairdresserBookings.forEach(booking => {
      if (!bookingsByDate[booking.bookingDate]) {
        bookingsByDate[booking.bookingDate] = [];
      }
      bookingsByDate[booking.bookingDate].push(booking);
    });
    
    console.log('Réservations groupées par date:', bookingsByDate);
    return bookingsByDate;
  };

  return (
    <BookingsContext.Provider value={{
      bookings,
      addBooking,
      getBookingsForHairdresser,
      getBookingsForDate,
      getAllBookingsByDate
    }}>
      {children}
    </BookingsContext.Provider>
  );
};
