import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderClient } from '@/components/client/HeaderClient';
import { MonthlyCalendar } from '@/components/client/MonthlyCalendar';
import { ReservationDrawer } from '@/components/client/ReservationDrawer';
import { UpcomingTimeline } from '@/components/client/UpcomingTimeline';
import { useRealtimeBookings, RealtimeBooking } from '@/hooks/useRealtimeBookings';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const ClientLayout = () => {
  const { user } = useRoleAuth();
  const { bookings, loading, refetch } = useRealtimeBookings(user?.id);
  const [selectedBooking, setSelectedBooking] = useState<RealtimeBooking | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleEventClick = (booking: RealtimeBooking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  const handleNewBookingClick = () => {
    // TODO: Implement booking creation flow
    console.log('New booking clicked');
  };

  const handleBookingUpdated = () => {
    refetch();
  };

  // Count pending notifications
  const pendingNotifications = bookings.filter(
    booking => booking.status === 'en_attente'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <HeaderClient 
        onNewBookingClick={handleNewBookingClick}
        pendingNotifications={pendingNotifications}
      />
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <MonthlyCalendar 
              bookings={bookings}
              onEventClick={handleEventClick}
              loading={loading}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <UpcomingTimeline 
              bookings={bookings}
              loading={loading}
            />
          </div>
        </div>
        
        {/* Outlet for nested routes like History */}
        <Outlet />
      </main>

      {/* Reservation Details Drawer */}
      <ReservationDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        booking={selectedBooking}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
};

export default ClientLayout;