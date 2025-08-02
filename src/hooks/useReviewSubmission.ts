import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReviewData {
  id: string;
  reservation_id: string;
  client_id: string;
  professional_id: string;
  status: string;
  created_at: string;
  client_name?: string;
  professional_name?: string;
  service_name?: string;
  scheduled_at?: string;
}

export const useReviewSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const { toast } = useToast();

  const getReviewByToken = async (token: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_review_by_token', {
        token: token
      });

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "❌ Lien invalide",
          description: "Ce lien d'évaluation est invalide ou a expiré.",
          variant: "destructive",
        });
        return null;
      }

      setReviewData(data[0]);
      return data[0];
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible de charger les données d'évaluation",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (token: string, rating: number, comment: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('submit_review', {
        token: token,
        rating: rating,
        comment_text: comment
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (result?.success) {
        toast({
          title: "✅ Merci !",
          description: result.message || "Votre évaluation a été envoyée avec succès.",
        });
        return true;
      } else {
        toast({
          title: "❌ Erreur",
          description: result?.error || "Impossible d'envoyer votre évaluation",
          variant: "destructive",
        });
        return false;
      }
    } catch (err: any) {
      toast({
        title: "❌ Erreur",
        description: err.message || "Impossible d'envoyer votre évaluation",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    reviewData,
    getReviewByToken,
    submitReview
  };
};