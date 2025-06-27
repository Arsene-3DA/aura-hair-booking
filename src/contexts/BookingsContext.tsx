
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Booking {
  id: number;
  time: string;
  clientName: string;
  phone: string;
  email: string;
  service: string;
  status: 'en_attente' | 'confirmé' | 'refusé';
  date: string;
  comments: string;
  hairdresserId: number;
  bookingDate: string;
  createdAt: string;
  expiresAt?: string; // Pour le timer de 30 minutes
}

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  getBookingsForHairdresser: (hairdresserId: number) => Booking[];
  getBookingsForDate: (hairdresserId: number, date: string) => Booking[];
  getAllBookingsByDate: (hairdresserId: number) => { [date: string]: Booking[] };
  updateBookingStatus: (bookingId: number, status: 'en_attente' | 'confirmé' | 'refusé') => void;
  getPendingBookings: (hairdresserId: number) => Booking[];
  getPendingBookingsCount: (hairdresserId: number) => number;
  cleanExpiredBookings: () => void;
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
        bookingDate: todayDateString,
        createdAt: new Date().toISOString()
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
        bookingDate: todayDateString,
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        time: '14:00',
        clientName: 'Sophie Laurent',
        phone: '06 11 22 33 44',
        email: 'sophie.laurent@email.com',
        service: 'Couleur + Coupe',
        status: 'en_attente',
        date: 'Aujourd\'hui',
        comments: 'Souhaite passer au blond',
        hairdresserId: 1,
        bookingDate: todayDateString,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    ];
  });

  // Nettoyer les réservations expirées toutes les minutes
  useEffect(() => {
    const interval = setInterval(cleanExpiredBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('Sauvegarde des réservations:', bookings);
    localStorage.setItem('hairSalonBookings', JSON.stringify(bookings));
  }, [bookings]);

  const cleanExpiredBookings = () => {
    const now = new Date();
    setBookings(prev => {
      const filtered = prev.filter(booking => {
        if (booking.status === 'en_attente' && booking.expiresAt) {
          const expiresAt = new Date(booking.expiresAt);
          if (now > expiresAt) {
            console.log(`Réservation expirée supprimée: ${booking.id}`);
            return false;
          }
        }
        return true;
      });
      return filtered;
    });
  };

  const addBooking = (newBooking: Omit<Booking, 'id'>) => {
    const id = Math.max(...bookings.map(b => b.id), 0) + 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    
    const bookingWithId = { 
      ...newBooking, 
      id,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'en_attente' as const
    };
    
    console.log('Ajout nouvelle réservation:', bookingWithId);
    
    setBookings(prev => {
      const updated = [...prev, bookingWithId];
      console.log('Toutes les réservations après ajout:', updated);
      return updated;
    });
  };

  const updateBookingStatus = (bookingId: number, status: 'en_attente' | 'confirmé' | 'refusé') => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        const updatedBooking = { ...booking, status };
        // Supprimer l'expiration si confirmé ou refusé
        if (status !== 'en_attente') {
          delete updatedBooking.expiresAt;
        }
        return updatedBooking;
      }
      return booking;
    }));
  };

  const getBookingsForHairdresser = (hairdresserId: number) => {
    const result = bookings.filter(booking => booking.hairdresserId === hairdresserId);
    return result;
  };

  const getBookingsForDate = (hairdresserId: number, date: string) => {
    const result = bookings.filter(booking => 
      booking.hairdresserId === hairdresserId && booking.bookingDate === date
    );
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
    
    return bookingsByDate;
  };

  const getPendingBookings = (hairdresserId: number) => {
    return bookings.filter(booking => 
      booking.hairdresserId === hairdresserId && booking.status === 'en_attente'
    );
  };

  const getPendingBookingsCount = (hairdresserId: number) => {
    return getPendingBookings(hairdresserId).length;
  };

  return (
    <BookingsContext.Provider value={{
      bookings,
      addBooking,
      getBookingsForHairdresser,
      getBookingsForDate,
      getAllBookingsByDate,
      updateBookingStatus,
      getPendingBookings,
      getPendingBookingsCount,
      cleanExpiredBookings
    }}>
      {children}
    </BookingsContext.Provider>
  );
};
