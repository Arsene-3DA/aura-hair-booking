import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Star, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReviewModal } from '@/components/ReviewModal';

const ReviewsPage = () => {
  const { user } = useAuth();
  const { reviews, loading, updateReview, deleteReview } = useReviews(user?.id);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const handleEdit = (review: any) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
  };

  const handleSaveEdit = async () => {
    if (!editingReview || !editRating) return;
    
    try {
      await updateReview(editingReview, editRating, editComment || undefined);
      setEditingReview(null);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mes avis</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les avis que vous avez laissés sur vos prestations
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} data-cy="review-item">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium" data-cy="review-stars">
                      {review.rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(review)}
                      data-cy="edit-review-button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" data-cy="delete-review-button">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'avis</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(review.id)}
                            data-cy="confirm-delete-review"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {review.booking && (
                  <div className="text-sm text-muted-foreground mb-3">
                    Service : {review.booking.service} • {format(new Date(review.booking.scheduled_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </div>
                )}
                
                {review.comment && (
                  <div className="bg-muted/50 rounded p-3" data-cy="review-text">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucun avis</h3>
            <p className="text-muted-foreground">
              Vous n'avez pas encore laissé d'avis sur vos prestations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <ReviewModal
          isOpen={true}
          onClose={() => setEditingReview(null)}
          bookingId=""
          stylistId=""
        />
      )}
    </div>
  );
};

export default ReviewsPage;