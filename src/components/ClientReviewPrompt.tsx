import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewModal } from '@/components/ReviewModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompletedBooking {
  id: string;
  stylist_id: string;
  service: string;
  scheduled_at: string;
  stylist_profile?: {
    full_name: string;
  };
  has_review: boolean;
}

export const ClientReviewPrompt = () => {
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompletedBookings();
  }, []);

  const fetchCompletedBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les réservations terminées sans avis
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          stylist_id,
          service,
          scheduled_at,
          reviews!left(id)
        `)
        .eq('client_id', user.id)
        .eq('status', 'completed')
        .gte('scheduled_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Derniers 30 jours
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils des stylistes
      const stylistIds = [...new Set(bookings?.map(b => b.stylist_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', stylistIds);

      // Enrichir les données et filtrer ceux sans avis
      const enrichedBookings = bookings
        ?.map(booking => ({
          ...booking,
          stylist_profile: profiles?.find(p => p.user_id === booking.stylist_id),
          has_review: booking.reviews && Array.isArray(booking.reviews) && booking.reviews.length > 0
        }))
        .filter(booking => !booking.has_review) || [];

      setCompletedBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching completed bookings:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger vos prestations terminées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
    fetchCompletedBookings(); // Rafraîchir la liste
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Évaluez vos prestations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedBookings.length === 0) {
    return null; // Ne pas afficher si aucune prestation à évaluer
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Évaluez vos prestations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Partagez votre expérience et aidez d'autres clients à choisir leur styliste
          </p>
          
          {completedBookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="font-medium">
                    {booking.stylist_profile?.full_name || 'Styliste'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Service : {booking.service}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date : {new Date(booking.scheduled_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setIsReviewModalOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Laisser un avis
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleReviewSubmitted}
          bookingId={selectedBooking.id}
          stylistId={selectedBooking.stylist_id}
        />
      )}
    </>
  );
};