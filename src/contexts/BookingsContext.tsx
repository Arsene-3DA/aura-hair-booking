
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  updateBookingStatus: (bookingId: number, status: 'nouveau' | 'confirmé') => void;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const todayDateString = getTodayDateString();
  const tomorrowDateString = getTomorrowDateString();
  
  // Charger les réservations depuis localStorage au démarrage
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const savedBookings = localStorage.getItem('hairSalonBookings');
    if (savedBookings) {
      try {
        const parsed = JSON.parse(savedBookings);
        console.log('Réservations chargées depuis localStorage:', parsed);
        return parsed;
      } catch (error) {
        console.error('Erreur lors du chargement des réservations:', error);
      }
    }
    
    // Données initiales si aucune réservation sauvegardée
    return [
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
        bookingDate: tomorrowDateString
      }
    ];
  });

  // Sauvegarder les réservations dans localStorage à chaque changement
  useEffect(() => {
    console.log('Sauvegarde des réservations:', bookings);
    localStorage.setItem('hairSalonBookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (newBooking: Omit<Booking, 'id'>) => {
    const id = Math.max(...bookings.map(b => b.id), 0) + 1;
    const bookingWithId = { ...newBooking, id };
    
    console.log('Ajout nouvelle réservation:', bookingWithId);
    console.log('Coiffeur ID:', newBooking.hairdresserId);
    
    setBookings(prev => {
      const updated = [...prev, bookingWithId];
      console.log('Toutes les réservations après ajout:', updated);
      return updated;
    });
  };

  const updateBookingStatus = (bookingId: number, status: 'nouveau' | 'confirmé') => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status } : booking
    ));
  };

  const getBookingsForHairdresser = (hairdresserId: number) => {
    console.log('Recherche des réservations pour le coiffeur ID:', hairdresserId);
    console.log('Toutes les réservations disponibles:', bookings);
    
    const result = bookings.filter(booking => {
      console.log(`Réservation ${booking.id}: hairdresserId=${booking.hairdresserId}, recherche=${hairdresserId}`);
      return booking.hairdresserId === hairdresserId;
    });
    
    console.log(`Réservations trouvées pour coiffeur ${hairdresserId}:`, result);
    return result;
  };

  const getBookingsForDate = (hairdresserId: number, date: string) => {
    console.log(`Recherche réservations pour coiffeur ${hairdresserId} à la date ${date}`);
    const result = bookings.filter(booking => 
      booking.hairdresserId === hairdresserId && booking.bookingDate === date
    );
    console.log(`Réservations trouvées:`, result);
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
    
    console.log('Réservations groupées par date pour coiffeur', hairdresserId, ':', bookingsByDate);
    return bookingsByDate;
  };

  return (
    <BookingsContext.Provider value={{
      bookings,
      addBooking,
      getBookingsForHairdresser,
      getBookingsForDate,
      getAllBookingsByDate,
      updateBookingStatus
    }}>
      {children}
    </BookingsContext.Provider>
  );
};
