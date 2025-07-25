import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  is_approved: boolean;
  stylist_id: string;
  client_id: string;
  stylist_profile?: {
    full_name: string;
  };
}

export const AdminReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('is_approved', false);
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data: reviewsData, error } = await query;
      if (error) throw error;

      // Récupérer les profils des stylistes séparément
      const stylistIds = [...new Set(reviewsData?.map(r => r.stylist_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', stylistIds);

      // Enrichir les avis avec les noms des stylistes
      const enrichedReviews = reviewsData?.map(review => ({
        ...review,
        stylist_profile: profilesData?.find(p => p.user_id === review.stylist_id)
      })) || [];

      setReviews(enrichedReviews);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: isApproved ? "✅ Avis approuvé" : "❌ Avis rejeté",
        description: isApproved 
          ? "L'avis est maintenant visible publiquement"
          : "L'avis a été rejeté et ne sera pas visible"
      });

      fetchReviews();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour l'avis",
        variant: "destructive"
      });
    }
  };

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

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        Approuvé
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
        En attente
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestion des Avis</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              En attente
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              Approuvés
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tous
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun avis à afficher</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Styliste</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    {review.stylist_profile?.full_name || 'Styliste inconnu'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {review.comment ? (
                      <div className="truncate">
                        {review.comment.length > 50
                          ? `${review.comment.substring(0, 50)}...`
                          : review.comment
                        }
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Pas de commentaire</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(review.is_approved)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!review.is_approved && (
                        <Button
                          size="sm"
                          onClick={() => updateReviewStatus(review.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {review.is_approved && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateReviewStatus(review.id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Modal de détail */}
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Détail de l'avis</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Styliste</label>
                  <p>{selectedReview.stylist_profile?.full_name || 'Styliste inconnu'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Note</label>
                  <div className="flex gap-1 mt-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p>{new Date(selectedReview.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedReview.is_approved)}
                  </div>
                </div>
                {selectedReview.comment && (
                  <div>
                    <label className="text-sm font-medium">Commentaire</label>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm leading-relaxed">
                      {selectedReview.comment}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {!selectedReview.is_approved ? (
                    <Button
                      onClick={() => updateReviewStatus(selectedReview.id, true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => updateReviewStatus(selectedReview.id, false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedReview(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};