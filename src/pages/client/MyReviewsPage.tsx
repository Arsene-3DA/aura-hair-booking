import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const { reviews, loading } = useReviews(user?.id);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes avis</h1>
        <p className="text-muted-foreground">
          Les avis que vous avez laissés après vos prestations
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <Badge variant="secondary">
                    {format(new Date(review.created_at), 'dd MMM yyyy', { locale: fr })}
                  </Badge>
                </div>
                
                {review.booking && (
                  <div className="text-sm text-muted-foreground mb-2">
                    Service : {review.booking.service}
                  </div>
                )}
                
                {review.comment && (
                  <div className="bg-muted/50 rounded p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun avis</h3>
              <p className="text-muted-foreground">
                Vos avis apparaîtront ici après vos prestations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}