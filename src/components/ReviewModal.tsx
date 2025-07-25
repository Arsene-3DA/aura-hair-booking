import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  stylistId: string;
  stylistName?: string;
}

export const ReviewModal = ({ isOpen, onClose, bookingId, stylistId, stylistName }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { user } = useAuth();
  const { createReview } = useReviews(user?.id);

  const handleSubmit = async () => {
    if (!rating || !user?.id) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Utilisateur non connecté');

      // Récupérer les infos du booking pour obtenir le stylist_id
      const { data: booking } = await supabase
        .from('bookings')
        .select('stylist_id')
        .eq('id', bookingId)
        .single();

      if (!booking) throw new Error('Réservation non trouvée');

      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          client_id: authUser.id,
          stylist_id: booking.stylist_id,
          rating,
          comment: comment.trim() || null,
          is_approved: false // Nécessite une modération
        });

      if (error) throw error;

      await createReview(bookingId, rating, comment || undefined);
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-cy="review-modal">
        <DialogHeader>
          <DialogTitle>
            {stylistName ? `Évaluer ${stylistName}` : 'Évaluez votre prestation'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Rating Stars */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Quelle note donnez-vous à cette prestation ?
            </p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  data-cy={`star-${star}`}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium">
              Commentaire (optionnel)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="mt-2"
              rows={4}
              data-cy="review-comment"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || isSubmitting}
              className="flex-1"
              data-cy="submit-review-button"
            >
              {isSubmitting ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};