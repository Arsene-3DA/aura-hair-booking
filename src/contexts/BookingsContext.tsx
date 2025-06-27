
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
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([
    // Données initiales pour Thomas Moreau (id: 1)
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
      bookingDate: '2024-12-27'
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
      bookingDate: '2024-12-27'
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
      bookingDate: '2024-12-27'
    }
  ]);

  const addBooking = (newBooking: Omit<Booking, 'id'>) => {
    const id = Math.max(...bookings.map(b => b.id), 0) + 1;
    setBookings(prev => [...prev, { ...newBooking, id }]);
  };

  const getBookingsForHairdresser = (hairdresserId: number) => {
    return bookings.filter(booking => booking.hairdresserId === hairdresserId);
  };

  const getBookingsForDate = (hairdresserId: number, date: string) => {
    return bookings.filter(booking => 
      booking.hairdresserId === hairdresserId && booking.bookingDate === date
    );
  };

  return (
    <BookingsContext.Provider value={{
      bookings,
      addBooking,
      getBookingsForHairdresser,
      getBookingsForDate
    }}>
      {children}
    </BookingsContext.Provider>
  );
};
