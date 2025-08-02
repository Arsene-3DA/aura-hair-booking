import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviewSubmission } from '@/hooks/useReviewSubmission';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ReviewPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loading, reviewData, getReviewByToken, submitReview } = useReviewSubmission();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      getReviewByToken(token);
    } else {
      navigate('/');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    if (!token) return;

    const success = await submitReview(token, rating, comment);
    if (success) {
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Lien invalide</h2>
            <p className="text-muted-foreground mb-4">
              Ce lien d'évaluation est invalide ou a expiré.
            </p>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Merci !</h2>
            <p className="text-muted-foreground mb-4">
              Votre évaluation a été envoyée avec succès.
            </p>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Évaluez votre prestation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations sur la réservation */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Détails de votre rendez-vous</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Professionnel :</strong> {reviewData.professional_name}</p>
                <p><strong>Service :</strong> {reviewData.service_name}</p>
                {reviewData.scheduled_at && (
                  <p><strong>Date :</strong> {format(new Date(reviewData.scheduled_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Système de notation par étoiles */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quelle note donnez-vous à cette prestation ? *
                </label>
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={cn(
                        "p-1 rounded transition-colors",
                        "hover:bg-muted"
                      )}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoveredRating || rating) >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    {rating} étoile{rating > 1 ? 's' : ''} sélectionnée{rating > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Commentaire */}
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Partagez votre expérience (optionnel)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Décrivez votre expérience, ce qui vous a plu, vos suggestions..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/500 caractères
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={rating === 0 || loading}
                  className="flex-1"
                >
                  {loading ? 'Envoi...' : 'Envoyer mon évaluation'}
                </Button>
              </div>
            </form>

            <div className="text-xs text-muted-foreground text-center">
              Cette évaluation ne pourra pas être modifiée après envoi.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewPage;