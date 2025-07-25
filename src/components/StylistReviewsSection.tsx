import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const StylistReviewsSection = () => {
  const { user } = useAuth();
  const { reviews, loading } = useReviews(user?.id);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Mes avis clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Mes avis clients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium">Note moyenne</p>
            <p className="text-sm text-muted-foreground">
              Basée sur {reviews.length} avis
            </p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-4 space-y-3"
                data-cy="review-item"
              >
                <div className="flex justify-between items-start">
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
                  <Badge variant="secondary">
                    {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                  </Badge>
                </div>
                
                {review.booking && (
                  <div className="text-sm text-muted-foreground">
                    Service : {review.booking.service}
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun avis reçu pour le moment</p>
            <p className="text-sm mt-1">
              Les avis de vos clients apparaîtront ici après validation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};